import { useMemo, useState } from 'react'

const charcoal = '#111214'
const gold = '#d4af37'

const serviceTypes = [
  { key: 'standard', label: 'Standard', base: 24, perKm: 1.8 },
  { key: 'business', label: 'Business', base: 35, perKm: 2.3 },
  { key: 'van', label: 'Van', base: 42, perKm: 2.8 },
]

const statusSteps = [
  'Reserva confirmada',
  'Driver en camino',
  'Llegó',
  'Viaje completado',
] as const

export default function HeroSection() {
  const [calc, setCalc] = useState({ origin: '', destination: '', service: serviceTypes[0].key })
  const [booking, setBooking] = useState({
    name: '',
    phone: '',
    origin: '',
    destination: '',
    datetime: '',
    note: '',
  })
  const [review, setReview] = useState({ stars: 5, comment: '' })
  const [reviewSent, setReviewSent] = useState(false)

  const estimate = useMemo(() => {
    const service = serviceTypes.find((item) => item.key === calc.service) ?? serviceTypes[0]
    const distanceSignal = Math.max(calc.origin.length + calc.destination.length, 10)
    const pseudoKm = Math.min(70, Math.round(distanceSignal / 2.7))
    const total = service.base + pseudoKm * service.perKm
    return { total, pseudoKm, label: service.label }
  }, [calc])

  const handleReserveEstimate = () => {
    setBooking((prev) => ({
      ...prev,
      origin: calc.origin || prev.origin,
      destination: calc.destination || prev.destination,
      note: prev.note || `Servicio ${estimate.label} · €${estimate.total.toFixed(2)} estimado`,
    }))
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main style={{ background: '#090a0b', color: 'white', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(9,10,11,.96)', borderBottom: '1px solid rgba(212,175,55,.2)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <strong style={{ letterSpacing: 1.2 }}>LV Transport</strong>
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Inicio', 'Calcular', 'Reservar', 'Mis viajes', 'GPS', 'Reseñas', 'Contacto'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{ color: '#f5f5f5', textDecoration: 'none', padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,.12)', fontSize: 13 }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="inicio" style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 16px 28px' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(30px,7vw,56px)', lineHeight: 1.05 }}>Tu traslado en Antwerpen, claro y sin fricción.</h1>
        <p style={{ color: '#d1d5db', maxWidth: 640 }}>Reserva rápido, seguimiento simple y operación real para Founder, MoniRide y Driver.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="#reservar" style={{ background: gold, color: charcoal, fontWeight: 700, textDecoration: 'none', borderRadius: 10, padding: '11px 16px' }}>Reservar</a>
          <a href="#calcular" style={{ border: '1px solid rgba(255,255,255,.2)', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '11px 16px' }}>Calcular precio</a>
        </div>
      </section>

      <section id="calcular" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h2>Calcular</h2>
        <div style={{ display: 'grid', gap: 10, maxWidth: 620 }}>
          <input placeholder="Origen" value={calc.origin} onChange={(e) => setCalc((p) => ({ ...p, origin: e.target.value }))} style={inputStyle} />
          <input placeholder="Destino" value={calc.destination} onChange={(e) => setCalc((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} />
          <select value={calc.service} onChange={(e) => setCalc((p) => ({ ...p, service: e.target.value }))} style={inputStyle}>
            {serviceTypes.map((service) => <option key={service.key} value={service.key}>{service.label}</option>)}
          </select>
          <p style={{ margin: 0, color: gold }}>Precio estimado: €{estimate.total.toFixed(2)} · ~{estimate.pseudoKm} km</p>
          <button type="button" onClick={handleReserveEstimate} style={goldButton}>Reservar este viaje</button>
        </div>
      </section>

      <section id="reservar" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h2>Reservar</h2>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: 10, maxWidth: 620 }}>
          <input placeholder="Nombre" value={booking.name} onChange={(e) => setBooking((p) => ({ ...p, name: e.target.value }))} style={inputStyle} required />
          <input placeholder="Teléfono" value={booking.phone} onChange={(e) => setBooking((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} required />
          <input placeholder="Origen" value={booking.origin} onChange={(e) => setBooking((p) => ({ ...p, origin: e.target.value }))} style={inputStyle} required />
          <input placeholder="Destino" value={booking.destination} onChange={(e) => setBooking((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} required />
          <input type="datetime-local" value={booking.datetime} onChange={(e) => setBooking((p) => ({ ...p, datetime: e.target.value }))} style={inputStyle} required />
          <textarea placeholder="Nota opcional" value={booking.note} onChange={(e) => setBooking((p) => ({ ...p, note: e.target.value }))} style={{ ...inputStyle, minHeight: 80 }} />
          <button type="submit" style={goldButton}>Enviar reserva</button>
        </form>
      </section>

      <section id="mis-viajes" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h2>Mis viajes</h2>
        <div style={{ border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: 14, maxWidth: 620 }}>
          <p style={{ margin: '0 0 8px', color: gold }}>Código 5 dígitos: 38052 · ETA: 12 min</p>
          <p style={{ margin: '0 0 8px' }}>Driver: Amine · Vehículo: Mercedes V-Class · 1-TRP-204</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statusSteps.map((item, index) => <span key={item} style={{ border: '1px solid rgba(212,175,55,.3)', borderRadius: 999, padding: '6px 10px', background: index < 2 ? 'rgba(212,175,55,.14)' : 'transparent', fontSize: 12 }}>{item}</span>)}
          </div>
        </div>
      </section>

      <section id="gps" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h2>GPS</h2>
        <p style={{ color: '#d1d5db' }}>Driver en camino · ETA visible · seguimiento simple.</p>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(212,175,55,.22)', maxWidth: 760 }}>
          <iframe title="Antwerpen map" src="https://www.google.com/maps?q=Antwerpen&output=embed" width="100%" height="320" style={{ border: 0, filter: 'grayscale(.92)' }} />
        </div>
      </section>

      <section id="reseñas" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h2>Reseñas</h2>
        <div style={{ maxWidth: 620, display: 'grid', gap: 10 }}>
          <select value={review.stars} onChange={(e) => setReview((p) => ({ ...p, stars: Number(e.target.value) }))} style={inputStyle}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}
          </select>
          <textarea placeholder="Comentario corto" value={review.comment} onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))} style={{ ...inputStyle, minHeight: 80 }} />
          <button type="button" style={goldButton} onClick={() => setReviewSent(true)}>Enviar</button>
          {reviewSent && <small style={{ color: gold }}>Gracias. Reseña enviada localmente.</small>}
        </div>
      </section>

      <section id="contacto" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px 80px' }}>
        <p style={{ color: '#d1d5db' }}>Contacto operativo: +32 400 00 00 00 · support@lvtransport.be</p>
      </section>

      <aside style={{ position: 'fixed', bottom: 14, right: 14, background: '#151515', border: '1px solid rgba(212,175,55,.4)', borderRadius: 12, padding: '10px 12px', fontSize: 12 }}>
        <strong style={{ color: gold, display: 'block' }}>MoniRide</strong>
        <span style={{ display: 'block' }}>Listo · GPS activo · Driver en camino · Llegó</span>
      </aside>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.2)',
  background: '#0f1011',
  color: 'white',
  padding: '11px 12px',
  borderRadius: 10,
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'Arial, sans-serif',
}

const goldButton: React.CSSProperties = {
  background: gold,
  color: charcoal,
  border: 'none',
  borderRadius: 10,
  padding: '11px 14px',
  fontWeight: 700,
  cursor: 'pointer',
}
