import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import './styles/index.css'

import Home from './pages/PublicHome'
import Booking from './pages/PublicBooking'

// Keep authenticated operations and Firebase out of the initial public-page bundle.
const AdminAccess = React.lazy(() => import('./pages/OperationsAccess').then(module => ({ default: module.AdminAccess })))
const DriverAccess = React.lazy(() => import('./pages/OperationsAccess').then(module => ({ default: module.DriverAccess })))
const GovernanceAccess = React.lazy(() => import('./pages/OperationsAccess').then(module => ({ default: module.GovernanceAccess })))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback={<p role="status">Laden…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminAccess />} />
        <Route path="/driver" element={<DriverAccess />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/founder" element={<GovernanceAccess />} />
      </Routes>
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
)

