import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { signJwt } from '@lvtransport/auth';
import { authenticate } from './authenticate.js';

const secret = 'unit-test-secret-material-that-is-at-least-thirty-two-bytes';
const previousSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = secret;

after(() => {
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

const claims = {
  sub: 'user-123',
  email: 'operator@example.test',
  roles: ['admin'],
  permissions: ['admin:read', 'admin:write'],
  sessionId: 'session-123',
  status: 'active'
} as Parameters<typeof signJwt>[0];

function authenticateToken(token: string) {
  const request = { headers: { authorization: 'Bearer ' + token } };
  authenticate(request);
  return request.auth;
}

test('rejects unsigned base64 JSON tokens', () => {
  const forged = Buffer.from(
    JSON.stringify({ sub: 'attacker', role: 'super_admin', status: 'active' }),
    'utf8'
  ).toString('base64');

  assert.equal(authenticateToken(forged), undefined);
});

test('accepts an active token with a valid HMAC and derives permissions from the role', () => {
  const auth = authenticateToken(signJwt(claims, secret, 60));

  assert.equal(auth?.userId, 'user-123');
  assert.equal(auth?.role, 'admin');
  assert.equal(auth?.status, 'active');
  assert.deepEqual(auth?.permissions, ['admin:read', 'admin:write']);
});

test('rejects a token when its signed claims are modified', () => {
  const parts = signJwt(claims, secret, 60).split('.');
  const modifiedPayload = Buffer.from(
    JSON.stringify({ ...claims, roles: ['super_admin'] }),
    'utf8'
  ).toString('base64url');

  assert.equal(authenticateToken([parts[0], modifiedPayload, parts[2]].join('.')), undefined);
});

test('rejects inactive accounts and weak signing secrets', () => {
  const inactive = { ...claims, status: 'suspended' } as Parameters<typeof signJwt>[0];
  assert.equal(authenticateToken(signJwt(inactive, secret, 60)), undefined);
  assert.throws(() => signJwt(claims, 'too-short', 60), /at least 32 bytes/);
});
