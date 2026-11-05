import { createHmac, timingSafeEqual } from 'node:crypto';
import { AccountStatus, Permission, UserRole } from '../enums/auth.enums.js';

export interface JwtClaims {
  sub: string;
  email: string;
  roles: UserRole[];
  permissions: Permission[];
  sessionId: string;
  status: AccountStatus;
  iat: number;
  exp: number;
}

const base64UrlEncode = (value: string | Buffer) => Buffer.from(value).toString('base64url');

const decodeSegment = (value: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid token encoding');
  return Buffer.from(value, 'base64url').toString('utf8');
};

const requireSecret = (secret: string) => {
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT secret must be at least 32 bytes');
  }
};

const sign = (data: string, secret: string) =>
  createHmac('sha256', secret).update(data).digest('base64url');

export function signJwt(
  claims: Omit<JwtClaims, 'iat' | 'exp'>,
  secret: string,
  ttlSeconds: number
): string {
  requireSecret(secret);
  if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('JWT time-to-live must be a positive integer');
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({ ...claims, iat, exp } satisfies JwtClaims));
  const data = header + '.' + payload;
  return data + '.' + sign(data, secret);
}

export function verifyJwt(token: string, secret: string): JwtClaims {
  requireSecret(secret);
  if (typeof token !== 'string') throw new Error('Invalid token format');

  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error('Invalid token format');
  }

  const [headerSegment, payloadSegment, signatureSegment] = parts;
  const header = JSON.parse(decodeSegment(headerSegment)) as { alg?: unknown; typ?: unknown } | null;
  if (!header || header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Unsupported token algorithm');
  }

  const data = headerSegment + '.' + payloadSegment;
  const expectedSignature = createHmac('sha256', secret).update(data).digest();
  if (!/^[A-Za-z0-9_-]+$/.test(signatureSegment)) throw new Error('Invalid token signature');
  const suppliedSignature = Buffer.from(signatureSegment, 'base64url');
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    throw new Error('Invalid token signature');
  }

  const claims = JSON.parse(decodeSegment(payloadSegment)) as Partial<JwtClaims> | null;
  if (!claims || typeof claims !== 'object') throw new Error('Invalid token claims');

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof claims.iat !== 'number' ||
    !Number.isSafeInteger(claims.iat) ||
    claims.iat > now + 60 ||
    typeof claims.exp !== 'number' ||
    !Number.isSafeInteger(claims.exp) ||
    claims.exp <= now ||
    claims.exp <= claims.iat
  ) {
    throw new Error('Invalid or expired token lifetime');
  }

  if (
    typeof claims.sub !== 'string' ||
    !claims.sub.trim() ||
    typeof claims.email !== 'string' ||
    !claims.email.trim() ||
    typeof claims.sessionId !== 'string' ||
    !claims.sessionId.trim() ||
    !Object.values(AccountStatus).includes(claims.status as AccountStatus) ||
    !Array.isArray(claims.roles) ||
    claims.roles.length === 0 ||
    !claims.roles.every((role) => Object.values(UserRole).includes(role as UserRole)) ||
    !Array.isArray(claims.permissions) ||
    !claims.permissions.every((permission) =>
      Object.values(Permission).includes(permission as Permission)
    )
  ) {
    throw new Error('Invalid token claims');
  }

  return claims as JwtClaims;
}
