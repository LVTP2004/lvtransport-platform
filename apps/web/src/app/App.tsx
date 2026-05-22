import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { ProtectedRoute } from '../modules/auth/route-guards/protected-route';
import { webAuthProvider, webAuthService } from '../modules/auth/services/auth-client.service';
import { AccountStatus, type AuthState, type UserAccount, UserRole } from '@lvtransport/auth';

type Step = 1 | 2 | 3;
type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number };
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3 },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6 },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10 }
];

const formatDateTime = (value: string) => (!value ? 'Select schedule' : new Date(value).toLocaleString('en-US'));

export function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true });
  const [user, setUser] = useState<UserAccount | undefined>();
  const [email, setEmail] = useState('customer@lvtransport.dev');
  const [password, setPassword] = useState('password123');
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [businessVip, setBusinessVip] = useState(true);

  useEffect(() => { webAuthService.getInitialState().then(setAuthState); }, []);

  const baseFare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup.length, destination.length, passengers, airportTransfer, businessVip, vehicle.priceMultiplier]);

  const login = async () => {
    const tokens = await webAuthService.signIn({ email, password });
    const session = await webAuthProvider.getSession(tokens.accessToken);
    const profile = await webAuthProvider.getUserProfile(tokens.accessToken);
    setAuthState({ isAuthenticated: true, isLoading: false, tokens, session });
    setUser(profile);
  };
  const logout = async () => { if (authState.session) await webAuthService.signOut(authState.session.sessionId); setAuthState({ isAuthenticated: false, isLoading: false }); setUser(undefined); };

  const canAccess = authState.isAuthenticated && user?.status === AccountStatus.ACTIVE && user.roles.includes(UserRole.CUSTOMER);

  if (!authState.isAuthenticated) return <div className="min-h-screen bg-lv-black text-white p-8"><h1 className="text-2xl mb-4">Customer Login</h1><input className="text-black p-2 mr-2" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="text-black p-2 mr-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /><Button onClick={login}>Sign in</Button></div>;

  return <ProtectedRoute allowed={canAccess} fallback={<div className="min-h-screen bg-lv-black text-white p-8">Account not active for customer booking.<Button onClick={logout}>Logout</Button></div>}><div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><Button variant="secondary" onClick={logout}>Logout</Button><p className='mt-2 text-sm'>Onboarding: {user?.onboardingStep}</p><p>{user?.profile.firstName} {user?.profile.lastName}</p><div className="mx-auto w-full max-w-6xl"><header className="glass-panel mb-6 rounded-3xl p-5 sm:p-7"><p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Booking</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Premium ride booking, built for enterprise pace.</h1></header><section><label><input value={pickup} onChange={(e)=>setPickup(e.target.value)} /></label><label><input value={destination} onChange={(e)=>setDestination(e.target.value)} /></label><label><input type='datetime-local' value={dateTime} onChange={(e)=>setDateTime(e.target.value)} /></label><p>${baseFare} {formatDateTime(dateTime)}</p></section></div></div></ProtectedRoute>;
}
