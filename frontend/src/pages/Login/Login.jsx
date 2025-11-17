import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: false
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    if (isLogin) {
      try {
        const response = await fetch('https://samvaadly.onrender.com/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })
        const data = await response.json()
        if (response.ok) {
          setMessage('Login successful!')
          // Store user session and redirect
          localStorage.setItem('user', JSON.stringify({ email: formData.email }))
          window.location.href = '/Chat'
        } else {
          setMessage(data.error || 'Login failed')
        }
      } catch (error) {
        setMessage('Network error. Please try again.')
      }
    } else {
      if (!formData.agreeToTerms) {
        setMessage('You must agree to the terms and conditions.')
        setLoading(false)
        return
      }
      try {
        const response = await fetch('https://samvaadly.onrender.com/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })
        const data = await response.json()
        if (response.ok) {
          setMessage('Signup successful! You can now login.')
          setIsLogin(true)
        } else {
          setMessage(data.error || 'Signup failed')
        }
      } catch (error) {
        setMessage('Network error. Please try again.')
      }
    }
    setLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      username: '',
      email: '',
      password: '',
      agreeToTerms: false
    })
  }

  return (
    <div className="login">
      <div className="login-container">
        <img src={assets.logo_big} alt="Samvaadly Logo" className="Logo" />
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          {!isLogin && (
            <>
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
            </>
          )}
          <label className="form-label" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label className="form-label" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <div className="form-checkbox-container">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                className="form-checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <label className="form-checkbox-label" htmlFor="agreeToTerms">
                I agree to the <a href="#" className="terms-link">Terms and Conditions</a>
              </label>
            </div>
          )}
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
          <p className="toggle-mode" onClick={toggleMode}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </p>
        </form>
      </div>
      <footer className="login-footer">
        <p>&copy; 2025 Samvaadly. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Login

