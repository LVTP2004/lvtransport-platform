import { useEffect, useState } from 'react';
import { AccountStatus, type AuthState, UserRole } from '@lvtransport/auth';
import { adminAuthProvider, adminAuthService } from '../modules/auth/services/auth-client.service';

export function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true });
  const [email, setEmail] = useState('admin@lvtransport.dev');
  const [password, setPassword] = useState('password123');
  const [allowed, setAllowed] = useState(false);
  useEffect(() => { adminAuthService.getInitialState().then(setAuthState); }, []);
  const login = async () => { const t = await adminAuthService.signIn({ email, password }); const u = await adminAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.ADMIN) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
  const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
  if (!authState.isAuthenticated) return <main className='min-h-screen bg-zinc-900 p-8 text-white'><h1 className='text-3xl mb-4'>Admin Login</h1><input className='text-black p-2 mr-2' value={email} onChange={(e)=>setEmail(e.target.value)} /><input className='text-black p-2 mr-2' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} /><button className='bg-amber-400 text-black px-3 py-2 rounded' onClick={login}>Sign in</button></main>;
  if (!allowed) return <main className='min-h-screen bg-zinc-900 p-8 text-white'>Access denied<button onClick={logout}>Logout</button></main>;
  return <main className='min-h-screen bg-zinc-900 text-white p-8'><h1 className='text-3xl text-amber-300'>Control Tower</h1><p>Authenticated admin session persisted with Firebase placeholder config.</p><button onClick={logout}>Logout</button></main>;
}
