import { useState } from 'react'

const palette = {
  bg: '#111214',
  panel: '#17181c',
  panelAlt: '#1d1f24',
  panelSoft: '#23252b',
  text: '#f4f2ee',
  muted: '#b6b8bf',
  gold: '#c7a24a',
  goldSoft: 'rgba(199,162,74,.35)',
}

const navItems = ['HOME', 'DIENSTEN', 'PRIJZEN', 'TRACKING', 'CONTACT']
const services = ['Taxi Antwerpen', 'Luchthavenvervoer', 'Zakelijk vervoer', 'Haven transport', 'Lange afstand']
const destinations = ['Zaventem', 'Brussel', 'Mechelen', 'Gent', 'Schiphol']

const sectionWrap: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '34px 18px',
}

const buttonBase: React.CSSProperties = {
  borderRadius: 12,
  padding: '12px 18px',
  textDecoration: 'none',
  fontWeight: 600,
  letterSpacing: '.01em',
  transition: 'all .25s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${palette.goldSoft}`,
}

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [moniRideOpen, setMoniRideOpen] = useState(false)

  return (
    <main style={{ background: palette.bg, color: palette.text, minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 80, padding: '12px 12px 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${palette.goldSoft}`, borderRadius: 16, background: 'rgba(17,18,20,.88)', backdropFilter: 'blur(14px)' }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 22 }} />
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu" style={{ ...buttonBase, background: 'rgba(255,255,255,.02)', color: palette.text, width: 50, height: 42, padding: 0 }}>
            <span style={{ fontSize: 20 }}>☰</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(17,18,20,.96)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 26 }}>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ ...buttonBase, position: 'absolute', top: 16, right: 16, width: 46, height: 42, padding: 0, color: palette.text, background: 'rgba(255,255,255,.02)' }}>✕</button>
          <nav style={{ display: 'grid', gap: 22 }}>
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ color: palette.text, textDecoration: 'none', fontSize: 'clamp(26px,7vw,40px)', letterSpacing: '.04em' }}>{item}</a>
            ))}
          </nav>
          <div style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+32000000000" style={{ ...buttonBase, background: palette.gold, color: palette.bg }}>Bel nu</a>
            <a href="https://wa.me/32000000000" style={{ ...buttonBase, background: 'rgba(255,255,255,.03)', color: palette.text }}>WhatsApp</a>
          </div>
        </div>
      )}

      <section id="home" style={{ ...sectionWrap, paddingTop: 28 }}>
        <div style={{ borderRadius: 26, overflow: 'hidden', border: `1px solid ${palette.goldSoft}`, background: `linear-gradient(140deg, ${palette.panel}, ${palette.panelAlt})` }}>
          <div style={{ minHeight: 560, backgroundImage: 'linear-gradient(90deg, rgba(12,13,16,.95) 20%, rgba(14,15,19,.74) 52%, rgba(17,18,20,.35) 100%), url(/brand/lvtransport/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            <div style={{ padding: '58px 26px', display: 'grid', alignContent: 'center', gap: 18 }}>
              <p style={{ margin: 0, color: '#e6cf97', letterSpacing: '.08em', fontSize: 12, textTransform: 'uppercase' }}>Antwerpen · 24/7 premium mobiliteit</p>
              <h1 style={{ margin: 0, fontSize: 'clamp(38px,7vw,70px)', lineHeight: 1.02 }}>Betrouwbaar.<br />Comfortabel.<br />Altijd op tijd.</h1>
              <p style={{ margin: 0, color: palette.muted, fontSize: 18, lineHeight: 1.6 }}>Premium vervoer in Antwerpen en België.<br />24/7 beschikbaar.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#booking" style={{ ...buttonBase, background: palette.gold, color: palette.bg }}>Reserveer nu</a>
                <a href="#prijzen" style={{ ...buttonBase, background: 'rgba(255,255,255,.03)', color: palette.text }}>Bekijk prijzen</a>
              </div>
            </div>
            <div aria-hidden="true" />
          </div>
        </div>
      </section>

      <section id="booking" style={sectionWrap}>
        <div style={{ borderRadius: 20, padding: 22, border: `1px solid ${palette.goldSoft}`, background: palette.panel }}>
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Boeking</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
            {['Pickup', 'Bestemming', 'Datum', 'Tijd', 'Rit type', 'Telefoon'].map((label) => (
              <input key={label} placeholder={label} style={inputStyle} />
            ))}
          </div>
          <div style={{ marginTop: 14 }}><button style={{ ...buttonBase, background: palette.gold, color: palette.bg }}>Reserveer nu</button></div>
        </div>
      </section>

      <section id="diensten" style={sectionWrap}>
        <h2 style={{ margin: '0 0 14px' }}>Diensten</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {services.map((item) => (
            <article key={item} style={{ borderRadius: 16, border: `1px solid ${palette.goldSoft}`, background: 'rgba(35,37,43,.52)', padding: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, border: `1px solid ${palette.goldSoft}`, marginBottom: 12 }} />
              <h3 style={{ margin: 0, fontSize: 18 }}>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="prijzen" style={sectionWrap}>
        <h2 style={{ margin: '0 0 14px' }}>Prijzen</h2>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 12, minWidth: 740 }}>
            {destinations.map((destination) => (
              <article key={destination} style={{ flex: '1 0 140px', borderRadius: 16, border: `1px solid ${palette.goldSoft}`, background: palette.panelAlt, padding: 18, cursor: 'pointer' }}>
                <p style={{ margin: '0 0 10px', color: palette.muted }}>Vanaf Antwerpen</p>
                <h3 style={{ margin: 0 }}>{destination}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tracking" style={sectionWrap}>
        <div style={{ borderRadius: 20, padding: 22, border: `1px solid ${palette.goldSoft}`, background: palette.panel }}>
          <h2 style={{ margin: '0 0 10px' }}>Tracking</h2>
          <p style={{ marginTop: 0, color: palette.muted }}>Voer uw ritcode in</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              placeholder="Ritcode"
              maxLength={5}
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              style={{ ...inputStyle, maxWidth: 180 }}
            />
            <button style={{ ...buttonBase, background: palette.gold, color: palette.bg }}>Tracking openen</button>
          </div>
        </div>
      </section>

      <footer id="contact" style={{ ...sectionWrap, paddingBottom: 86 }}>
        <div style={{ borderRadius: 20, padding: 22, border: `1px solid ${palette.goldSoft}`, background: palette.panelSoft }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 20, marginBottom: 12 }} />
          <p style={{ margin: '0 0 6px', color: palette.muted }}>Antwerpen, België · support@lvtransport.be · +32 00 00 00 00</p>
          <p style={{ margin: '0 0 6px', color: palette.muted }}>LV Transport BV · BTW BE0123.456.789</p>
          <p style={{ margin: 0, color: palette.muted }}>Juridisch · Privacy · Support</p>
        </div>
      </footer>

      {moniRideOpen && (
        <aside style={{ position: 'fixed', right: 20, bottom: 92, zIndex: 85, width: 260, borderRadius: 14, border: `1px solid ${palette.goldSoft}`, background: 'rgba(23,24,28,.94)', backdropFilter: 'blur(10px)', padding: 14 }}>
          <p style={{ margin: 0, color: palette.muted, fontSize: 13 }}>MoniRide operationeel</p>
        </aside>
      )}
      <button
        aria-label="Open MoniRide"
        onClick={() => setMoniRideOpen((v) => !v)}
        style={{ position: 'fixed', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%', border: `1px solid ${palette.goldSoft}`, background: 'radial-gradient(circle at 35% 35%, rgba(199,162,74,.25), rgba(23,24,28,.96))', boxShadow: '0 0 20px rgba(199,162,74,.26)', zIndex: 86, display: 'grid', placeItems: 'center', color: '#ead6a2' }}
      >
        LV
      </button>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(17,18,20,.92)',
  color: '#f4f2ee',
  padding: '12px 12px',
  borderRadius: 12,
  width: '100%',
  boxSizing: 'border-box',
  fontSize: 14,
}
