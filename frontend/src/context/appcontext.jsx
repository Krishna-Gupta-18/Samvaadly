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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io('http://localhost:5000');
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
      const response = await fetch(`http://localhost:5000/api/messages/${sender}/${receiver}`);
      const data = await response.json();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [receiver]: data
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

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
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
