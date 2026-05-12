// @ts-ignore - node built-in is resolved in runtime node environments
import { createHmac, timingSafeEqual } from 'node:crypto';
declare const Buffer: any;

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

const BufferCompat = Buffer as any;
const base64UrlEncode = (value: string) => BufferCompat.from(value).toString('base64url');
const base64UrlDecode = (value: string) => BufferCompat.from(value, 'base64url').toString('utf8');

const sign = (headerPayload: string, secret: string) =>
  createHmac('sha256', secret).update(headerPayload).digest('base64url');

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
  const actualBuffer = BufferCompat.from(signature);
  const expectedBuffer = BufferCompat.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error('Invalid token signature');
  }

  const decoded = JSON.parse(base64UrlDecode(payload)) as JwtClaims;
  if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return decoded;
}
