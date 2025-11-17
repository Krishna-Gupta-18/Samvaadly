import React, { useState, useEffect } from 'react'
import './Profileupdate.css'
import assets from '../../assets/assets'
import { useAppContext } from '../../context/appcontext'
import { useNavigate } from 'react-router-dom'

const Profileupdate = () => {
  const { currentUser, setCurrentUser } = useAppContext()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profileImage: null,
    profileImagePreview: null
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:5000/api/user/${currentUser.email}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            username: data.username || '',
            bio: data.bio || '',
            profileImage: null,
            profileImagePreview: data.profileImage || null
          })
        })
        .catch(err => console.error('Error fetching user data:', err))
    }
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: file,
          profileImagePreview: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:5000/api/user/${currentUser.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          profileImage: formData.profileImagePreview,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Profile updated successfully!')
        setCurrentUser({ ...currentUser, ...data })
        // Update localStorage to persist the updated user data
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }))
        setTimeout(() => navigate('/Chat'), 2000)
      } else {
        setMessage(data.error || 'Profile update failed')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="profile-update">
      <form className="profile-form" onSubmit={handleSubmit}>
        <h2>Update Profile</h2>

        <div className="profile-image-container">
          <label htmlFor="profileImage" className="profile-image-label">
            <img
              src={formData.profileImagePreview || assets.avatar_icon}
              alt="Profile Preview"
              className="profile-image-preview"
            />
            <div className="profile-image-overlay">
              <img src={assets.gallery_icon} alt="Upload" className="upload-icon" />
              <span>Change Image</span>
            </div>
          </label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <label className="form-label" htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          className="form-input"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label className="form-label" htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          className="form-textarea"
          value={formData.bio}
          onChange={handleChange}
          rows="4"
          placeholder="Tell us about yourself..."
        />

        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
      </form>
    </div>
  )
}

export default Profileupdate
