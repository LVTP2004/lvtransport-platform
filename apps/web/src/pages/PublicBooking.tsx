import { FormEvent, lazy, Suspense, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { CustomerConnection } from './CustomerAccount'
import { routePrices } from '../modules/pricing/constants/route-prices'
import { bookingSchedule } from '../modules/moni/services/booking-time'
import { readBookingStatus } from '../modules/moni/services/booking-status-client'
const CustomerAccount = lazy(() => import('./CustomerAccount'))

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '')
const API_V1_BASE = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`
const gold = '#d4af37'
const trackingPrompt = 'Voer uw ritcode in om uw taxi te volgen.'

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
  const bookingContext = useLocation().state as { pickup?: unknown; destination?: unknown } | null
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    pickup: typeof bookingContext?.pickup === 'string' ? bookingContext.pickup : '',
    destination: typeof bookingContext?.destination === 'string' ? bookingContext.destination : '',
    date: '',
    time: '',
    notes: '',
    serviceType: 'airport',
  })

  const destination = form.destination.trim().toLowerCase()
  const publishedDestination = destination === 'luchthaven zaventem' ? 'zaventem' : destination
  const price = form.serviceType === 'business' ? undefined
    : routePrices.find(route => route.destination.toLowerCase() === publishedDestination)

  const [connection, setConnection] = useState<CustomerConnection | null>(null)
  const [revision, setRevision] = useState(0)
  const [confirmedForm, setConfirmedForm] = useState('')
  const inFlight = useRef(false)
  const requestIntent = useRef<{ payload: string; key: string; customerId: string | null } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingResult, setTrackingResult] = useState(trackingPrompt)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const trackingAttempt = useRef(0)

  function updateTrackingCode(code: string) {
    trackingAttempt.current += 1
    setTrackingCode(code)
    setTrackingResult(trackingPrompt)
    setTrackingLoading(false)
  }

  async function submitBooking(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current || confirmedForm === JSON.stringify(form)) return
    inFlight.current = true
    setSubmitting(true)
    setConfirmation('')

    try {
      const scheduleAt = bookingSchedule(form.date, form.time)
      const payload = {
        customerName: form.name.trim(), customerPhone: form.phone.trim(), customerEmail: form.email.trim(),
        pickup: form.pickup.trim(), destination: form.destination.trim(), scheduleAt,
        serviceType: form.serviceType === 'business' ? 'vip' : form.serviceType,
        customerTier: form.serviceType === 'business' ? 'business' : 'retail', notes: form.notes.trim(),
      }
      const intent = JSON.stringify(payload)
      const customerId = connection?.userId ?? null
      if (requestIntent.current?.payload === intent && requestIntent.current.customerId !== customerId) {
        throw new Error('Meld u aan met hetzelfde account of stuur de aanvraag verder als dezelfde gast.')
      }
      if (!requestIntent.current || requestIntent.current.payload !== intent) {
        requestIntent.current = { payload: intent, key: crypto.randomUUID(), customerId }
      }
      const key = requestIntent.current.key
      let result: { booking?: { referenceCode: string; status: string }; message?: string; error?: string }
      if (connection) {
        result = await connection.client.request('/customer/bookings', { body: payload, key })
      } else {
        const response = await fetch(`${API_V1_BASE}/bookings`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
          body: JSON.stringify(payload),
        })
        result = await response.json()
        if (!response.ok) throw new Error(result?.message || 'Boeking mislukt.')
      }
      if (!result?.booking?.referenceCode) throw new Error(result?.message || result?.error || 'Boeking mislukt.')
      setConfirmedForm(JSON.stringify(form))
      setRevision(value => value + 1)

      const code = result.booking.referenceCode
      updateTrackingCode(code)
      setConfirmation(`Aanvraag ontvangen. Referentie: ${code}. Status: ${result.booking.status}. We bevestigen de rit na controle van beschikbaarheid en prijs.`)
    } catch (error) {
      setConfirmation(error instanceof Error ? error.message : 'Boeking mislukt.')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  async function lookupTracking() {
    if (trackingLoading || !trackingCode.trim()) return

    const attempt = ++trackingAttempt.current
    setTrackingLoading(true)
    setTrackingResult('')
    try {
      const ride = await readBookingStatus(trackingCode, API_V1_BASE)
      if (attempt === trackingAttempt.current) {
        setTrackingResult(`Rit ${ride.referenceCode}: ${ride.status}`)
      }
    } catch (error) {
      if (attempt === trackingAttempt.current) {
        setTrackingResult(error instanceof Error ? error.message : 'Tracking mislukt.')
      }
    } finally {
      if (attempt === trackingAttempt.current) setTrackingLoading(false)
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
              <input style={fieldStyle} aria-label="Vertrekadres" placeholder="Bijv. Antwerpen-Centraal" list="booking-places" autoComplete="off" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} required />
              <input style={fieldStyle} aria-label="Bestemming" placeholder="Bijv. Luchthaven Zaventem" list="booking-places" autoComplete="off" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
              <datalist id="booking-places">
                {['Antwerpen-Centraal', 'Antwerpen-Berchem', 'Luchthaven Antwerpen', 'Luchthaven Zaventem',
                  'Brussel', 'Mechelen', 'Gent', 'Schiphol', 'Eindhoven', 'Charleroi', 'Breda', 'Rotterdam', 'Brugge']
                  .map(place => <option key={place} value={place} />)}
              </datalist>

              <p id="booking-timezone">Vertrektijd in België</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input style={fieldStyle} type="date" aria-label="Vertrekdatum" aria-describedby="booking-timezone" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                <input style={fieldStyle} type="time" aria-label="Vertrektijd" aria-describedby="booking-timezone" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>

              <select style={fieldStyle} value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                <option value="airport">Airport</option>
                <option value="standard">Standaard</option>
                <option value="business">Business/VIP</option>
              </select>

              <textarea style={{ ...fieldStyle, minHeight: 96, resize: 'vertical' }} placeholder="Opmerking: vlucht, bagage, kinderstoel, voorkeurstaal..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

              <section data-booking-price aria-label="Prijsindicatie" aria-live="polite"
                style={{ border: '1px solid rgba(212,175,55,.25)', borderRadius: 14, padding: '12px 16px' }}>
                {price ? <>
                  <p>Gepubliceerde prijsindicatie voor {price.destination} <strong style={{ color: gold }}>{price.price}</strong></p>
                  <p>We bevestigen de prijs voor uw vertrekadres en rittype na uw aanvraag.</p>
                </> : <p>{destination
                  ? 'We bevestigen de prijs na controle van uw route en rittype.'
                  : 'Kies een bestemming om een gepubliceerde prijsindicatie te bekijken.'}</p>}
              </section>
              <button type="submit" disabled={submitting || confirmedForm === JSON.stringify(form)} style={{ border: 0, borderRadius: 16, padding: '15px 18px', background: gold, color: '#080808', fontWeight: 900, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
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
            <input style={fieldStyle} placeholder="Bijvoorbeeld 48271" value={trackingCode} onChange={(e) => updateTrackingCode(e.target.value)} />
            <button type="button" disabled={trackingLoading || !trackingCode.trim()} onClick={lookupTracking} style={{ border: 0, borderRadius: 16, padding: '0 18px', background: gold, color: '#080808', fontWeight: 900 }}>
              {trackingLoading ? 'Controleren...' : 'Controleer status'}
            </button>
          </div>

          <p role="status" style={{ color: '#a1a1aa', marginTop: 14 }}>{trackingResult}</p>
        </div>
      </section>
      <Suspense fallback={<p role="status">Account laden…</p>}>
        <CustomerAccount onConnection={setConnection} revision={revision} suggestedEmail={form.email} />
      </Suspense>
    </main>
  )
}
