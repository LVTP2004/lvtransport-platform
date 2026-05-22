import type { Permission, UserRole } from '../enums/auth.enums';

export interface JwtClaims {
  sub: string;
  email: string;
  roles: UserRole[];
  permissions: Permission[];
  sessionId: string;
  iat: number;
  exp: number;
}

const base64UrlEncode = (value: string) => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const base64UrlDecode = (value: string) => atob(value.replace(/-/g, '+').replace(/_/g, '/'));

const sign = (headerPayload: string, secret: string) =>
  base64UrlEncode(`${secret}:${headerPayload}`);

export function signJwt(claims: Omit<JwtClaims, 'iat' | 'exp'>, secret: string, ttlSeconds: number): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({ ...claims, iat, exp } satisfies JwtClaims));
  const data = `${header}.${payload}`;
  return `${data}.${sign(data, secret)}`;
}

export function verifyJwt(token: string, secret: string): JwtClaims {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) throw new Error('Invalid token format');
  const data = `${header}.${payload}`;
  const expected = sign(data, secret);
  if (signature !== expected) throw new Error('Invalid token signature');

  const decoded = JSON.parse(base64UrlDecode(payload)) as JwtClaims;
  if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return decoded;
}
