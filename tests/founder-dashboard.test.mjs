import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
const require = createRequire(path.join(process.cwd(), 'apps/web/package.json'));
const { build } = createRequire(require.resolve('vite'))('esbuild');
const result = await build({ entryPoints: [path.join(process.cwd(), 'apps/web/src/pages/FounderDashboard.tsx')], bundle: true, write: false,
  platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'react-dom/*'], loader: { '.css': 'empty' }, define: { 'import.meta.env': '{}' } });
const module = { exports: {} };
new Function('require', 'module', 'exports', 'window', result.outputFiles[0].text)(
  require, module, module.exports, { location: { href: 'https://portal.example.invalid/founder/' } },
);
const { default: Dashboard, completedInPeriod, currentLocations } = module.exports;

test('unauthenticated Founder presentation exposes no operator data or implied governance authority', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const markup = renderToStaticMarkup(React.createElement(Dashboard));
  for (const label of ['Executive Overview', 'Attention Queue', 'MONI CORE ASSISTANT', 'Not connected', 'Financial source not connected']) assert.ok(markup.includes(label), label);
  assert.ok(markup.includes('No approval provider connected. No decisions can be approved from this view.'));
  assert.doesNotMatch(markup, /Leonardo Vannoni|1,248,950|98\.6%|Full Access|Secure · Encrypted · Compliant|\/api\/founder\/assistant/);
  assert.match(markup, /<input[^>]*disabled/);
});

test('ride KPI counts actual completed transitions within the selected period, never scheduled or future completions', () => {
  const now = Date.parse('2026-11-16T12:00:00Z');
  const b = (status, to, occurredAt) => ({ status, transitions: [{ to, occurredAt }] });
  const bookings = [b('completed', 'completed', '2026-11-15T12:00:00Z'), b('pending', 'completed', '2026-11-15T12:00:00Z'),
    b('completed', 'assigned', '2026-11-15T12:00:00Z'), b('completed', 'completed', '2026-10-16T12:00:00Z'),
    b('completed', 'completed', '2026-11-17T12:00:00Z'), b('completed', 'completed', 'invalid')];
  assert.equal(completedInPeriod(bookings, 7, now), 1);
  assert.equal(completedInPeriod(bookings, 90, now), 2);
});

test('location observations disappear when stale, terminal, invalid or future-dated', () => {
  const now = Date.parse('2026-11-16T12:00:00Z');
  const sample = { status: 'in_progress', location: { lat: 51.2, lng: 4.4, capturedAt: '2026-11-16T11:59:30Z' } };
  assert.equal(currentLocations([sample], now).length, 1);
  assert.equal(currentLocations([sample], now + 120000).length, 0);
  for (const status of ['completed', 'failed', 'cancelled']) assert.equal(currentLocations([{ ...sample, status }], now).length, 0);
  assert.equal(currentLocations([{ ...sample, location: { ...sample.location, lat: 95 } }], now).length, 0);
  assert.equal(currentLocations([{ ...sample, location: { ...sample.location, capturedAt: '2026-11-16T12:05:00Z' } }], now).length, 0);
});
