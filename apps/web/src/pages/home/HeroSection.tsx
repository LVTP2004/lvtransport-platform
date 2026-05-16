const gold = '#d4af37'

export default function HeroSection() {
  const nav = [
    ['Boeken', '/booking'],
    ['Prijs berekenen', '/booking#calculator'],
    ['Volg uw taxi', '/booking#tracking'],
    ['Diensten', '#services'],
    ['LV VIP', '#vip'],
    ['Founder', '/founder']
  ]

  const services = [
    ['Airport transfers', 'Zaventem, Charleroi, Eindhoven, Schiphol en regionale luchthavens met duidelijke planning.'],
    ['Premium taxi', 'Zakelijke en privéritten in Antwerpen en heel België met discrete service.'],
    ['Business & VIP', 'Vaste routes, facturatie, prioritaire planning en voordelen voor frequente klanten.']
  ]

  return (
    <main style={{ background: '#070707', color: 'white', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(7,7,7,.88)', borderBottom: '1px solid rgba(212,175,55,.18)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${gold}`, display: 'grid', placeItems: 'center', color: gold, fontWeight: 900 }}>LV</span>
            <span><strong style={{ display: 'block', letterSpacing: 1 }}>LV Transport</strong><small style={{ color: '#a1a1aa' }}>Premium Taxi Antwerpen</small></span>
          </a>
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {nav.map(([label, href]) => <a key={label} href={href} style={{ color: label === 'Boeken' ? '#090909' : '#e5e7eb', background: label === 'Boeken' ? gold : 'transparent', border: label === 'Boeken' ? 'none' : '1px solid rgba(255,255,255,.12)', borderRadius: 999, padding: '10px 14px', textDecoration: 'none', fontSize: 14, fontWeight: 800 }}>{label}</a>)}
          </nav>
        </div>
      </header>

      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(212,175,55,.16)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 72% 18%, rgba(212,175,55,.24), transparent 34%), linear-gradient(135deg, rgba(212,175,55,.12), transparent 42%)' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '92px 22px 76px', position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 42, alignItems: 'center' }}>
          <div>
            <p style={{ color: gold, letterSpacing: 4, fontWeight: 900, marginBottom: 18 }}>ANTWERPEN 24/7 SERVICE</p>
            <h1 style={{ fontSize: 'clamp(42px, 8vw, 82px)', lineHeight: .92, margin: 0, letterSpacing: -3 }}>Uw rit in België, verzorgd met klasse.</h1>
            <p style={{ marginTop: 26, maxWidth: 680, color: '#d1d5db', fontSize: 19, lineHeight: 1.75 }}>LV Transport combineert premium taxi, luchthavenvervoer, realtime tracking en een founder-controlled operations cockpit. Boek snel, ontvang uw ritcode en volg uw rit online.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 32 }}>
              <a href="/booking" style={{ background: gold, color: '#080808', borderRadius: 16, padding: '15px 22px', textDecoration: 'none', fontWeight: 900 }}>Reserveer nu</a>
              <a href="/founder" style={{ color: 'white', border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, padding: '15px 22px', textDecoration: 'none', fontWeight: 800 }}>Open Founder Cockpit</a>
            </div>
          </div>
          <aside style={{ border: '1px solid rgba(212,175,55,.25)', borderRadius: 30, padding: 24, background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))', boxShadow: '0 26px 90px rgba(0,0,0,.45)' }}>
            <p style={{ color: '#a1a1aa', margin: 0 }}>Live operational preview</p>
            <h2 style={{ margin: '10px 0 22px', fontSize: 32 }}>LVTP Control Layer</h2>
            {['Booking lifecycle: Ready', 'Driver panel: Online', 'Founder cockpit: Active', 'Moni IA: Concierge mode'].map((item) => {
              const [label, value] = item.split(': ')
              return <div key={item} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, background: 'rgba(255,255,255,.045)' }}><span style={{ color: '#d4d4d8' }}>{label}</span><strong style={{ color: gold }}>{value}</strong></div>
            })}
          </aside>
        </div>
      </section>

      <section id="services" style={{ maxWidth: 1180, margin: '0 auto', padding: '70px 22px' }}>
        <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>DIENSTEN</p>
        <h2 style={{ fontSize: 'clamp(30px, 5vw, 52px)', margin: '8px 0 30px' }}>Premium mobiliteit met operationele controle.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {services.map(([title, text]) => <article key={title} style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 24, background: '#111' }}><h3 style={{ color: gold, marginTop: 0 }}>{title}</h3><p style={{ color: '#d1d5db', lineHeight: 1.65 }}>{text}</p></article>)}
        </div>
      </section>

      <section id="vip" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,.14), rgba(255,255,255,.03))', borderTop: '1px solid rgba(212,175,55,.14)', borderBottom: '1px solid rgba(212,175,55,.14)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 26 }}>
          <div><p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>LV VIP & BUSINESS</p><h2 style={{ fontSize: 42, margin: '8px 0 12px' }}>Voor frequente klanten, bedrijven en luchthavenroutes.</h2></div>
          <p style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: 17 }}>Vaste afspraken, rittenbundels, facturatie, prioritaire opvolging en taalvoorkeuren. De admin control tower bewaakt planning, ritstatus, klantvertrouwen en uitzonderingen.</p>
        </div>
      </section>
    </main>
  )
}
