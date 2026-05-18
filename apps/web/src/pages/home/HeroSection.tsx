const gold = '#d4af37'
const apiBase = 'https://api.lvtransport.be'

const whatsappText = encodeURIComponent(
  'Hola LV Transport, quiero reservar un traslado. Recogida: __ / Destino: __ / Fecha y hora: __ / Pasajeros: __'
)

const services = [
  {
    title: 'Airport transfers',
    text: 'Traslados a Brussels Airport, Charleroi, Antwerp, Eindhoven, Schiphol y estaciones principales.',
  },
  {
    title: 'Private rides',
    text: 'Servicio privado en Bélgica para clientes, familias y viajes de trabajo con confirmación clara.',
  },
  {
    title: 'Business transport',
    text: 'Reservas para empresas, rutas recurrentes, seguimiento operativo y comunicación directa.',
  },
]

const steps = [
  'Envía tu recogida, destino, fecha y pasajeros.',
  'LV Transport confirma disponibilidad y precio.',
  'Recibes confirmación por WhatsApp o email.',
]

export default function HeroSection() {
  return (
    <main style={{ background: '#070707', color: 'white', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(7,7,7,.92)', borderBottom: '1px solid rgba(212,175,55,.18)', backdropFilter: 'blur(14px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${gold}`, display: 'grid', placeItems: 'center', color: gold, fontWeight: 900 }}>LV</span>
            <span>
              <strong style={{ display: 'block', letterSpacing: 1 }}>LV Transport</strong>
              <small style={{ color: '#a1a1aa' }}>Private transport Belgium</small>
            </span>
          </a>
          <nav style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#booking" style={{ color: '#080808', background: gold, borderRadius: 999, padding: '10px 15px', textDecoration: 'none', fontSize: 14, fontWeight: 900 }}>Book a ride</a>
            <a href="#services" style={{ color: '#e5e7eb', border: '1px solid rgba(255,255,255,.12)', borderRadius: 999, padding: '10px 15px', textDecoration: 'none', fontSize: 14, fontWeight: 800 }}>Services</a>
            <a href="#map" style={{ color: '#e5e7eb', border: '1px solid rgba(255,255,255,.12)', borderRadius: 999, padding: '10px 15px', textDecoration: 'none', fontSize: 14, fontWeight: 800 }}>Coverage</a>
            <a href={`https://wa.me/32400000000?text=${whatsappText}`} style={{ color: '#e5e7eb', border: '1px solid rgba(255,255,255,.12)', borderRadius: 999, padding: '10px 15px', textDecoration: 'none', fontSize: 14, fontWeight: 800 }}>WhatsApp</a>
          </nav>
        </div>
      </header>

      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(212,175,55,.16)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 75% 20%, rgba(212,175,55,.22), transparent 35%), linear-gradient(135deg, rgba(212,175,55,.10), transparent 44%)' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '86px 22px 74px', position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 42, alignItems: 'center' }}>
          <div>
            <p style={{ color: gold, letterSpacing: 4, fontWeight: 900, marginBottom: 18 }}>BELGIUM · AIRPORT · PRIVATE RIDES</p>
            <h1 style={{ fontSize: 'clamp(42px, 8vw, 82px)', lineHeight: .92, margin: 0, letterSpacing: -3 }}>Reliable transport, simple booking.</h1>
            <p style={{ marginTop: 26, maxWidth: 680, color: '#d1d5db', fontSize: 19, lineHeight: 1.75 }}>
              LV Transport ofrece traslados privados, aeropuerto y servicio business con una operación clara: reserva simple, confirmación rápida y comunicación directa.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 32 }}>
              <a href="#booking" style={{ background: gold, color: '#080808', borderRadius: 16, padding: '15px 22px', textDecoration: 'none', fontWeight: 900 }}>Reservar ahora</a>
              <a href={`https://wa.me/32400000000?text=${whatsappText}`} style={{ color: 'white', border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, padding: '15px 22px', textDecoration: 'none', fontWeight: 800 }}>Contactar por WhatsApp</a>
            </div>
          </div>

          <aside id="booking" style={{ border: '1px solid rgba(212,175,55,.26)', borderRadius: 30, padding: 24, background: 'linear-gradient(145deg, rgba(17,17,17,.98), rgba(31,25,9,.78))', boxShadow: '0 26px 90px rgba(0,0,0,.45)' }}>
            <p style={{ color: '#a1a1aa', margin: 0 }}>Quick booking request</p>
            <h2 style={{ margin: '10px 0 18px', fontSize: 30 }}>Solicita tu traslado</h2>
            <form action={`${apiBase}/bookings`} method="post" style={{ display: 'grid', gap: 12 }}>
              <input name="pickup" placeholder="Pickup / Recogida" required style={inputStyle} />
              <input name="destination" placeholder="Destination / Destino" required style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input name="date" type="date" required style={inputStyle} />
                <input name="time" type="time" required style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input name="passengers" type="number" min="1" placeholder="Passengers" required style={inputStyle} />
                <input name="phone" placeholder="Phone / WhatsApp" required style={inputStyle} />
              </div>
              <textarea name="notes" placeholder="Notes: luggage, flight number, child seat..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              <button type="submit" style={{ background: gold, color: '#080808', border: 'none', borderRadius: 16, padding: '15px 18px', fontWeight: 950, cursor: 'pointer' }}>Enviar solicitud</button>
              <small style={{ color: '#a1a1aa', lineHeight: 1.5 }}>Si el formulario no responde todavía, usa WhatsApp. La API queda separada en api.lvtransport.be para mantener la arquitectura limpia.</small>
            </form>
          </aside>
        </div>
      </section>

      <section id="services" style={{ maxWidth: 1180, margin: '0 auto', padding: '66px 22px' }}>
        <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>SERVICES</p>
        <h2 style={{ fontSize: 'clamp(30px, 5vw, 52px)', margin: '8px 0 30px' }}>Simple, elegant and operational.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {services.map((service) => (
            <article key={service.title} style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 24, background: '#111' }}>
              <h3 style={{ color: gold, marginTop: 0 }}>{service.title}</h3>
              <p style={{ color: '#d1d5db', lineHeight: 1.65 }}>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="map" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,.13), rgba(255,255,255,.03))', borderTop: '1px solid rgba(212,175,55,.14)', borderBottom: '1px solid rgba(212,175,55,.14)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 26, alignItems: 'center' }}>
          <div>
            <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>COVERAGE</p>
            <h2 style={{ fontSize: 42, margin: '8px 0 12px' }}>Belgium based. Airport ready.</h2>
            <p style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: 17 }}>
              Mapa simple y seguro: no guarda coordenadas privadas en el frontend. La reserva se confirma después de revisar disponibilidad y ruta.
            </p>
            <ol style={{ color: '#d1d5db', lineHeight: 1.9, paddingLeft: 22 }}>
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div style={{ overflow: 'hidden', borderRadius: 26, border: '1px solid rgba(212,175,55,.24)', minHeight: 330, background: '#0f0f0f' }}>
            <iframe
              title="LV Transport coverage map"
              src="https://www.google.com/maps?q=Antwerp%20Belgium&output=embed"
              width="100%"
              height="360"
              style={{ border: 0, display: 'block', filter: 'grayscale(1) contrast(1.08)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <footer style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 22px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', color: '#a1a1aa' }}>
        <span>© {new Date().getFullYear()} LV Transport</span>
        <span>Frontend estático · API en puerto 3000 · Sin Vite preview en producción</span>
      </footer>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(255,255,255,.06)',
  color: 'white',
  borderRadius: 14,
  padding: '13px 14px',
  outline: 'none',
}
