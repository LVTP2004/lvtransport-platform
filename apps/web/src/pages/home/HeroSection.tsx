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
const colors = {
  bg: '#111214',
  panel: '#17181c',
  panelSoft: '#1d1f24',
  border: 'rgba(212,175,55,.28)',
  text: '#f3f0e7',
  textMuted: '#b8bcc6',
  gold: '#d4af37',
}

const rideTypes = [
  { key: 'standaard', label: 'Standaard' },
  { key: 'zakelijk', label: 'Zakelijk' },
  { key: 'luchthaven', label: 'Luchthaven' },
]

const pricing = [
  { destination: 'Zaventem', from: '€85' },
  { destination: 'Brussel', from: '€95' },
  { destination: 'Mechelen', from: '€70' },
  { destination: 'Gent', from: '€140' },
  { destination: 'Schiphol', from: '€240' },
]

const services = ['Taxi Antwerpen', 'Luchthavenvervoer', 'Zakelijk vervoer', 'Haven transport', 'Lange afstand']

const section: React.CSSProperties = {
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
  padding: '28px 18px',
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [booking, setBooking] = useState({ pickup: '', destination: '', date: '', time: '', rideType: rideTypes[0].key, phone: '' })
  const [calc, setCalc] = useState({ pickup: '', destination: '', rideType: rideTypes[0].key, datetime: '' })
  const [rideCode, setRideCode] = useState('')

  const estimate = useMemo(() => {
    const chars = calc.pickup.length + calc.destination.length
    if (!calc.pickup || !calc.destination) {
      return { price: '—', route: 'Vul vertrek en bestemming in', duration: '—' }
    }
    const pseudoKm = Math.max(8, Math.min(120, Math.round(chars / 2.4)))
    const base = calc.rideType === 'zakelijk' ? 38 : calc.rideType === 'luchthaven' ? 44 : 28
    const estimated = base + pseudoKm * 2.1
    const mins = Math.max(18, Math.min(130, Math.round(pseudoKm * 2.4)))
    return {
      price: `€${estimated.toFixed(0)}`,
      route: `Geschatte route: ± ${pseudoKm} km`,
      duration: `Geschatte duur: ${mins} min`,
    }
  }, [calc])
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
    <main style={{ background: colors.bg, color: colors.text, minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, padding: '14px 14px 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', border: `1px solid ${colors.border}`, borderRadius: 16, background: 'rgba(23,24,28,.84)', backdropFilter: 'blur(14px)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/brand/lv-logo-header.svg" alt="LV Transport" style={{ height: 22 }} />
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" style={iconButton}>☰</button>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(17,18,20,.97)', backdropFilter: 'blur(8px)', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setMenuOpen(false)} aria-label="Sluit menu" style={iconButton}>✕</button>
          </div>
          <nav style={{ display: 'grid', gap: 18, marginTop: 40 }}>
            {['HOME', 'DIENSTEN', 'PRIJZEN', 'TRACKING', 'CONTACT'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={menuLink}>{item}</a>
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Home', 'Calculator', 'Booking', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: '#f5f5f5', textDecoration: 'none', padding: '9px 14px', borderRadius: 999, fontSize: 13, background: 'rgba(255,255,255,.04)' }}>{item}</a>
            ))}
          </nav>
          <div style={{ marginTop: 42, display: 'grid', gap: 10 }}>
            <a href="tel:+32000000000" style={secondaryLink}>Bel nu</a>
            <a href="https://wa.me/32000000000" style={secondaryLink}>WhatsApp</a>
          </div>
        </div>
      )}

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
      <section id="home" style={{ ...section, paddingTop: 34 }}>
        <div style={{ borderRadius: 26, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
          <div style={{ minHeight: 540, backgroundImage: 'linear-gradient(95deg, rgba(17,18,20,.92) 20%, rgba(23,24,28,.76) 55%, rgba(35,37,43,.56) 100%), url(/brand/lvtransport/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }}>
            <div style={{ maxWidth: 700, padding: '52px 28px' }}>
              <h1 style={{ margin: '0 0 16px', lineHeight: 1.04, fontSize: 'clamp(38px,6vw,74px)' }}>Betrouwbaar.<br/>Comfortabel.<br/>Altijd op tijd.</h1>
              <p style={{ fontSize: 19, color: colors.textMuted, maxWidth: 560, lineHeight: 1.6 }}>Premium vervoer in Antwerpen en België.<br/>24/7 beschikbaar.</p>
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
      <section id="booking" style={section}>
        <div style={card}>
          <h2 style={h2}>Boeking</h2>
          <p style={muted}>Boekingsaanvragen worden door ons team bevestigd via telefoon of bericht. Er wordt geen automatische ritbevestiging getoond zonder backend-validatie.</p>
          <div style={grid2}>
            <input placeholder="Pickup" value={booking.pickup} onChange={(e) => setBooking((s) => ({ ...s, pickup: e.target.value }))} style={input} />
            <input placeholder="Bestemming" value={booking.destination} onChange={(e) => setBooking((s) => ({ ...s, destination: e.target.value }))} style={input} />
            <input type="date" value={booking.date} onChange={(e) => setBooking((s) => ({ ...s, date: e.target.value }))} style={input} />
            <input type="time" value={booking.time} onChange={(e) => setBooking((s) => ({ ...s, time: e.target.value }))} style={input} />
            <select value={booking.rideType} onChange={(e) => setBooking((s) => ({ ...s, rideType: e.target.value }))} style={input}>{rideTypes.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
            <input placeholder="Telefoon" value={booking.phone} onChange={(e) => setBooking((s) => ({ ...s, phone: e.target.value }))} style={input} />
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
          <button type="button" style={cta}>Reserveer nu</button>
        </div>
      </section>

      <section id="diensten" style={section}><div style={card}><h2 style={h2}>Diensten</h2><div style={serviceGrid}>{services.map((name) => <article key={name} style={serviceCard}><div style={dot} />{name}</article>)}</div></div></section>

      <section id="prijzen" style={section}>
        <div style={card}>
          <h2 style={h2}>Prijzen</h2>
          <div style={serviceGrid}>{pricing.map((p) => <article key={p.destination} style={serviceCard}><strong>{p.destination}</strong><span style={{ color: colors.textMuted }}>Vanaf {p.from}</span></article>)}</div>
        </div>
      </section>

      <section style={section}>
        <div style={card}>
          <h2 style={h2}>Smart calculator</h2>
          <div style={grid2}>
            <input placeholder="Pickup" value={calc.pickup} onChange={(e) => setCalc((s) => ({ ...s, pickup: e.target.value }))} style={input} />
            <input placeholder="Bestemming" value={calc.destination} onChange={(e) => setCalc((s) => ({ ...s, destination: e.target.value }))} style={input} />
            <select value={calc.rideType} onChange={(e) => setCalc((s) => ({ ...s, rideType: e.target.value }))} style={input}>{rideTypes.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
            <input type="datetime-local" value={calc.datetime} onChange={(e) => setCalc((s) => ({ ...s, datetime: e.target.value }))} style={input} />
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
          <p style={{ marginBottom: 8, color: '#f2dfab' }}>Geschatte prijs: {estimate.price}</p>
          <p style={muted}>{estimate.route} · {estimate.duration}</p>
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
      <section id="tracking" style={section}>
        <div style={card}>
          <h2 style={h2}>Tracking</h2>
          <p style={muted}>Voer je ritcode in om tracking te openen. Tracking beschikbaar na bevestiging van rit.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input placeholder="Ritcode (max 5 cijfers)" value={rideCode} maxLength={5} onChange={(e) => setRideCode(e.target.value.replace(/\D/g, ''))} style={{ ...input, maxWidth: 240 }} />
            <button type="button" style={ctaSecondary}>Tracking openen</button>
          </div>
          <p style={{ ...muted, marginTop: 12 }}>API contract: <code>POST /api/v1/tracking/access {'{ rideCode: string(5) }'}</code>.</p>
        </div>
      </section>

      <section id="contact" style={section}><div style={card}><h2 style={h2}>Contact</h2><p style={muted}>Bel of WhatsApp voor directe ondersteuning, of gebruik het boekingsformulier voor geplande ritten.</p></div></section>

      <aside aria-label="MoniRide" style={{ position: 'fixed', right: 16, bottom: 16, width: 54, height: 54, borderRadius: '50%', background: 'rgba(23,24,28,.96)', border: `1px solid ${colors.border}`, display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(212,175,55,.16)', color: '#f2dfab', fontWeight: 700 }}>LV</aside>
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

const iconButton: React.CSSProperties = { background: 'transparent', border: '1px solid rgba(212,175,55,.32)', color: '#f3f0e7', width: 36, height: 36, borderRadius: 10, cursor: 'pointer' }
const menuLink: React.CSSProperties = { color: '#f3f0e7', textDecoration: 'none', letterSpacing: '.05em', fontSize: 'clamp(28px,5vw,54px)' }
const secondaryLink: React.CSSProperties = { color: '#d4af37', textDecoration: 'none', fontSize: 16 }
const h2: React.CSSProperties = { marginTop: 0, marginBottom: 10, fontSize: 30 }
const muted: React.CSSProperties = { color: colors.textMuted, marginTop: 0, lineHeight: 1.6 }
const grid2: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }
const serviceGrid: React.CSSProperties = { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }
const card: React.CSSProperties = { border: `1px solid ${colors.border}`, borderRadius: 22, padding: 22, background: `linear-gradient(145deg, ${colors.panel}, ${colors.panelSoft})` }
const serviceCard: React.CSSProperties = { border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, background: 'rgba(17,18,20,.72)', display: 'grid', gap: 8 }
const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: '50%', background: colors.gold }
const input: React.CSSProperties = { border: '1px solid rgba(212,175,55,.24)', borderRadius: 12, padding: '12px 13px', background: '#111214', color: colors.text, width: '100%', boxSizing: 'border-box' }
const cta: React.CSSProperties = { marginTop: 14, background: colors.gold, color: '#111214', border: 0, borderRadius: 12, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }
const ctaSecondary: React.CSSProperties = { ...cta, background: 'transparent', color: colors.text, border: '1px solid rgba(212,175,55,.32)' }
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

const primaryButtonStyle: React.CSSProperties = {
  background: gold,
  color: charcoal,
  padding: '14px 20px',
  borderRadius: 14,
  textDecoration: 'none',
  fontWeight: 800,
  border: '1px solid rgba(212,175,55,.5)',
}
