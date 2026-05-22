import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import './styles/index.css'

import Home from './pages/Home'
import Admin from './pages/Admin'
import Driver from './pages/Driver'
import Booking from './pages/Booking'
import Founder from './pages/Founder'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/founder" element={<Founder />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

