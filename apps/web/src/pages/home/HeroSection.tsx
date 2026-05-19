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

const sectionWrap: React.CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  padding: '28px 16px',
}

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
      <header style={{ position: 'sticky', top: 10, zIndex: 40, padding: '0 10px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', border: '1px solid rgba(212,175,55,.22)', borderRadius: 16, background: 'rgba(18,20,24,.68)', backdropFilter: 'blur(12px)' }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 20, opacity: 0.95 }} />
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['Inicio', 'Reservar', 'Calcular', 'Contacto'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ color: '#f5f5f5', textDecoration: 'none', padding: '7px 10px', borderRadius: 999, fontSize: 12, letterSpacing: '.2px' }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="inicio" style={{ ...sectionWrap, paddingTop: 58 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(212,175,55,.22)', background: 'linear-gradient(120deg, rgba(17,18,20,.92), rgba(22,24,30,.82))' }}>
          <div style={{ minHeight: 440, backgroundImage: 'linear-gradient(100deg, rgba(11,12,14,.88) 20%, rgba(17,20,25,.74) 46%, rgba(20,22,26,.78) 100%), url(/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }}>
            <div style={{ maxWidth: 640, padding: '44px 28px' }}>
              <p style={{ margin: 0, color: 'rgba(212,175,55,.92)', letterSpacing: '1.5px', fontSize: 12, textTransform: 'uppercase' }}>LVTransport.be · Premium Hybrid</p>
              <h1 style={{ margin: '12px 0', fontSize: 'clamp(30px,6vw,54px)', lineHeight: 1.06 }}>Premium hybrid mobility in Antwerpen</h1>
              <p style={{ color: '#d5d7dc', maxWidth: 560, margin: '0 0 20px' }}>Quiet rides. Real-time tracking. Always on time.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="#reservar" style={{ background: gold, color: charcoal, fontWeight: 700, textDecoration: 'none', borderRadius: 12, padding: '11px 16px' }}>Reservar</a>
                <a href="#calcular" style={{ border: '1px solid rgba(212,175,55,.42)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '11px 16px', background: 'rgba(20,21,24,.48)' }}>Calcular precio</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calcular" style={sectionWrap}>
        <h2 style={{ marginTop: 0 }}>Smart calculator</h2>
        <div style={{ display: 'grid', gap: 10, maxWidth: 650, border: '1px solid rgba(212,175,55,.2)', borderRadius: 18, padding: 16, background: 'rgba(17,19,23,.7)', backdropFilter: 'blur(8px)' }}>
          <input placeholder="Origen" value={calc.origin} onChange={(e) => setCalc((p) => ({ ...p, origin: e.target.value }))} style={inputStyle} />
          <input placeholder="Destino" value={calc.destination} onChange={(e) => setCalc((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} />
          <select value={calc.service} onChange={(e) => setCalc((p) => ({ ...p, service: e.target.value }))} style={inputStyle}>
            {serviceTypes.map((service) => <option key={service.key} value={service.key}>{service.label}</option>)}
          </select>
          <p style={{ margin: 0, color: gold }}>Precio estimado: €{estimate.total.toFixed(2)} · ~{estimate.pseudoKm} km</p>
          <button type="button" onClick={handleReserveEstimate} style={goldButton}>Reservar este viaje</button>
        </div>
      </section>

      <section id="reservar" style={sectionWrap}>
        <h2>Reservar</h2>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: 10, maxWidth: 650 }}>
          <input placeholder="Nombre" value={booking.name} onChange={(e) => setBooking((p) => ({ ...p, name: e.target.value }))} style={inputStyle} required />
          <input placeholder="Teléfono" value={booking.phone} onChange={(e) => setBooking((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} required />
          <input placeholder="Origen" value={booking.origin} onChange={(e) => setBooking((p) => ({ ...p, origin: e.target.value }))} style={inputStyle} required />
          <input placeholder="Destino" value={booking.destination} onChange={(e) => setBooking((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} required />
          <input type="datetime-local" value={booking.datetime} onChange={(e) => setBooking((p) => ({ ...p, datetime: e.target.value }))} style={inputStyle} required />
          <textarea placeholder="Nota opcional" value={booking.note} onChange={(e) => setBooking((p) => ({ ...p, note: e.target.value }))} style={{ ...inputStyle, minHeight: 80 }} />
          <button type="submit" style={goldButton}>Enviar reserva</button>
        </form>
      </section>

      <section id="operaciones" style={sectionWrap}>
        <h2>Tracking operativo</h2>
        <div style={{ border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: 14, maxWidth: 760, marginBottom: 12, background: 'rgba(13,14,17,.82)' }}>
          <p style={{ margin: '0 0 8px', color: gold }}>Código 5 dígitos: 38052 · ETA: 12 min</p>
          <p style={{ margin: '0 0 8px' }}>Driver: Amine · Vehículo: BYD Hybrid · 1-TRP-204</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statusSteps.map((item, index) => <span key={item} style={{ border: '1px solid rgba(212,175,55,.3)', borderRadius: 999, padding: '6px 10px', background: index < 2 ? 'rgba(212,175,55,.14)' : 'transparent', fontSize: 12 }}>{item}</span>)}
          </div>
        </div>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(212,175,55,.22)', maxWidth: 760 }}>
          <iframe title="Antwerpen map" src="https://www.google.com/maps?q=Antwerpen&output=embed" width="100%" height="320" style={{ border: 0, filter: 'grayscale(.92)' }} />
        </div>
      </section>

      <section id="contacto" style={{ ...sectionWrap, paddingBottom: 80 }}>
        <h2>Reseñas y contacto</h2>
        <div style={{ maxWidth: 620, display: 'grid', gap: 10, marginBottom: 18 }}>
          <select value={review.stars} onChange={(e) => setReview((p) => ({ ...p, stars: Number(e.target.value) }))} style={inputStyle}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}
          </select>
          <textarea placeholder="Comentario corto" value={review.comment} onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))} style={{ ...inputStyle, minHeight: 80 }} />
          <button type="button" style={goldButton} onClick={() => setReviewSent(true)}>Enviar</button>
          {reviewSent && <small style={{ color: gold }}>Gracias. Reseña enviada localmente.</small>}
        </div>
        <p style={{ color: '#d1d5db' }}>Contacto operativo: +32 400 00 00 00 · support@lvtransport.be</p>
      </section>

      <aside style={{ position: 'fixed', bottom: 16, right: 16, width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(212,175,55,.52)', background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,.35), rgba(17,18,20,.96))', boxShadow: '0 0 18px rgba(212,175,55,.32)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#f6ebc7', zIndex: 35 }}>
        M
      </aside>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.16)',
  background: 'rgba(14,15,18,.92)',
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
