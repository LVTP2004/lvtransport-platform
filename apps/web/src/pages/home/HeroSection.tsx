import { useMemo, useState } from 'react'

const charcoal = '#111214'
const gold = '#d4af37'

const rideTypes = [
  { key: 'standard', label: 'Standard', base: 24, perKm: 1.75, avgKmh: 46 },
  { key: 'business', label: 'Business', base: 34, perKm: 2.25, avgKmh: 48 },
  { key: 'van', label: 'Mercedes Van', base: 42, perKm: 2.85, avgKmh: 44 },
]

type TrackingStatus = 'confirmed' | 'en_route' | 'nearby' | 'arrived' | 'completed' | 'cancelled'

type TrackingResponse = {
  code: string
  status: TrackingStatus
  message?: string
  updatedAt?: string
}

type TrackingPanelState = 'idle' | 'loading' | 'success' | 'fallback'

const statusContent: Record<TrackingStatus, { label: string; message: string }> = {
  confirmed: { label: 'Bevestigd', message: 'Uw rit is bevestigd. Tracking beschikbaar zodra uw rit bevestigd is.' },
  en_route: { label: 'Onderweg', message: 'Uw chauffeur is onderweg.' },
  nearby: { label: 'Bij u in de buurt', message: 'Uw chauffeur is in de buurt van uw ophaallocatie.' },
  arrived: { label: 'Aangekomen', message: 'Uw chauffeur is aangekomen op de ophaallocatie.' },
  completed: { label: 'Rit voltooid', message: 'Uw rit is succesvol voltooid.' },
  cancelled: { label: 'Geannuleerd', message: 'Deze rit is geannuleerd. Neem contact op als u hulp nodig heeft.' },
}

const sectionWrap: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '32px 18px',
}

type CalculatorState = {
  pickup: string
  destination: string
  rideType: string
  date: string
  time: string
}

type BookingState = {
  pickup: string
  destination: string
  date: string
  time: string
  rideType: string
  phone: string
  notes: string
}

export default function HeroSection() {
  const [calculator, setCalculator] = useState<CalculatorState>({ pickup: '', destination: '', rideType: rideTypes[0].key, date: '', time: '' })
  const [booking, setBooking] = useState<BookingState>({ pickup: '', destination: '', date: '', time: '', rideType: rideTypes[0].key, phone: '', notes: '' })
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submissionMessage, setSubmissionMessage] = useState('')
type TrackingStatus = 'confirmed' | 'en_route' | 'nearby' | 'arrived' | 'completed' | 'cancelled'

type TrackingResult = {
  code: string
  status: TrackingStatus
  message?: string
  updatedAt?: string
}

const statusLabels: Record<TrackingStatus, string> = {
  confirmed: 'Bevestigd',
  en_route: 'Onderweg',
  nearby: 'Bij u in de buurt',
  arrived: 'Aangekomen',
  completed: 'Rit voltooid',
  cancelled: 'Geannuleerd',
}

const statusMessages: Record<TrackingStatus, string> = {
  confirmed: 'Uw rit is bevestigd. Tracking beschikbaar zodra uw rit bevestigd is.',
  en_route: 'Uw chauffeur is onderweg.',
  nearby: 'Uw chauffeur is bij u in de buurt.',
  arrived: 'Uw chauffeur is aangekomen.',
  completed: 'Uw rit is voltooid.',
  cancelled: 'Uw rit is geannuleerd.',
}

