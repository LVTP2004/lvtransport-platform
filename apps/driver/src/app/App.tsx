import { useEffect, useState } from 'react';
import { AccountStatus, type AuthState, UserRole } from '@lvtransport/auth';
import { driverAuthProvider, driverAuthService } from '../modules/auth/services/auth-client.service';

export function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true });
  const [email, setEmail] = useState('driver@lvtransport.dev');
  const [password, setPassword] = useState('password123');
  const [allowed, setAllowed] = useState(false);
  useEffect(() => { driverAuthService.getInitialState().then(setAuthState); }, []);
  const login = async () => { const t = await driverAuthService.signIn({ email, password }); const u = await driverAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.DRIVER) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
  const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
  if (!authState.isAuthenticated) return <main className='min-h-screen bg-zinc-950 p-8 text-white'><h1 className='text-3xl mb-4'>Driver Login</h1><input className='text-black p-2 mr-2' value={email} onChange={(e)=>setEmail(e.target.value)} /><input className='text-black p-2 mr-2' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} /><button className='bg-amber-400 text-black px-3 py-2 rounded' onClick={login}>Sign in</button></main>;
  if (!allowed) return <main className='min-h-screen bg-zinc-950 p-8 text-white'>Access denied<button onClick={logout}>Logout</button></main>;
  return <main className='min-h-screen bg-zinc-950 text-white p-8'><h1 className='text-3xl text-amber-300'>Driver Console</h1><p>Authenticated driver session ready for trip state modules.</p><button onClick={logout}>Logout</button></main>;
}
