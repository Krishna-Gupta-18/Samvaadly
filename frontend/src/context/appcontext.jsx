import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io('https://samvaadly.onrender.com');
      setSocket(newSocket);

      newSocket.emit('join', currentUser.email);

      return () => newSocket.close();
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => {
          const receiver = message.sender === currentUser.email ? message.receiver : message.sender;
          const chatKey = receiver;
          return {
            ...prevMessages,
            [chatKey]: [...(prevMessages[chatKey] || []), message]
          };
        });
      });
    }
  }, [socket, currentUser]);

  const joinRoom = (userId) => {
    if (socket) {
      socket.emit('join', userId);
    }
  };

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('sendMessage', data);
    }
  };

  const fetchMessages = async (sender, receiver) => {
    try {
      const response = await fetch(`https://samvaadly.onrender.com/api/messages/${sender}/${receiver}`);
      const data = await response.json();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [receiver]: data
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(`https://samvaadly.onrender.com/api/friends/${currentUser.email}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setFriends(data.filter(friend => friend.email && !friend.email.includes('bot')));
        } else {
          setFriends([]);
        }
      } else {
        console.error('Failed to fetch friends:', response.status);
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('https://samvaadly.onrender.com/api/users');
      const data = await response.json();
      setAllUsers(data.filter(user => user.email !== currentUser.email && !user.email.includes('bot')));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
      fetchAllUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      socket.on('userSignedUp', () => {
        fetchAllUsers();
      });
      socket.on('friendAdded', () => {
        fetchFriends();
        fetchAllUsers();
      });
    }
  }, [socket, currentUser]);

  const value = {
    socket,
    currentUser,
    setCurrentUser,
    messages,
    setMessages,
    currentChat,
    setCurrentChat,
    joinRoom,
    sendMessage,
    fetchMessages,
    allUsers,
    setAllUsers,
    friends,
    setFriends,
    fetchFriends,
    fetchAllUsers,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
