import React, { useState } from 'react'
import './Chat.css'
import Leftsidebar from '../../components/Leftsidebar/Leftsidebar'
import Chatbox from '../../components/Chatbox/Chatbox'
import Rightsidebar from '../../components/Rightsidebar/Rightsidebar'

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className='chat'>
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <Leftsidebar className={sidebarOpen ? 'open' : ''} onClose={toggleSidebar} />
      <Chatbox onToggleSidebar={toggleSidebar} />
      <Rightsidebar />
    </div>
  )
}

export default Chat
