import { useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';

type Step = 1 | 2 | 3;
type Provider = 'stripe' | 'payconiq';

type Vehicle = {
  name: string;
  eta: string;
  priceMultiplier: number;
  seats: number;
};

const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3 },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6 },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10 }
];

export function App() {
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [provider, setProvider] = useState<Provider>('stripe');
  const [paymentState, setPaymentState] = useState<'idle' | 'checkout_prepared' | 'session_created' | 'confirmed'>('idle');

  const baseFare = useMemo(() => Math.round(Math.max(14, (pickup.length + destination.length) * 0.8) * vehicle.priceMultiplier + (passengers > 3 ? (passengers - 3) * 6 : 0)), [destination.length, passengers, pickup.length, vehicle.priceMultiplier]);

  const confirmFlow = () => {
    setPaymentState('checkout_prepared');
    setTimeout(() => setPaymentState('session_created'), 200);
    setTimeout(() => setPaymentState('confirmed'), 450);
  };

  return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl"><header className="glass-panel mb-6 rounded-3xl p-5 sm:p-7"><p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Booking</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Premium ride booking, built for enterprise pace.</h1></header><section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="glass-panel rounded-3xl p-4 sm:p-6"><div className="mb-6 flex items-center justify-between"><p className="text-sm text-lv-mist">Step {step} of 3</p></div>{step===1&&<div className="space-y-4"><label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e)=>setPickup(e.target.value)} /></label><label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e)=>setDestination(e.target.value)} /></label></div>}{step===2&&<div className="space-y-4"><div className="field-wrap"><span>Passengers</span><div className="mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3"><button className="control-btn" onClick={()=>setPassengers((v)=>Math.max(1,v-1))}>−</button><strong className="text-lg">{passengers}</strong><button className="control-btn" onClick={()=>setPassengers((v)=>Math.min(12,v+1))}>+</button></div></div>{vehicles.map((item)=><button key={item.name} onClick={()=>setVehicle(item)} className={`vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`}>{item.name}</button>)}</div>}{step===3&&<div className="space-y-4"><p className="text-sm text-lv-mist">Payment provider (test mode)</p><div className="grid grid-cols-2 gap-3"><button onClick={()=>setProvider('stripe')} className={`vehicle-card ${provider==='stripe' ? 'vehicle-card--active' : ''}`}>Stripe Test</button><button onClick={()=>setProvider('payconiq')} className={`vehicle-card ${provider==='payconiq' ? 'vehicle-card--active' : ''}`}>Payconiq Placeholder</button></div><div className="rounded-2xl border border-lv-gold/20 bg-black/30 p-4 text-sm text-lv-mist">No real card charge. No card data stored. Session IDs are test placeholders only.</div></div>}<div className="mt-6 flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setStep((v) => (v > 1 ? ((v - 1) as Step) : v))}>Back</Button>{step<3?<Button className="flex-1" onClick={() => setStep((v) => (v < 3 ? ((v + 1) as Step) : v))}>Continue</Button>:<Button className="flex-1 shadow-gold-md" onClick={confirmFlow}>Confirm booking + test pay</Button>}</div></div><aside className="space-y-6"><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Price estimate</p><p className="mt-3 text-4xl font-semibold">${baseFare}</p><p className="mt-1 text-sm text-lv-mist">Provider: {provider}</p></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Payment confirmation</p><p className="mt-3 text-sm text-lv-mist">State: {paymentState}</p>{paymentState==='confirmed'&&<div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm">Payment captured in test mode. Booking lifecycle remains compatible.</div>}</article></aside></section></div></div>;
}
