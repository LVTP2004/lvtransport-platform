import { FormEvent, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = `${API_BASE}/api/v1`
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
      const scheduleAt = new Date(`${form.date}T${form.time}`).toISOString()
      const response = await fetch(`${API_V1_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          customerEmail: form.email.trim(),
          pickup: form.pickup.trim(),
          destination: form.destination.trim(),
          scheduleAt,
          serviceType: form.serviceType === 'business' ? 'vip' : form.serviceType,
          customerTier: form.serviceType === 'business' ? 'business' : 'retail',
          notes: form.notes.trim(),
        }),
      })

      const result = await response.json()
      if (!response.ok || !result?.booking?.referenceCode) {
        throw new Error(result?.message || result?.error || 'Boeking mislukt.')
      }

      const code = result.booking.referenceCode
      setTrackingCode(code)
      setConfirmation(`Aanvraag ontvangen. Referentie: ${code}. Status: ${result.booking.status}. We bevestigen de rit na controle van beschikbaarheid en prijs.`)
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
      const response = await fetch(`${API_V1_BASE}/tracking/booking/${encodeURIComponent(code.toUpperCase())}`)
      const result = await response.json()

      if (!response.ok || !result?.booking) {
        throw new Error(result?.message || result?.error || 'Rit niet gevonden.')
      }

      const ride = result.booking
      setTrackingResult(`Rit ${ride.referenceCode ?? ride.code ?? code}: ${ride.status}`)
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: 24, marginTop: 28 }}>
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

              <button type="submit" disabled={submitting} style={{ border: 0, borderRadius: 16, padding: '15px 18px', background: gold, color: '#080808', fontWeight: 900, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Verwerken...' : 'Maak ritaanvraag'}
              </button>

              {confirmation && <p style={{ color: '#e5e7eb', marginTop: 8 }}>{confirmation}</p>}
            </div>
          </form>

          <aside style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 28, padding: 24, background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))' }}>
            <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>PRIJS EN BESCHIKBAARHEID</p>
            <h2 style={{ fontSize: 34, margin: '8px 0 16px' }}>Bevestiging per rit</h2>
            <p style={{ color: '#d1d5db', lineHeight: 1.7 }}>
              Na ontvangst controleren we de beschikbaarheid en route. U ontvangt daarna de definitieve prijs en bevestiging.
            </p>
          </aside>
        </div>
      </section>

      <section id="tracking" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 22px 70px' }}>
        <div style={{ border: '1px solid rgba(212,175,55,.2)', borderRadius: 28, padding: 24, background: '#101010' }}>
          <p style={{ color: gold, letterSpacing: 3, fontWeight: 900 }}>AANVRAAGSTATUS</p>
          <h2 style={{ fontSize: 36, margin: '8px 0 16px' }}>Controleer uw aanvraag</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12 }}>
            <input style={fieldStyle} placeholder="Bijvoorbeeld LV-MA37F9-F3A29D" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
            <button onClick={() => lookupTracking()} style={{ border: 0, borderRadius: 16, padding: '0 18px', background: gold, color: '#080808', fontWeight: 900 }}>
              {trackingLoading ? 'Controleren...' : 'Controleer status'}
            </button>
          </div>

          <p style={{ color: '#a1a1aa', marginTop: 14 }}>{trackingResult}</p>
        </div>
      </section>
    </main>
  )
}
