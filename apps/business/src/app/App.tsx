import { useEffect, useMemo, useState } from 'react';

type BookingStep = 'route' | 'details' | 'confirm';
const navItems = ['Hero', 'Book', 'Track', 'Moni'];

export function App() {
  const [activeNav, setActiveNav] = useState('Hero');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>('route');
  const [fieldFocus, setFieldFocus] = useState('');
  const [trackingOn, setTrackingOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);

  const trackingStates = useMemo(
    () => ['Ride requested', 'Driver assigned', 'Driver approaching', 'Passenger onboard', 'Trip complete'],
    []
  );

  useEffect(() => {
    if (!trackingOn) return;
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev < trackingStates.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, [trackingOn, trackingStates.length]);

  const playTone = (frequency = 460, duration = 0.09) => {
    if (!soundOn) return;
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, duration * 1000);
  };

  const bookingProgress = bookingStep === 'route' ? 33 : bookingStep === 'details' ? 66 : 100;

  return (
    <main className="app-shell">
      <div className="ambient-layer" />

      <header className="top-nav glass">
        <div className="brand">LVTRANSPORT LIVE OPS</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-btn ${activeNav === item ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(item);
                playTone(520, 0.08);
              }}
            >
              {item}
            </button>
          ))}
        </nav>
        <button className="sound-toggle" onClick={() => setSoundOn((s) => !s)}>
          {soundOn ? 'Sound On' : 'Sound Off'}
        </button>
      </header>

      <section className="hero glass depth-card">
        <div className="hero-copy">
          <h1>Premium Interactive Mobility Platform</h1>
          <p>
            Real-time operational atmosphere with intelligent motion, smooth interactions, and confident booking flow.
          </p>
          <div className="hero-actions">
            <button className="cta" onClick={() => setActiveNav('Book')}>Start Booking</button>
            <button className="ghost" onClick={() => setAssistantOpen(true)}>Open Moni Ride</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="route-grid" />
          <div className="moving-glow glow-a" />
          <div className="moving-glow glow-b" />
          <div className="route-line route-1" />
          <div className="route-line route-2" />
        </div>
      </section>

      <section className="panel-grid">
        <article className="glass depth-card booking">
          <h2>Immersive Booking Flow</h2>
          <div className="progress-wrap"><div className="progress" style={{ width: `${bookingProgress}%` }} /></div>
          <div className="field-group">
            <input className={fieldFocus === 'pickup' ? 'focused' : ''} placeholder="Pickup" onFocus={() => setFieldFocus('pickup')} onBlur={() => setFieldFocus('')} />
            <input className={fieldFocus === 'dropoff' ? 'focused' : ''} placeholder="Dropoff" onFocus={() => setFieldFocus('dropoff')} onBlur={() => setFieldFocus('')} />
          </div>
          <div className="booking-actions">
            <button onClick={() => { setBookingStep('route'); playTone(420); }}>Route</button>
            <button onClick={() => { setBookingStep('details'); playTone(480); }}>Details</button>
            <button onClick={() => { setBookingStep('confirm'); playTone(560, 0.12); }}>Confirm</button>
          </div>
          <p className="hint">Current step: <strong>{bookingStep}</strong></p>
        </article>

        <article className="glass depth-card tracking">
          <h2>Live Tracking Evolution</h2>
          <button className="cta small" onClick={() => { setTrackingOn(true); setStatusIndex(0); playTone(510); }}>Start Live Tracking</button>
          <ul className="timeline">
            {trackingStates.map((state, idx) => (
              <li key={state} className={idx <= statusIndex ? 'done' : ''}>{state}</li>
            ))}
          </ul>
        </article>
      </section>

      <aside className={`moni ${assistantOpen ? 'open' : ''}`}>
        <button className="moni-trigger" onClick={() => { setAssistantOpen((o) => !o); playTone(600, 0.08); }}>
          Moni Ride
        </button>
        <div className="moni-panel glass">
          <h3>Moni Ride Assistant</h3>
          <p>Quick fare estimate + operational shortcuts.</p>
          <div className="quick-cards">
            <button>Estimate Fare</button>
            <button>Map Preview</button>
            <button>Priority Support</button>
          </div>
        </div>
      </aside>
    </main>
  );
}
