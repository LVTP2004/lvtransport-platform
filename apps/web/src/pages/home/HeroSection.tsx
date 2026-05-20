import { useState } from 'react'

const colors = {
  bg: '#111214',
  bgSoft: '#17181c',
  panel: 'rgba(29,31,36,0.82)',
  panelStrong: 'rgba(35,37,43,0.9)',
  gold: '#c8a96b',
  goldLine: 'rgba(200,169,107,0.42)',
  white: '#f2f3f5',
  grey: '#b7b9be',
}

const menuItems = ['HOME', 'DIENSTEN', 'PRIJZEN', 'TRACKING', 'CONTACT']
const services = ['Taxi Antwerpen', 'Luchthavenvervoer', 'Zakelijk vervoer', 'Haven transport', 'Lange afstand']
const pricing = ['Zaventem', 'Brussel', 'Mechelen', 'Gent', 'Schiphol']

const buttonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${colors.goldLine}`,
  padding: '12px 16px',
  background: 'linear-gradient(180deg, rgba(200,169,107,0.18), rgba(200,169,107,0.1))',
  color: colors.white,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.01em',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(17,18,20,0.8)',
  border: `1px solid ${colors.goldLine}`,
  borderRadius: 12,
  color: colors.white,
  padding: '12px 14px',
  width: '100%',
  boxSizing: 'border-box',
}

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [rideCode, setRideCode] = useState('')

  return (
    <main style={{ background: `linear-gradient(${colors.bg}, ${colors.bgSoft})`, color: colors.white, minHeight: '100vh' }}>
      <style>{`
        .lv-wrap{max-width:1180px;margin:0 auto;padding:0 20px}
        .lv-hero-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:34px;align-items:center}
        .lv-cards-grid{display:grid;gap:16px;grid-template-columns:repeat(5,minmax(0,1fr))}
        .lv-scroll-row{display:grid;gap:16px;grid-template-columns:repeat(5,minmax(220px,1fr))}
        @media (max-width: 1000px){
          .lv-hero-grid{grid-template-columns:1fr;}
          .lv-cards-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media (max-width: 760px){
          .lv-cards-grid{display:flex;overflow:auto;padding-bottom:6px;scroll-snap-type:x mandatory}
          .lv-cards-grid > div{min-width:78%;scroll-snap-align:start}
          .lv-scroll-row{display:flex;overflow:auto;padding-bottom:6px;scroll-snap-type:x mandatory}
          .lv-scroll-row > div{min-width:74%;scroll-snap-align:start}
        }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 80, backdropFilter: 'blur(8px)', background: 'rgba(17,18,20,0.7)', borderBottom: `1px solid ${colors.goldLine}` }}>
        <div className="lv-wrap" style={{ height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 22 }} />
          <button aria-label="Open menu" onClick={() => setMenuOpen(true)} style={{ ...buttonStyle, width: 52, height: 44, display: 'grid', placeItems: 'center', background: 'rgba(23,24,28,0.85)' }}>☰</button>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(17,18,20,0.96)', backdropFilter: 'blur(16px)', padding: 28 }}>
          <div className="lv-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 22 }} />
              <button onClick={() => setMenuOpen(false)} style={buttonStyle}>Sluiten</button>
            </div>
            {menuItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ color: colors.white, textDecoration: 'none', fontSize: 34, letterSpacing: '0.03em' }}>{item}</a>)}
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <a href="tel:+32000000000" style={buttonStyle}>Bel nu</a>
              <a href="#contact" style={buttonStyle}>WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      <section className="lv-wrap" id="home" style={{ paddingTop: 40, paddingBottom: 18 }}>
        <div className="lv-hero-grid" style={{ border: `1px solid ${colors.goldLine}`, borderRadius: 18, padding: 24, background: colors.panel }}>
          <div>
            <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,5vw,56px)', lineHeight: 1.08 }}>Betrouwbaar.<br />Comfortabel.<br />Altijd op tijd.</h1>
            <p style={{ margin: 0, color: colors.grey, fontSize: 18, lineHeight: 1.6 }}>Premium vervoer in Antwerpen en België.<br />24/7 beschikbaar.</p>
          </div>
          <div style={{ minHeight: 320, borderRadius: 16, border: `1px solid ${colors.goldLine}`, background: `linear-gradient(130deg, rgba(17,18,20,.85), rgba(29,31,36,.55)), url(/brand/lvtransport/hero-byd-night.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>
      </section>

      <section className="lv-wrap" id="booking" style={{ paddingTop: 18, paddingBottom: 18 }}>
        <div style={{ background: colors.panel, borderRadius: 16, border: `1px solid ${colors.goldLine}`, backdropFilter: 'blur(10px)', padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Reserveer uw rit</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
            <input placeholder="Pickup" style={inputStyle} />
            <input placeholder="Destination" style={inputStyle} />
            <input type="date" style={inputStyle} />
            <input type="time" style={inputStyle} />
            <select style={inputStyle}><option>Ride type</option><option>Standard</option><option>Business</option></select>
            <input placeholder="Phone" style={inputStyle} />
          </div>
          <div style={{ marginTop: 14 }}><button style={buttonStyle}>Reserveer nu</button></div>
        </div>
      </section>

      <section className="lv-wrap" id="diensten" style={{ padding: '18px 20px' }}>
        <h2>Diensten</h2>
        <div className="lv-cards-grid">
          {services.map((item) => <div key={item} style={{ padding: 18, borderRadius: 14, background: colors.panelStrong, border: `1px solid ${colors.goldLine}` }}>{item}</div>)}
        </div>
      </section>

      <section className="lv-wrap" id="prijzen" style={{ padding: '18px 20px' }}>
        <h2>Transparante prijzen</h2>
        <div className="lv-scroll-row">
          {pricing.map((item) => <div key={item} style={{ padding: 18, borderRadius: 14, background: colors.panelStrong, border: `1px solid ${colors.goldLine}` }}><div style={{ color: colors.grey, marginBottom: 8 }}>{item}</div><strong>Vanaf €65</strong></div>)}
        </div>
      </section>

      <section className="lv-wrap" id="tracking" style={{ padding: '18px 20px 38px' }}>
        <div style={{ padding: 20, borderRadius: 16, border: `1px solid ${colors.goldLine}`, background: colors.panel }}>
          <h2 style={{ marginTop: 0 }}>Tracking toegang</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input maxLength={5} placeholder="Voer uw ritcode in" value={rideCode} onChange={(e) => setRideCode(e.target.value.replace(/\D/g, '').slice(0, 5))} style={{ ...inputStyle, maxWidth: 220 }} />
            <button style={buttonStyle}>Tracking openen</button>
          </div>
          <p style={{ color: colors.grey, marginBottom: 0 }}>Status: Onderweg · Bij u in de buurt · Aangekomen · Rit voltooid</p>
        </div>
      </section>

      <button aria-label="MoniRide" style={{ position: 'fixed', right: 16, bottom: 16, width: 54, height: 54, borderRadius: '50%', border: `1px solid ${colors.goldLine}`, background: 'radial-gradient(circle at 25% 20%, rgba(200,169,107,.2), rgba(17,18,20,.96))', color: colors.white, boxShadow: '0 0 14px rgba(200,169,107,.18)' }}>LV</button>

      <footer id="contact" style={{ borderTop: `1px solid ${colors.goldLine}`, background: 'rgba(17,18,20,0.94)', padding: '28px 0 40px' }}>
        <div className="lv-wrap" style={{ display: 'grid', gap: 12 }}>
          <img src="/brand/lv-logo-primary.svg" alt="LV Transport" style={{ height: 30 }} />
          <div>Phone: +32 000 00 00 00</div>
          <div>Email: info@lvtransport.be</div>
          <div>Website: lvtransport.be</div>
          <div>VAT: BE 0000.000.000</div>
          <div>LV Transport · Antwerpen, België · Support · Privacy · Voorwaarden</div>
        </div>
      </footer>
    </main>
  )
}
