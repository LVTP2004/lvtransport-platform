import { useMemo, useState } from 'react'

const charcoal = '#111214'
const gold = '#d4af37'

const serviceTypes = [
  { key: 'standard', label: 'Standard', base: 24, perKm: 1.8 },
  { key: 'business', label: 'Business', base: 35, perKm: 2.3 },
  { key: 'van', label: 'Mercedes Van', base: 42, perKm: 2.8 },
]

const sectionWrap: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '32px 18px',
}

export default function HeroSection() {
  const [calc, setCalc] = useState({ origin: '', destination: '', service: serviceTypes[0].key, night: false })

  const estimate = useMemo(() => {
    const service = serviceTypes.find((item) => item.key === calc.service) ?? serviceTypes[0]
    const pseudoKm = Math.max(12, Math.min(80, Math.round((calc.origin.length + calc.destination.length) / 2.5)))
    const total = service.base + pseudoKm * service.perKm + (calc.night ? 18 : 0)
    return { total, pseudoKm, label: service.label }
  }, [calc])

  return (
    <main style={{ background: '#090a0b', color: 'white', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <header style={{ position: 'sticky', top: 12, zIndex: 50, padding: '0 12px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(212,175,55,.22)', borderRadius: 18, background: 'rgba(12,14,18,.76)', backdropFilter: 'blur(18px)' }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 22 }} />
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Home', 'Booking', 'Pricing', 'Tracking', 'VIP'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: '#f5f5f5', textDecoration: 'none', padding: '9px 14px', borderRadius: 999, fontSize: 13, background: 'rgba(255,255,255,.04)' }}>{item}</a>
            ))}
          </nav>
        </div>
      </header>

      <section id="home" style={{ ...sectionWrap, paddingTop: 56 }}>
        <div style={{ borderRadius: 30, overflow: 'hidden', border: '1px solid rgba(212,175,55,.24)', background: 'linear-gradient(135deg, rgba(18,18,22,.96), rgba(28,30,38,.88))' }}>
          <div style={{ minHeight: 560, backgroundImage: 'linear-gradient(90deg, rgba(6,8,10,.88) 18%, rgba(10,12,15,.72) 48%, rgba(16,18,22,.54) 100%), url(/brand/lvtransport/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }}>
            <div style={{ maxWidth: 720, padding: '54px 34px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.22)', marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: gold }} />
                <span style={{ fontSize: 12, color: '#f6e8ba', letterSpacing: '.08em', textTransform: 'uppercase' }}>Premium Hybrid Mobility</span>
              </div>

              <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(42px,7vw,74px)', lineHeight: 1.02, fontWeight: 800 }}>
                Mercedes & BYD executive transport in Antwerpen
              </h1>

              <p style={{ maxWidth: 620, color: '#d7d9de', fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
                Luxury airport transfers, real-time operational tracking and premium chauffeur mobility.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="#booking" style={{ background: gold, color: charcoal, padding: '14px 20px', borderRadius: 14, textDecoration: 'none', fontWeight: 800 }}>Reserve now</a>
                <a href="#tracking" style={{ border: '1px solid rgba(212,175,55,.34)', color: 'white', padding: '14px 20px', borderRadius: 14, textDecoration: 'none', background: 'rgba(255,255,255,.05)' }}>Track your ride</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={sectionWrap}>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
          <div style={{ borderRadius: 24, padding: 24, background: 'rgba(18,20,24,.92)', border: '1px solid rgba(212,175,55,.16)' }}>
            <h2 style={{ marginTop: 0 }}>Smart fare calculator</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <input placeholder="Pickup" value={calc.origin} onChange={(e) => setCalc((p) => ({ ...p, origin: e.target.value }))} style={inputStyle} />
              <input placeholder="Destination" value={calc.destination} onChange={(e) => setCalc((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} />
              <select value={calc.service} onChange={(e) => setCalc((p) => ({ ...p, service: e.target.value }))} style={inputStyle}>
                {serviceTypes.map((service) => <option key={service.key} value={service.key}>{service.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ borderRadius: 24, padding: 24, background: 'linear-gradient(145deg, rgba(212,175,55,.12), rgba(20,20,24,.92))', border: '1px solid rgba(212,175,55,.22)' }}>
            <p style={{ margin: 0, color: '#f3d98b', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 12 }}>Estimated premium fare</p>
            <h3 style={{ fontSize: 58, margin: '10px 0' }}>€{estimate.total.toFixed(0)}</h3>
            <p style={{ color: '#d9d9d9' }}>{estimate.label} · ~{estimate.pseudoKm} km operational route</p>
          </div>
        </div>
      </section>

      <section id="tracking" style={sectionWrap}>
        <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(212,175,55,.18)', background: 'rgba(12,13,16,.95)' }}>
          <div style={{ padding: 24 }}>
            <h2 style={{ margin: 0 }}>Operational tracking tower</h2>
            <p style={{ color: '#cfcfcf' }}>Driver ETA and premium ride lifecycle visibility.</p>
          </div>
          <iframe title="Antwerpen map" src="https://www.google.com/maps?q=Antwerpen&output=embed" width="100%" height="320" style={{ border: 0, filter: 'grayscale(.92)' }} />
        </div>
      </section>

      <aside aria-label="MoniRide assistant" style={{ position: 'fixed', bottom: 18, right: 18, width: 58, height: 58, borderRadius: '50%', border: '1px solid rgba(212,175,55,.48)', background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,.42), rgba(16,16,18,.98))', boxShadow: '0 0 30px rgba(212,175,55,.35)', display: 'grid', placeItems: 'center', fontSize: 24, color: '#fff4cf', zIndex: 60, cursor: 'pointer' }}>
        🌟
      </aside>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(10,10,12,.92)',
  color: 'white',
  padding: '14px 14px',
  borderRadius: 14,
  width: '100%',
  boxSizing: 'border-box',
  fontSize: 14,
}