export default function HeroSection() {
  const [calc, setCalc] = useState({ origin: '', destination: '', service: serviceTypes[0].key, night: false })
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingError, setTrackingError] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [trackingTried, setTrackingTried] = useState(false)
  const [trackingValidation, setTrackingValidation] = useState('')
  const [trackingState, setTrackingState] = useState<TrackingPanelState>('idle')
  const [trackingResult, setTrackingResult] = useState<TrackingResponse | null>(null)

  const estimate = useMemo(() => {
    const selectedRide = rideTypes.find((item) => item.key === calculator.rideType) ?? rideTypes[0]
    const routeReady = calculator.pickup.trim().length > 2 && calculator.destination.trim().length > 2

    if (!routeReady) {
      return { ready: false, price: 0, distanceKm: 0, durationMin: 0, rideLabel: selectedRide.label }
    }

    const rawSignal = calculator.pickup.trim().length * 1.6 + calculator.destination.trim().length * 1.4
    const distanceKm = Math.max(6, Math.min(90, Math.round(rawSignal)))
    const durationMin = Math.max(14, Math.round((distanceKm / selectedRide.avgKmh) * 60 + 7))
    const daytimeModifier = calculator.time && Number(calculator.time.split(':')[0]) >= 22 ? 1.12 : 1
    const price = (selectedRide.base + distanceKm * selectedRide.perKm) * daytimeModifier

    return {
      ready: true,
      price,
      distanceKm,
      durationMin,
      rideLabel: selectedRide.label,
    }
  }, [calculator])

  const syncEstimateToBooking = () => {
    setBooking((prev) => ({
      ...prev,
      pickup: calculator.pickup,
      destination: calculator.destination,
      date: calculator.date || prev.date,
      time: calculator.time || prev.time,
      rideType: calculator.rideType,
    }))
    const bookingSection = document.getElementById('booking')
    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmissionState('submitting')
    setSubmissionMessage('')

    const payload = {
      pickup: booking.pickup.trim(),
      destination: booking.destination.trim(),
      date: booking.date,
      time: booking.time,
      rideType: booking.rideType,
      phone: booking.phone.trim(),
      notes: booking.notes.trim() || undefined,
    }

    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setSubmissionState('success')
      setSubmissionMessage('Uw aanvraag werd ontvangen. We nemen snel contact op om uw rit te bevestigen.')
    } catch {
      setSubmissionState('error')
      setSubmissionMessage('Aanvraag tijdelijk niet verzonden. Probeer opnieuw of bel ons direct voor een snelle reservatie.')
    }
  }

  const submitTrackingLookup = async () => {
    if (!trackingCode) {
      setTrackingError('Voer een geldige ritcode in om tracking te openen.')
      setTrackingTried(false)
      setTrackingResult(null)
      return
    }

    setTrackingLoading(true)
    setTrackingError('')
    setTrackingTried(true)

    try {
      const response = await fetch(`/api/v1/tracking/${trackingCode}`)
      if (!response.ok) throw new Error('lookup_failed')
      const payload = (await response.json()) as TrackingResult
      if (!payload?.status || !(payload.status in statusLabels)) throw new Error('invalid_payload')
      setTrackingResult({ ...payload, code: trackingCode })
    } catch {
      setTrackingResult(null)
    } finally {
      setTrackingLoading(false)
  const onTrackingCodeChange = (value: string) => {
    const numericOnly = value.replace(/\D/g, '').slice(0, 5)
    setTrackingCode(numericOnly)
    setTrackingValidation('')
  }

  const loadTracking = async () => {
    if (!trackingCode) {
      setTrackingValidation('Voer een geldige ritcode in om tracking te openen.')
      return
    }

    setTrackingState('loading')
    setTrackingResult(null)

    try {
      const response = await fetch(`/api/v1/tracking/${trackingCode}`)

      if (!response.ok) {
        throw new Error('Tracking unavailable')
      }

      const data = (await response.json()) as TrackingResponse

      if (!data?.code || !data?.status || !(data.status in statusContent)) {
        throw new Error('Invalid tracking payload')
      }

      setTrackingResult(data)
      setTrackingState('success')
    } catch {
      setTrackingState('fallback')
    }
  }

  return (
    <main style={{ background: '#090a0b', color: 'white', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <header style={{ position: 'sticky', top: 12, zIndex: 50, padding: '0 12px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(212,175,55,.22)', borderRadius: 18, background: 'rgba(12,14,18,.76)', backdropFilter: 'blur(18px)' }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 22 }} />
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Home', 'Calculator', 'Booking', 'Contact'].map((item) => (
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
                <span style={{ fontSize: 12, color: '#f6e8ba', letterSpacing: '.08em', textTransform: 'uppercase' }}>Quiet Premium Mobility</span>
              </div>

              <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(42px,7vw,74px)', lineHeight: 1.02, fontWeight: 800 }}>
                Reserveer uw premium rit in Antwerpen in enkele seconden
              </h1>

              <p style={{ maxWidth: 620, color: '#d7d9de', fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
                Bereken eerst uw ritinschatting en rond daarna uw aanvraag rustig af met een heldere boeking.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="#calculator" style={{ background: gold, color: charcoal, padding: '14px 20px', borderRadius: 14, textDecoration: 'none', fontWeight: 800 }}>Bereken uw rit</a>
                <a href="#booking" style={{ border: '1px solid rgba(212,175,55,.34)', color: 'white', padding: '14px 20px', borderRadius: 14, textDecoration: 'none', background: 'rgba(255,255,255,.05)' }}>Direct reserveren</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" style={sectionWrap}>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
          <div style={{ borderRadius: 24, padding: 24, background: 'rgba(18,20,24,.92)', border: '1px solid rgba(212,175,55,.16)' }}>
            <h2 style={{ marginTop: 0 }}>Smart calculator</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <input placeholder="Pickup" value={calculator.pickup} onChange={(e) => setCalculator((p) => ({ ...p, pickup: e.target.value }))} style={inputStyle} />
              <input placeholder="Destination" value={calculator.destination} onChange={(e) => setCalculator((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} />
              <select value={calculator.rideType} onChange={(e) => setCalculator((p) => ({ ...p, rideType: e.target.value }))} style={inputStyle}>
                {rideTypes.map((service) => <option key={service.key} value={service.key}>{service.label}</option>)}
              </select>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
                <input type="date" value={calculator.date} onChange={(e) => setCalculator((p) => ({ ...p, date: e.target.value }))} style={inputStyle} />
                <input type="time" value={calculator.time} onChange={(e) => setCalculator((p) => ({ ...p, time: e.target.value }))} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 24, padding: 24, background: 'linear-gradient(145deg, rgba(212,175,55,.12), rgba(20,20,24,.92))', border: '1px solid rgba(212,175,55,.22)', display: 'grid', alignContent: 'space-between', gap: 18 }}>
            <div>
              <p style={{ margin: 0, color: '#f3d98b', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 12 }}>Premium ritinschatting</p>
              <h3 style={{ fontSize: 56, margin: '10px 0 6px' }}>{estimate.ready ? `€${estimate.price.toFixed(0)}` : '—'}</h3>
              <p style={{ color: '#d9d9d9', margin: 0 }}>Geschatte prijs</p>
              <p style={{ color: '#e6e6e6', margin: '16px 0 0' }}>Geschatte afstand: {estimate.ready ? `~${estimate.distanceKm} km` : 'Vul pickup en destination in'}</p>
              <p style={{ color: '#e6e6e6', margin: '6px 0 0' }}>Geschatte reistijd: {estimate.ready ? `~${estimate.durationMin} min` : 'Nog niet beschikbaar'}</p>
              <p style={{ color: '#bcbcbc', margin: '16px 0 0', fontSize: 13 }}>{estimate.rideLabel} · Indicatief tarief, definitieve prijs na routecontrole.</p>
            </div>
            <button type="button" onClick={syncEstimateToBooking} disabled={!estimate.ready} style={{ ...primaryButtonStyle, opacity: estimate.ready ? 1 : 0.6, cursor: estimate.ready ? 'pointer' : 'not-allowed' }}>
              Reserveer deze rit
            </button>
          </div>
        </div>
      </section>

      <section id="booking" style={sectionWrap}>
        <div style={{ borderRadius: 24, padding: 24, background: 'rgba(14,15,18,.96)', border: '1px solid rgba(212,175,55,.18)' }}>
          <h2 style={{ marginTop: 0 }}>Booking</h2>
          <p style={{ color: '#d0d0d0', marginTop: 0 }}>Vul uw ritgegevens in. We verwerken uw aanvraag zorgvuldig en nemen contact op voor bevestiging.</p>
          <form onSubmit={submitBooking} style={{ display: 'grid', gap: 12 }}>
            <input required placeholder="Pickup" value={booking.pickup} onChange={(e) => setBooking((p) => ({ ...p, pickup: e.target.value }))} style={inputStyle} />
            <input required placeholder="Destination" value={booking.destination} onChange={(e) => setBooking((p) => ({ ...p, destination: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
              <input required type="date" value={booking.date} onChange={(e) => setBooking((p) => ({ ...p, date: e.target.value }))} style={inputStyle} />
              <input required type="time" value={booking.time} onChange={(e) => setBooking((p) => ({ ...p, time: e.target.value }))} style={inputStyle} />
            </div>
            <select required value={booking.rideType} onChange={(e) => setBooking((p) => ({ ...p, rideType: e.target.value }))} style={inputStyle}>
              {rideTypes.map((service) => <option key={service.key} value={service.key}>{service.label}</option>)}
            </select>
            <input required placeholder="Telefoonnummer" value={booking.phone} onChange={(e) => setBooking((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Notities (optioneel)" value={booking.notes} onChange={(e) => setBooking((p) => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 94, resize: 'vertical' }} />
            <button type="submit" disabled={submissionState === 'submitting'} style={{ ...primaryButtonStyle, width: 'fit-content' }}>
              {submissionState === 'submitting' ? 'Aanvraag verzenden…' : 'Verstuur aanvraag'}
            </button>
            {submissionMessage ? <p style={{ margin: 0, color: submissionState === 'success' ? '#f3d98b' : '#ffb9a3' }}>{submissionMessage}</p> : null}
          </form>
        </div>
      </section>

      <section id="contact" style={sectionWrap}>
        <p style={{ color: '#b9bbc2', margin: 0, textAlign: 'center' }}>LV Transport · Premium private mobility in Antwerpen</p>
      </section>

      <aside aria-label="MoniRide assistant" style={{ position: 'fixed', bottom: 18, right: 18, width: 58, height: 58, borderRadius: '50%', border: '1px solid rgba(212,175,55,.48)', background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,.42), rgba(16,16,18,.98))', boxShadow: '0 0 30px rgba(212,175,55,.35)', display: 'grid', placeItems: 'center', fontSize: 24, color: '#fff4cf', zIndex: 60, cursor: 'default' }}>
        LV
      </aside>
      <section id="tracking" style={sectionWrap}>
        <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(212,175,55,.18)', background: 'rgba(12,13,16,.95)' }}>
          <div style={{ padding: 24, borderBottom: '1px solid rgba(212,175,55,.14)' }}>
            <h2 style={{ margin: 0 }}>MoniRide Tracking</h2>
            <p style={{ color: '#cfcfcf', marginBottom: 0 }}>Volg uw rit veilig met uw ritcode.</p>
          </div>
          <div style={{ padding: 24, display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <input
                value={trackingCode}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, '').slice(0, 5)
                  setTrackingCode(next)
                  setTrackingError('')
                }}
                inputMode="numeric"
                maxLength={5}
                placeholder="Voer uw ritcode in"
                style={{ ...inputStyle, maxWidth: 220 }}
              />
              <button
                type="button"
                onClick={submitTrackingLookup}
                disabled={trackingLoading}
                style={{ border: '1px solid rgba(212,175,55,.34)', color: 'white', padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,.05)', fontWeight: 700, cursor: 'pointer' }}
              >
                {trackingLoading ? 'Bezig met ophalen...' : 'Tracking openen'}
              </button>
            </div>
            {trackingError ? <p style={{ margin: 0, color: '#f6e8ba' }}>{trackingError}</p> : null}

            <div style={{ borderRadius: 20, border: '1px solid rgba(212,175,55,.18)', background: 'linear-gradient(150deg, rgba(18,20,24,.96), rgba(14,16,20,.92))', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, color: '#c9c9c9', fontSize: 13 }}>Ritcode: {trackingCode || '— — — — —'}</p>
                <span style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(212,175,55,.42)', display: 'grid', placeItems: 'center', color: '#f1d785', fontSize: 11 }}>LV</span>
              </div>
              {trackingLoading ? (
                <p style={{ margin: 0, color: '#d6d6d6' }}>Uw ritstatus wordt opgehaald.</p>
              ) : trackingResult ? (
                <>
                  <h3 style={{ margin: '0 0 8px', color: '#f2dea1' }}>{statusLabels[trackingResult.status]}</h3>
                  <p style={{ margin: 0, color: '#d4d7db' }}>{trackingResult.message || statusMessages[trackingResult.status]}</p>
                </>
              ) : trackingTried ? (
                <>
                  <h3 style={{ margin: '0 0 8px', color: '#f2dea1' }}>Tracking tijdelijk niet beschikbaar</h3>
                  <p style={{ margin: 0, color: '#d4d7db' }}>We kunnen uw rit tijdelijk niet automatisch ophalen. Neem contact op via WhatsApp of telefoon met uw ritcode.</p>
                </>
              ) : (
                <p style={{ margin: 0, color: '#d6d6d6' }}>Tracking beschikbaar zodra uw rit bevestigd is.</p>
              )}
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="tel:+32466487936" style={{ border: '1px solid rgba(212,175,55,.28)', color: '#f4f4f4', textDecoration: 'none', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.03)' }}>Bel nu</a>
                <a href="https://wa.me/32466487936" style={{ border: '1px solid rgba(212,175,55,.28)', color: '#f4f4f4', textDecoration: 'none', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.03)' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(212,175,55,.18)', background: 'rgba(12,13,16,.95)', padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>MoniRide tracking</h2>
          <p style={{ color: '#cfcfcf', marginTop: 0 }}>Volg uw rit veilig en eenvoudig met uw ritcode.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: trackingValidation ? 8 : 18 }}>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder="Voer uw ritcode in"
              aria-label="Ritcode"
              value={trackingCode}
              onChange={(e) => onTrackingCodeChange(e.target.value)}
              style={{ ...inputStyle, maxWidth: 260 }}
            />
            <button
              type="button"
              onClick={loadTracking}
              style={{ background: gold, color: charcoal, padding: '14px 20px', borderRadius: 14, border: 0, fontWeight: 800, cursor: 'pointer' }}
            >
              Tracking openen
            </button>
          </div>

          {trackingValidation ? <p style={{ color: '#f0d484', marginTop: 0 }}>{trackingValidation}</p> : null}

          {(trackingState !== 'idle' || trackingResult) ? (
            <div style={{ marginTop: 18, borderRadius: 20, border: '1px solid rgba(212,175,55,.25)', background: 'linear-gradient(145deg, rgba(20,22,28,.94), rgba(14,15,20,.98))', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: gold, boxShadow: '0 0 14px rgba(212,175,55,.8)' }} />
                  <span style={{ color: '#f3d98b', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>MoniRide operationeel</span>
                </div>
                <span style={{ color: '#e2e2e2', fontSize: 14 }}>Ritcode: {trackingCode}</span>
              </div>

              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,.6), rgba(212,175,55,.05))', marginBottom: 14 }} />

              {trackingState === 'loading' && (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Uw ritstatus wordt opgehaald.</p>
                  <p style={{ margin: 0, color: '#cbced4' }}>Even geduld terwijl MoniRide uw ritinformatie controleert.</p>
                </>
              )}

              {trackingState === 'success' && trackingResult && (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700 }}>{statusContent[trackingResult.status].label}</p>
                  <p style={{ margin: 0, color: '#cbced4' }}>{statusContent[trackingResult.status].message}</p>
                </>
              )}

              {trackingState === 'fallback' && (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>We kunnen uw rit tijdelijk niet automatisch ophalen.</p>
                  <p style={{ marginTop: 0, color: '#cbced4' }}>Neem contact op via WhatsApp of telefoon met uw ritcode.</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href="tel:+32466487936" style={{ border: '1px solid rgba(212,175,55,.34)', color: 'white', padding: '10px 14px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,255,255,.05)' }}>Bel nu</a>
                    <a href="https://wa.me/32466487936" target="_blank" rel="noreferrer" style={{ border: '1px solid rgba(212,175,55,.34)', color: 'white', padding: '10px 14px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,255,255,.05)' }}>WhatsApp</a>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </section>
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

const primaryButtonStyle: React.CSSProperties = {
  background: gold,
  color: charcoal,
  padding: '14px 20px',
  borderRadius: 14,
  textDecoration: 'none',
  fontWeight: 800,
  border: '1px solid rgba(212,175,55,.5)',
}
