import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login/Login'
import Chat from './pages/Chat/Chat'
import Profileupdate from './pages/Profileupdate/Profileupdate'
import { AppContextProvider } from './context/appcontext'


const App = () => {
  return (
    <AppContextProvider>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/Chat' element={<Chat/>}/>
        <Route path='/Profileupdate' element={<Profileupdate/>}/>
      </Routes>
    </AppContextProvider>
  )
}

export default App
