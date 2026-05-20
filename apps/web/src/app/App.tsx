import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { mapsClient } from '../modules/maps/services/maps-client.service';
import type { PlaceDetails, PlacePrediction, RouteSummary } from '../modules/maps/types/route-estimate.types';

type Step = 1 | 2 | 3;
type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number };
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3 },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6 },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10 }
];

const formatDateTime = (value: string) => (!value ? 'Select schedule' : new Date(value).toLocaleString('en-US'));

export function App() {
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupPredictions, setPickupPredictions] = useState<PlacePrediction[]>([]);
  const [destinationPredictions, setDestinationPredictions] = useState<PlacePrediction[]>([]);
  const [pickupDetails, setPickupDetails] = useState<PlaceDetails | null>(null);
  const [destinationDetails, setDestinationDetails] = useState<PlaceDetails | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [error, setError] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [businessVip, setBusinessVip] = useState(true);

  useEffect(() => { const t = setTimeout(async () => setPickupPredictions(await mapsClient.autocomplete(pickup)), 250); return () => clearTimeout(t); }, [pickup]);
  useEffect(() => { const t = setTimeout(async () => setDestinationPredictions(await mapsClient.autocomplete(destination)), 250); return () => clearTimeout(t); }, [destination]);
  useEffect(() => { (async () => { if (pickupDetails && destinationDetails) setRouteSummary(await mapsClient.routeEstimate(pickupDetails, destinationDetails)); })(); }, [pickupDetails, destinationDetails]);

  const baseFare = useMemo(() => {
    const distance = routeSummary?.distanceKm ?? Math.max(14, (pickup.length + destination.length) * 0.8);
    const duration = routeSummary?.durationMin ?? 18;
    return Math.round((distance * 1.8 + duration * 0.7 + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier);
  }, [airportTransfer, businessVip, destination.length, passengers, pickup.length, routeSummary, vehicle.priceMultiplier]);

  const nextStep = () => {
    if (step === 1 && !(manualEntry || (pickupDetails && destinationDetails))) { setError('Select both autocomplete places or enable manual entry fallback.'); return; }
    setError(''); setStep((s) => (s < 3 ? (s + 1) as Step : s));
  };

  const selectPickup = async (p: PlacePrediction) => { setPickup(p.description); setPickupPredictions([]); setPickupDetails(await mapsClient.placeDetails(p.placeId, p.description)); };
  const selectDestination = async (p: PlacePrediction) => { setDestination(p.description); setDestinationPredictions([]); setDestinationDetails(await mapsClient.placeDetails(p.placeId, p.description)); };

  return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl"><section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="glass-panel rounded-3xl p-4 sm:p-6"><div className="booking-step-fade space-y-4">{step===1 && <><label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e)=>{setPickup(e.target.value);setPickupDetails(null);}} placeholder="Hotel, office, terminal..."/>{pickupPredictions.map((p)=><button key={p.placeId} className="text-left text-xs" onClick={()=>void selectPickup(p)}>{p.description}</button>)}</label><label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e)=>{setDestination(e.target.value);setDestinationDetails(null);}} placeholder="Airport, venue, client site..."/>{destinationPredictions.map((p)=><button key={p.placeId} className="text-left text-xs" onClick={()=>void selectDestination(p)}>{p.description}</button>)}</label><label className="field-wrap"><span>Date & time</span><input type="datetime-local" value={dateTime} onChange={(e)=>setDateTime(e.target.value)}/></label><label className="field-wrap"><span>Fallback</span><button className="toggle-card" onClick={()=>setManualEntry((v)=>!v)}>{manualEntry ? 'Manual entry enabled' : 'Enable manual entry'}</button></label>{error && <p className="text-xs text-red-300">{error}</p>}</>}{step===2 && <p>Passengers: {passengers}</p>}{step===3 && <p>Options ready</p>}</div><div className="mt-6 flex gap-3"><Button variant="secondary" className="flex-1" onClick={()=>setStep((s)=>s>1?(s-1) as Step:s)}>Back</Button><Button className="flex-1" onClick={nextStep}>{step < 3 ? 'Continue' : 'Confirm booking UI'}</Button></div></div><aside className="space-y-6"><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Price estimate</p><p className="mt-3 text-4xl font-semibold">${baseFare}</p><p className="mt-1 text-sm text-lv-mist">Route distance/time prepared for pricing engine input.</p></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><ul className="mt-4 space-y-3 text-sm"><li><span className="text-lv-mist">Pickup:</span> {pickup || 'Not set'}</li><li><span className="text-lv-mist">Destination:</span> {destination || 'Not set'}</li><li><span className="text-lv-mist">Schedule:</span> {formatDateTime(dateTime)}</li><li><span className="text-lv-mist">Route:</span> {routeSummary ? `${routeSummary.distanceKm} km • ${routeSummary.durationMin} min • ETA ${routeSummary.etaMinutes}m` : 'Pending'}</li></ul></article></aside></section></div></div>;
}
