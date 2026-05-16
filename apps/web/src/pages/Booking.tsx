const gold = '#d4af37'

const fieldStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(255,255,255,.06)',
  color: 'white',
  outline: 'none',
  boxSizing: 'border-box' as const
}

export default function Booking() {
  return (
    <main style={{ background: '#070707', color: 'white', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 22px' }}>
        <a href="/" style={{ color: gold, textDecoration: 'none', fontWeight: 800 }}>← LV Transport</a>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 24, marginTop: 28 }}>
          <form style={{ border: '1px solid rgba(212,175,55,.22)', borderRadius: 28, padding: 24, background: '#101010' }}>
            <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>BOOKING FLOW</p>
            <h1 style={{ fontSize: 42, margin: '8px 0 18px' }}>Reserveer uw rit</h1>
            <div style={{ display: 'grid', gap: 14 }}>
              <input style={fieldStyle} placeholder="Naam klant" />
              <input style={fieldStyle} placeholder="Telefoon / WhatsApp" />
              <input style={fieldStyle} placeholder="Vertrekadres" />
              <input style={fieldStyle} placeholder="Bestemming" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input style={fieldStyle} type="date" />
                <input style={fieldStyle} type="time" />
              </div>
              <textarea style={{ ...fieldStyle, minHeight: 96, resize: 'vertical' }} placeholder="Opmerking: vlucht, bagage, kinderstoel, voorkeurstaal..." />
              <button type="button" style={{ border: 0, borderRadius: 16, padding: '15px 18px', background: gold, color: '#080808', fontWeight: 900, cursor: 'pointer' }}>Maak ritaanvraag</button>
            </div>
          </form>

          <aside id="calculator" style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 28, padding: 24, background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))' }}>
            <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>PRIJSINDICATIE</p>
            <h2 style={{ fontSize: 34, margin: '8px 0 16px' }}>Slimme calculator</h2>
            <p style={{ color: '#d1d5db', lineHeight: 1.7 }}>Deze operationele versie bereidt de echte calculator voor: afstand, tijd, dag/nacht, luchthaven, wachttijd, minimumtarief en business/VIP regels.</p>
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {['Minimumrit Antwerpen: vanaf €15', 'Airport transfer: vaste/geschatte tarieven', 'Nachttoeslag: automatisch via tijdstip', 'Business klant: facturatie en prioriteit'].map(item => <div key={item} style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)' }}>{item}</div>)}
            </div>
          </aside>
        </div>
      </section>

      <section id="tracking" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 22px 70px' }}>
        <div style={{ border: '1px solid rgba(212,175,55,.2)', borderRadius: 28, padding: 24, background: '#101010' }}>
          <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>TRACKING</p>
          <h2 style={{ fontSize: 36, margin: '8px 0 16px' }}>Volg uw taxi met ritcode</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 12 }}>
            <input style={fieldStyle} placeholder="Bijvoorbeeld LV12345" />
            <button style={{ border: 0, borderRadius: 16, padding: '0 18px', background: gold, color: '#080808', fontWeight: 900 }}>Zoeken</button>
          </div>
          <p style={{ color: '#a1a1aa', marginTop: 14 }}>Tracking wordt gekoppeld aan driver GPS en booking lifecycle zodra de API/live database actief is op productie.</p>
        </div>
      </section>
    </main>
  )
}
