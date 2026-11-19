import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(path.join(process.cwd(), 'apps/admin/package.json'));
const { build } = createRequire(require.resolve('vite'))('esbuild');
const result = await build({ entryPoints: ['apps/api/src/modules/bookings/validation.ts'],
  bundle: true, write: false, platform: 'node', format: 'cjs' });
const module = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
const { validateCreateBookingPayload: validate } = module.exports;
const valid = { pickup: ' Synthetic pickup ', destination: ' Synthetic destination ',
  scheduleAt: '2030-01-01T12:00:00Z', serviceType: 'standard' };

test('booking rejects non-string locations with intentional validation errors', () => {
  for (const field of ['pickup', 'destination']) {
    for (const value of [1, true, [], {}, ['Synthetic location']]) {
      assert.throws(() => validate({ ...valid, [field]: value }),
        error => !(error instanceof TypeError) && error.message === `${field} must be a string`);
    }
  }
});

test('booking rejects coercible non-string dates instead of silently accepting them', () => {
  for (const value of [1, true, [], {}, ['2030-01-01T12:00:00Z']]) {
    assert.throws(() => validate({ ...valid, scheduleAt: value }), /scheduledAt must be a string/);
    const { scheduleAt, ...legacy } = valid;
    assert.throws(() => validate({ ...legacy, scheduledAt: value }), /scheduledAt must be a string/);
  }
});

test('booking requires an object payload and preserves required-field errors', () => {
  assert.throws(() => validate([]), /Payload must be an object/);
  for (const value of [null, undefined, false, 42, 'Synthetic']) assert.throws(() => validate(value));
  for (const field of ['pickup', 'destination', 'scheduleAt']) {
    for (const value of [null, undefined, '', '   ']) {
      assert.throws(() => validate({ ...valid, [field]: value }));
    }
  }
});

test('booking keeps normalization, legacy schedule alias and canonical precedence', () => {
  const normalized = validate(valid);
  assert.equal(normalized.pickup, 'Synthetic pickup');
  assert.equal(normalized.destination, 'Synthetic destination');
  assert.equal(normalized.scheduleAt, valid.scheduleAt);
  const { scheduleAt, ...legacy } = valid;
  assert.deepEqual(validate({ ...legacy, scheduledAt: scheduleAt }), normalized);
  assert.equal(validate({ ...valid, scheduledAt: '2031-01-01T12:00:00Z' }).scheduleAt, scheduleAt);
  assert.throws(() => validate({ ...valid, scheduleAt: 'invalid-date' }), /valid datetime/);
  assert.throws(() => validate({ ...valid, serviceType: 'unknown' }), /serviceType/);
});
