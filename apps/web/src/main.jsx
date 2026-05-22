import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div
      style={{
        background: '#050505',
        color: '#e5e5e5',
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'sans-serif'
      }}
    >
      <h1>LVTransport Operational Cognition</h1>

      <p>
        Operational memory runtime active.
      </p>

      <ul>
        <li>continuity engine</li>
        <li>lineage preservation</li>
        <li>operational cognition</li>
        <li>memory retrieval</li>
      </ul>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
