import { useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';

type Vehicle = {
  name: string;
  eta: string;
  priceMultiplier: number;
  seats: number;
  serviceType: ServiceType;
};

type BookingConfirmation = {
  id: string;
  referenceCode: string;
  status: string;
};

const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];

const formatDateTime = (value: string) => {
  if (!value) return 'Select schedule';
  return new Date(value).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export function App() {
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [businessVip, setBusinessVip] = useState(true);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const baseFare = useMemo(() => {
    const distanceFactor = Math.max(14, (pickup.length + destination.length) * 0.8);
    const passengerFactor = passengers > 3 ? (passengers - 3) * 6 : 0;
    const airportFee = airportTransfer ? 18 : 0;
    const vipFee = businessVip ? 24 : 0;
    return Math.round((distanceFactor + passengerFactor + airportFee + vipFee) * vehicle.priceMultiplier);
  }, [airportTransfer, businessVip, destination.length, passengers, pickup.length, vehicle.priceMultiplier]);

  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;

  const submitBooking = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'Unable to create booking');

      setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create booking');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((v) => (v < 3 ? ((v + 1) as Step) : v));
  const prevStep = () => setStep((v) => (v > 1 ? ((v - 1) as Step) : v));

  return (<div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl"><header className="glass-panel mb-6 rounded-3xl p-5 sm:p-7"><p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Booking</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Premium ride booking, built for enterprise pace.</h1><p className="mt-3 max-w-2xl text-sm text-lv-mist sm:text-base">Smart routing-ready UI prepared for future maps, places autocomplete, and dispatch APIs.</p></header><section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="glass-panel rounded-3xl p-4 sm:p-6">{confirmation ? (<div className="space-y-4"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Booking confirmed</p><h2 className="text-2xl font-semibold">Reference: {confirmation.referenceCode}</h2><p className="text-lv-mist">Status: {confirmation.status}</p><p className="text-lv-mist">Pickup confirmed from {pickup} to {destination} on {formatDateTime(dateTime)}.</p><Button className="shadow-gold-md" onClick={() => window.location.reload()}>Create another booking</Button></div>) : (<><div className="mb-6 flex items-center justify-between"><p className="text-sm text-lv-mist">Step {step} of 3</p><div className="flex w-32 gap-2">{[1, 2, 3].map((i) => (<span key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-lv-gold' : 'bg-white/15'}`} />))}</div></div><div key={step} className="booking-step-fade space-y-4">{step===1&&<><label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e)=>setPickup(e.target.value)} placeholder="Hotel, office, terminal..."/></label><label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Airport, venue, client site..."/></label><label className="field-wrap"><span>Date & time</span><input type="datetime-local" value={dateTime} onChange={(e)=>setDateTime(e.target.value)}/></label></>}{step===2&&<><div className="field-wrap"><span>Passengers</span><div className="mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3"><button className="control-btn" onClick={()=>setPassengers((v)=>Math.max(1,v-1))}>−</button><strong className="text-lg">{passengers}</strong><button className="control-btn" onClick={()=>setPassengers((v)=>Math.min(12,v+1))}>+</button></div></div><div><p className="mb-2 text-sm text-lv-mist">Vehicle</p><div className="grid gap-3">{vehicles.map((item)=><button key={item.name} onClick={()=>setVehicle(item)} className={`vehicle-card ${vehicle.name===item.name?'vehicle-card--active':''}`}><div><p className="font-medium">{item.name}</p><p className="text-xs text-lv-mist">ETA {item.eta} • up to {item.seats} passengers</p></div><p className="text-lv-champagne">x{item.priceMultiplier.toFixed(2)}</p></button>)}</div></div></>}{step===3&&<><button className={`toggle-card ${airportTransfer?'toggle-card--active':''}`} onClick={()=>setAirportTransfer((v)=>!v)}><div><p className="font-medium">Airport transfer</p><p className="text-xs text-lv-mist">Terminal-aware handoff and buffer timing prep.</p></div><span>{airportTransfer?'On':'Off'}</span></button><button className={`toggle-card ${businessVip?'toggle-card--active':''}`} onClick={()=>setBusinessVip((v)=>!v)}><div><p className="font-medium">Business / VIP</p><p className="text-xs text-lv-mist">Priority allocation, premium chauffeur protocol.</p></div><span>{businessVip?'On':'Off'}</span></button></>}</div>{error && <p className="mt-4 text-sm text-rose-300">{error}</p>}<div className="mt-6 flex gap-3"><Button variant="secondary" className="flex-1" onClick={prevStep}>Back</Button>{step < 3 ? <Button className="flex-1" onClick={nextStep}>Continue</Button> : <Button className="flex-1 shadow-gold-md" onClick={submitBooking} disabled={loading}>{loading ? 'Submitting...' : 'Confirm booking'}</Button>}</div></>)}</div><aside className="space-y-6"><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Price estimate</p><p className="mt-3 text-4xl font-semibold">${baseFare}</p><p className="mt-1 text-sm text-lv-mist">Estimated fare • final pricing from future API integrations.</p><div className="mt-4 rounded-2xl border border-lv-gold/20 bg-black/30 p-4 text-sm text-lv-mist">Includes base transfer, selected vehicle class, and service options.</div></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Booking summary</p><ul className="mt-4 space-y-3 text-sm"><li><span className="text-lv-mist">Pickup:</span> {pickup || 'Not set'}</li><li><span className="text-lv-mist">Destination:</span> {destination || 'Not set'}</li><li><span className="text-lv-mist">Schedule:</span> {formatDateTime(dateTime)}</li><li><span className="text-lv-mist">Passengers:</span> {passengers}</li><li><span className="text-lv-mist">Vehicle:</span> {vehicle.name}</li><li><span className="text-lv-mist">Options:</span> {airportTransfer ? 'Airport' : 'Standard'} • {businessVip ? 'VIP' : 'Classic'}</li></ul></article></aside></section></div></div>);
}
