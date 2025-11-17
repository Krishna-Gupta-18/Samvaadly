const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://samvaadly-chat-app.onrender.com/",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Backend is running!');
});


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Krishna:Cloud07@cluster0.adgwxrs.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  friends: [{ type: String }], // Array of friend emails
});

const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String },
  image: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:sender/:receiver', async (req, res) => {
  const { sender, receiver } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/:email', async (req, res) => {
  const { email } = req.params;
  const { username, bio, profileImage } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { username, bio, profileImage },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/add-friend', async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  try {
    const user = await User.findOne({ email: userEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!user || !friend) return res.status(404).json({ error: 'User or friend not found' });

    if (!user.friends.includes(friendEmail)) {
      user.friends.push(friendEmail);
      await user.save();
    }

    if (!friend.friends.includes(userEmail)) {
      friend.friends.push(userEmail);
      await friend.save();
    }

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/friends/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email }).populate('friends', 'email username profileImage');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email username profileImage');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/remove-friend', async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  try {
    const user = await User.findOne({ email: userEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!user || !friend) return res.status(404).json({ error: 'User or friend not found' });

    user.friends = user.friends.filter(email => email !== friendEmail);
    friend.friends = friend.friends.filter(email => email !== userEmail);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('sendMessage', async (data) => {
    const { sender, receiver, text, image } = data;
    const message = new Message({ sender, receiver, text, image });
    await message.save();

    // Emit to receiver
    io.to(receiver).emit('receiveMessage', message);
    // Also emit back to sender for confirmation
    io.to(sender).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


