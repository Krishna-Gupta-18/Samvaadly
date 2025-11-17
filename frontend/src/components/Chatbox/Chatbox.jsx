import React, { useState, useEffect } from 'react'
import './Chatbox.css'
import assets from '../../assets/assets'
import { useAppContext } from '../../context/appcontext'

const Chatbox = ({ onToggleSidebar }) => {
  const { messages, setMessages, sendMessage, fetchMessages, currentUser, currentChat } = useAppContext()
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentChatUser, setCurrentChatUser] = useState(null)

  useEffect(() => {
    if (currentUser && currentChat) {
+      fetchMessages(currentUser.email, currentChat)
    }
  }, [currentUser, currentChat, fetchMessages])

  useEffect(() => {
    const fetchUserProfile = async (email) => {
      try {
        const response = await fetch(`https://samvaadly.onrender.com/api/user/${email}?t=${Date.now()}`)
        const user = await response.json()
        setCurrentChatUser(user)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setCurrentChatUser(null)
      }
    }

    if (currentChat) {
      fetchUserProfile(currentChat)
    } else {
      setCurrentChatUser(null)
    }
  }, [currentChat])

  const handleSend = () => {
    if ((newMessage.trim() || selectedImage) && currentUser && currentChat) {
      const messageData = {
        sender: currentUser.email,
        receiver: currentChat,
        text: newMessage,
        image: selectedImage,
      }
      sendMessage(messageData)
      setNewMessage('')
      setSelectedImage(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className='chat-box'>
      <div className="chat-user">
        <img src={assets.menu_icon} alt="Menu" className="mobile-menu" onClick={onToggleSidebar} style={{ width: '24px', height: '24px', marginRight: '10px', cursor: 'pointer', display: 'none' }} />
        <img src={currentChatUser?.profileImage || assets.avatar_icon} alt="User" />
        <p>{currentChatUser?.username || currentUser?.username || 'You'} </p>
        <img src={assets.help_icon} className="help" alt="Help" />
      </div>
      <div className="chat-msg">
        {currentChat ? (
+          (messages[currentChat] || []).map(msg => (
+            <div key={msg._id || msg.id} className={`msg ${msg.sender === currentUser?.email ? 's-msg' : 'r-msg'}`}>
+              {msg.image && <img src={msg.image} alt="Sent" className="msg-image" />}
+              <p className="msg-text">{msg.text}</p>
+              <span className="msg-time">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.time}</span>
+            </div>
+          )
+        ) : (
+          <div className="no-chat-message">
+            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Send a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <label htmlFor="imageInput" className="image-upload-label">
          <img src={assets.gallery_icon} alt="Upload Image" className="upload-icon" />
        </label>
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <img src={assets.send_button} alt="Send" onClick={handleSend} />
      </div>
    </div>
  )
}

export default Chatbox



