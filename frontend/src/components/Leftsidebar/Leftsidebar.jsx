import React, { useState, useEffect } from 'react'
import './Leftsidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/appcontext'

const Leftsidebar = ({ className, onClose }) => {
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [friends, setFriends] = useState([])
  const navigate = useNavigate()
  const { currentUser, setMessages, fetchMessages, setCurrentChat } = useAppContext()

  useEffect(() => {
    if (currentUser) {
      fetchFriends()
      fetchAllUsers()
    }
  }, [currentUser, friends.length]) // Add friends.length to dependency to refresh when friends change

  const fetchFriends = async () => {
    try {
      const response = await fetch(`https://samvaadly.onrender.com/api/friends/${currentUser.email}`)
      const data = await response.json()
      setFriends(data)
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('https://samvaadly.onrender.com/api/users')
      const data = await response.json()
      setAllUsers(data.filter(user => user.email !== currentUser.email))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleAddFriend = async (friendEmail) => {
    try {
      const response = await fetch('https://samvaadly.onrender.com/api/add-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: currentUser.email,
          friendEmail,
        }),
      })
      if (response.ok) {
        setAllUsers(prev => prev.filter(user => user.email !== friendEmail)) // Remove immediately
        fetchFriends()
        fetchAllUsers()
        setCurrentChat(friendEmail)
        fetchMessages(currentUser.email, friendEmail)
        onClose() // Close sidebar on mobile after adding friend
      }
    } catch (error) {
      console.error('Error adding friend:', error)
    }
  }

  const filteredUsers = allUsers.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleMenuClick = () => {
    setShowMenu(!showMenu)
  }

  const handleProfileUpdate = () => {
    navigate('/Profileupdate')
    setShowMenu(false)
    onClose() // Close sidebar on mobile after navigation
  }

  const handleChatWithFriend = (friendEmail) => {
    setCurrentChat(friendEmail)
    fetchMessages(currentUser.email, friendEmail)
    onClose() // Close sidebar on mobile after selecting chat
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
    setShowMenu(false)
    onClose() // Close sidebar on mobile after logout
  }

  return (
    <div className={`ls ${className}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="Logo" />
          <div className="menu" onClick={handleMenuClick}>
            <img src={assets.menu_icon} alt="Menu" />
            {showMenu && (
              <div className="menu-dropdown">
                <div className="menu-item" onClick={handleProfileUpdate}>
                  <img src={assets.avatar_icon} alt="Profile" className="menu-icon" />
                  Update Profile
                </div>
                <div className="menu-item" onClick={handleLogout}>
                  <img src={assets.arrow_icon} alt="Logout" className="menu-icon" />
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search" />
          <input
            type="text"
            placeholder="Search here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="ls-list">
        {friends.map(friend => (
          <div key={friend.email} className="friends" onClick={() => handleChatWithFriend(friend.email)}>
            <img src={friend.profileImage || assets.avatar_icon} alt={friend.username || friend.email} />
            <div>
              <p>{friend.username || friend.email}</p>
              <span className="online">Online</span>
            </div>
          </div>
        ))}
        {filteredUsers.filter(user => !friends.some(friend => friend.email === user.email)).map(user => (
          <div key={user.email} className="friends">
            <img src={user.profileImage || assets.avatar_icon} alt={user.username || user.email} />
            <div>
              <p>{user.username || user.email}</p>
              <button className="add-friend-btn" onClick={() => handleAddFriend(user.email)}>Chat</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leftsidebar
