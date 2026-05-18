import { useMemo, useState } from 'react'

const GOLD = '#d4af37'

type DriverStatus = 'idle' | 'accepted' | 'cancelled'

export default function Driver() {
  const [tripCode, setTripCode] = useState('')
  const [status, setStatus] = useState<DriverStatus>('idle')
  const [message, setMessage] = useState('Esperando viaje')

  const validCode = useMemo(() => /^\d{5}$/.test(tripCode), [tripCode])

  const acceptRide = () => {
    if (!validCode) {
      setMessage('Código inválido. Debe tener 5 dígitos.')
      return
    }
    setStatus('accepted')
    setMessage('Viaje aceptado. GPS automático activo.')
  }

  const cancelRide = () => {
    if (!validCode) {
      setMessage('Ingresa código válido para anular.')
      return
    }
    setStatus('cancelled')
    setMessage('Viaje anulado por driver.')
  }

  return <main style={{ background: '#111214', color: 'white', minHeight: '100vh', padding: '28px 16px', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ maxWidth: 560, margin: '0 auto', border: '1px solid rgba(212,175,55,.35)', borderRadius: 14, padding: 16 }}>
      <h1 style={{ marginTop: 0, color: GOLD }}>Driver</h1>
      <p>Estado: <strong>{status}</strong></p>
      <input value={tripCode} onChange={(e) => setTripCode(e.target.value)} placeholder='Código de viaje (5 dígitos)' style={inputStyle} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button type='button' onClick={acceptRide} style={buttonStyle}>Aceptar viaje</button>
        <button type='button' onClick={cancelRide} style={{ ...buttonStyle, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,.25)' }}>Anular viaje</button>
      </div>
      <p style={{ marginBottom: 0, color: GOLD }}>{message}</p>
    </section>
  </main>
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,.2)',
  padding: '10px 12px',
  background: '#0b0b0b',
  color: 'white',
  fontFamily: 'Arial, sans-serif',
}

const buttonStyle: React.CSSProperties = {
  background: GOLD,
  color: '#111214',
  border: 'none',
  borderRadius: 10,
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer',
}
