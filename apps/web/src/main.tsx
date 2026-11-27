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
const RideAccess = React.lazy(() => import('./pages/RideAccess'))
const AdminAccess = React.lazy(() => import('./pages/OperationsAccess')
  .then(module => ({ default: module.AdminAccess })))
const acceptance = import.meta.env.MODE === 'staging' && import.meta.env.BASE_URL === '/aceptacion-lv/'
const DriverApplication = React.lazy(() => import('./pages/DriverApplication'))
const DriverAccess = React.lazy(() => import('./pages/OperationsAccess').then(module => ({ default: module.DriverAccess })))
const GovernanceAccess = React.lazy(() => import('./pages/OperationsAccess').then(module => ({ default: module.GovernanceAccess })))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {acceptance && <div className="bg-amber-300 px-4 py-2 text-center font-semibold text-zinc-950" role="status">
        Testomgeving · Stripe-testmodus
      </div>}
      <React.Suspense fallback={<p role="status">Laden…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminAccess />} />
        <Route path="/driver" element={<DriverAccess />} />
        <Route path="/driver/aanmelden" element={<DriverApplication />} />
        <Route path="/ride" element={<RideAccess />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/founder" element={<GovernanceAccess />} />
      </Routes>
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
)

