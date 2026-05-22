import { useMemo, useState } from 'react'

const charcoal = '#111214'
const gold = '#d4af37'

const serviceTypes = [
  { key: 'standard', label: 'Standard', base: 24, perKm: 1.8 },
  { key: 'business', label: 'Business', base: 35, perKm: 2.3 },
  { key: 'van', label: 'Mercedes Van', base: 42, perKm: 2.8 },
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
    const service = serviceTypes.find((item) => item.key === calc.service) ?? serviceTypes[0]
    const pseudoKm = Math.max(12, Math.min(80, Math.round((calc.origin.length + calc.destination.length) / 2.5)))
    const total = service.base + pseudoKm * service.perKm + (calc.night ? 18 : 0)
    return { total, pseudoKm, label: service.label }
  }, [calc])

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
