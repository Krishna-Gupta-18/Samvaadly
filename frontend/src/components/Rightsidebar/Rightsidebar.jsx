import React from 'react'
import './Rightsidebar.css'
import assets from '../../assets/assets'
import { useAppContext } from '../../context/appcontext'

const Rightsidebar = () => {
  const { currentChat, currentUser } = useAppContext()

  const handleRemoveFriend = async (friendEmail) => {
    try {
      const response = await fetch('http://localhost:5000/api/remove-friend', {
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
        // Refresh friends list or handle UI update
        window.location.reload() // Simple refresh for now
      }
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

  const fetchUserProfile = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${email}?t=${Date.now()}`)
      const user = await response.json()
      return user
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const [currentChatUser, setCurrentChatUser] = React.useState(null)

  React.useEffect(() => {
    if (currentChat) {
      fetchUserProfile(currentChat).then(setCurrentChatUser)
    } else {
      setCurrentChatUser(null)
    }
  }, [currentChat])

  return (
    <div className='rs'>
      <div className="rs-profile">
        <img src={currentChatUser?.profileImage || assets.avatar_icon} alt="Profile" />
        <h3>{currentChatUser?.username || currentChat || 'Bot'}</h3>
        <p>Online</p>
      </div>
      <div className="rs-media">
        <p>Media</p>
        <div className="media-gallery">
          <img src={assets.img1} alt="Media 1" />
          <img src={assets.img2} alt="Media 2" />
        </div>
      </div>
    </div>
  )
}

export default Rightsidebar
