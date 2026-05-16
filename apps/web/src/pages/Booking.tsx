import { FormEvent, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const gold = '#d4af37'

const fieldStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(255,255,255,.06)',
  color: 'white',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

export default function Booking() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    pickup: '',
    destination: '',
    date: '',
    time: '',
    notes: '',
    serviceType: 'airport',
  })

  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om uw taxi te volgen.')
  const [trackingLoading, setTrackingLoading] = useState(false)

  async function submitBooking(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setConfirmation('')

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          pickup: form.pickup,
          destination: form.destination,
          date: form.date,
          time: form.time,
          serviceType: form.serviceType,
          notes: form.notes,
          source: 'website',
        }),
      })

      const result = await response.json()
      if (!response.ok || !result?.booking?.code) {
        throw new Error(result?.message || result?.error || 'Boeking mislukt.')
      }

      const code = result.booking.code
      setTrackingCode(code)
      setConfirmation(`Boeking bevestigd. Uw ritcode: ${code}. Geschatte prijs: €${result.booking.priceEstimate?.exact ?? 'n.v.t.'}`)
    } catch (error) {
      setConfirmation(error instanceof Error ? error.message : 'Boeking mislukt.')
    } finally {
      setSubmitting(false)
    }
  }

  async function lookupTracking(codeOverride?: string) {
    const code = (codeOverride ?? trackingCode).trim()
    if (!code) return

    setTrackingLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/bookings/code/${code}`)
      const result = await response.json()

      if (!response.ok || !result?.booking) {
        throw new Error(result?.message || result?.error || 'Rit niet gevonden.')
      }

      const ride = result.booking
      const driver = ride.driverName ? ` • Chauffeur: ${ride.driverName}` : ''
      const when = `${ride.date || ''} ${ride.time || ''}`.trim()
      setTrackingResult(`Rit ${ride.code}: ${ride.status} • ${ride.pickup} → ${ride.destination} • ${when}${driver}`)
    } catch (error) {
      setTrackingResult(error instanceof Error ? error.message : 'Tracking mislukt.')
    } finally {
      setTrackingLoading(false)
    }
  }

  return (
    <main style={{ background: '#070707', color: 'white', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 22px' }}>
        <a href="/" style={{ color: gold, textDecoration: 'none', fontWeight: 800 }}>← LV Transport</a>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 24, marginTop: 28 }}>
          <form onSubmit={submitBooking} style={{ border: '1px solid rgba(212,175,55,.22)', borderRadius: 28, padding: 24, background: '#101010' }}>
            <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>BOOKING</p>
            <h1 style={{ fontSize: 42, margin: '8px 0 18px' }}>Reserveer uw rit</h1>

            <div style={{ display: 'grid', gap: 14 }}>
              <input style={fieldStyle} placeholder="Naam klant" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input style={fieldStyle} placeholder="Telefoon / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <input style={fieldStyle} placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input style={fieldStyle} placeholder="Vertrekadres" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} required />
              <input style={fieldStyle} placeholder="Bestemming" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input style={fieldStyle} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                <input style={fieldStyle} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>

              <select style={fieldStyle} value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                <option value="airport">Airport</option>
                <option value="standard">Standaard</option>
                <option value="business">Business/VIP</option>
              </select>

              <textarea style={{ ...fieldStyle, minHeight: 96, resize: 'vertical' }} placeholder="Opmerking: vlucht, bagage, kinderstoel, voorkeurstaal..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

              <button type="submit" style={{ border: 0, borderRadius: 16, padding: '15px 18px', background: gold, color: '#080808', fontWeight: 900, cursor: 'pointer' }}>
                {submitting ? 'Verwerken...' : 'Maak ritaanvraag'}
              </button>

              {confirmation && <p style={{ color: '#e5e7eb', marginTop: 8 }}>{confirmation}</p>}
            </div>
          </form>

          <aside style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 28, padding: 24, background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))' }}>
            <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>PRIJSINDICATIE</p>
            <h2 style={{ fontSize: 34, margin: '8px 0 16px' }}>Slimme calculator</h2>
            <p style={{ color: '#d1d5db', lineHeight: 1.7 }}>
              De prijs wordt berekend door de LV Transport API op basis van afstand, tijdstip, luchthaven en minimumtarief.
            </p>
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {['Minimumrit Antwerpen: vanaf €15', 'Airport transfer: geschatte tarieven', 'Nachttoeslag: automatisch via tijdstip', 'Business/VIP: prioriteit en facturatie'].map((item) => (
                <div key={item} style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)' }}>{item}</div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="tracking" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 22px 70px' }}>
        <div style={{ border: '1px solid rgba(212,175,55,.2)', borderRadius: 28, padding: 24, background: '#101010' }}>
          <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>TRACKING</p>
          <h2 style={{ fontSize: 36, margin: '8px 0 16px' }}>Volg uw taxi met ritcode</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 12 }}>
            <input style={fieldStyle} placeholder="Bijvoorbeeld 374256" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
            <button onClick={() => lookupTracking()} style={{ border: 0, borderRadius: 16, padding: '0 18px', background: gold, color: '#080808', fontWeight: 900 }}>
              {trackingLoading ? 'Synchronisatie...' : 'Zoeken'}
            </button>
          </div>

          <p style={{ color: '#a1a1aa', marginTop: 14 }}>{trackingResult}</p>
        </div>
      </section>
    </main>
  )
}
