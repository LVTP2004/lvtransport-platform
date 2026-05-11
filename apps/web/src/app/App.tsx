import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';

type Step = 1 | 2 | 3;

type Vehicle = {
  name: string;
  eta: string;
  priceMultiplier: number;
  seats: number;
};

type PlaceSuggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type PlaceDetails = {
  placeId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

type RouteEstimate = {
  distanceMeters: number;
  durationSeconds: number;
  etaIso: string;
  summary: { distanceKm: number; durationMin: number; human: string };
};

const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3 },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6 },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10 }
];

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export function App() {
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupManual, setPickupManual] = useState(false);
  const [destinationManual, setDestinationManual] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [pickupDetails, setPickupDetails] = useState<PlaceDetails | null>(null);
  const [destinationDetails, setDestinationDetails] = useState<PlaceDetails | null>(null);
  const [route, setRoute] = useState<RouteEstimate | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [businessVip, setBusinessVip] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (pickup.length < 3 || pickupManual) return setPickupSuggestions([]);
      const res = await fetch(`${apiBase}/maps/places/autocomplete?input=${encodeURIComponent(pickup)}`);
      const data = await res.json() as { suggestions: PlaceSuggestion[] };
      setPickupSuggestions(data.suggestions ?? []);
    };
    void load();
  }, [pickup, pickupManual]);

  useEffect(() => {
    const load = async () => {
      if (destination.length < 3 || destinationManual) return setDestinationSuggestions([]);
      const res = await fetch(`${apiBase}/maps/places/autocomplete?input=${encodeURIComponent(destination)}`);
      const data = await res.json() as { suggestions: PlaceSuggestion[] };
      setDestinationSuggestions(data.suggestions ?? []);
    };
    void load();
  }, [destination, destinationManual]);

  useEffect(() => {
    const loadRoute = async () => {
      if (!pickupDetails || !destinationDetails) return setRoute(null);
      const res = await fetch(`${apiBase}/maps/route-estimate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup: pickupDetails, destination: destinationDetails })
      });
      const data = await res.json() as { route: RouteEstimate };
      setRoute(data.route);
    };
    void loadRoute();
  }, [pickupDetails, destinationDetails]);

  const baseFare = useMemo(() => {
    const distanceFactor = Math.max(14, (route?.summary.distanceKm ?? 8) * 3.1);
    const durationFactor = (route?.summary.durationMin ?? 15) * 0.7;
    const passengerFactor = passengers > 3 ? (passengers - 3) * 6 : 0;
    const airportFee = airportTransfer ? 18 : 0;
    const vipFee = businessVip ? 24 : 0;
    return Math.round((distanceFactor + durationFactor + passengerFactor + airportFee + vipFee) * vehicle.priceMultiplier);
  }, [airportTransfer, businessVip, passengers, route, vehicle.priceMultiplier]);

  const placeSelect = async (placeId: string, type: 'pickup' | 'destination') => {
    const res = await fetch(`${apiBase}/maps/places/${placeId}`);
    const data = await res.json() as { place: PlaceDetails };
    if (!data.place) return;
    if (type === 'pickup') {
      setPickup(data.place.formattedAddress);
      setPickupDetails(data.place);
      setPickupSuggestions([]);
    } else {
      setDestination(data.place.formattedAddress);
      setDestinationDetails(data.place);
      setDestinationSuggestions([]);
    }
  };

  return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8">{/* UI unchanged mostly */}
    <div className="mx-auto w-full max-w-6xl"><section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="glass-panel rounded-3xl p-4 sm:p-6">
      {step === 1 && <>
        <label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e) => { setPickup(e.target.value); setPickupDetails(null); }} placeholder="Hotel, office, terminal..." />
          {pickupSuggestions.length > 0 && <div className="mt-2 rounded-xl border border-white/10 bg-black/70 p-2">{pickupSuggestions.map((s) => <button type="button" key={s.placeId} className="block w-full text-left text-sm p-2 hover:bg-white/10 rounded" onClick={() => void placeSelect(s.placeId, 'pickup')}>{s.mainText} <span className="text-lv-mist">{s.secondaryText}</span></button>)}</div>}
          <button type="button" className="mt-2 text-xs text-lv-champagne" onClick={() => setPickupManual((v) => !v)}>{pickupManual ? 'Use autocomplete' : 'Enter manually'}</button>
        </label>
        <label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e) => { setDestination(e.target.value); setDestinationDetails(null); }} placeholder="Airport, venue, client site..." />
          {destinationSuggestions.length > 0 && <div className="mt-2 rounded-xl border border-white/10 bg-black/70 p-2">{destinationSuggestions.map((s) => <button type="button" key={s.placeId} className="block w-full text-left text-sm p-2 hover:bg-white/10 rounded" onClick={() => void placeSelect(s.placeId, 'destination')}>{s.mainText} <span className="text-lv-mist">{s.secondaryText}</span></button>)}</div>}
          <button type="button" className="mt-2 text-xs text-lv-champagne" onClick={() => setDestinationManual((v) => !v)}>{destinationManual ? 'Use autocomplete' : 'Enter manually'}</button>
        </label>
      </>}
    </div><aside className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Route summary</p>
      <p className="mt-2 text-sm text-lv-mist">{route?.summary.human ?? 'Select both places to estimate route'}</p>
      <p className="mt-2 text-sm text-lv-mist">ETA prep: {route ? new Date(route.etaIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Pending'}</p>
      <p className="mt-4 text-4xl font-semibold">${baseFare}</p>
      <Button className="mt-4" disabled={(!pickupManual && !pickupDetails) || (!destinationManual && !destinationDetails)}>Confirm booking UI</Button>
    </aside></section></div></div>;
}
