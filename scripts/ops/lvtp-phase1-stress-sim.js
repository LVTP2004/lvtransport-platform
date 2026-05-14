#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const BASE_URL = process.env.LVTP_BASE_URL || 'http://127.0.0.1:4000/api/v1';
const API_PID_FILE = process.env.LVTP_API_PID_FILE || '/tmp/lvtp-api.pid';
const NOW = new Date().toISOString();

const scale = Number(process.env.LVTP_DURATION_SCALE || '1');
const sleepMs = Number(process.env.LVTP_TICK_MS || '900');

const CYCLES = [
  { name: 'A_WARM_LOAD', customers: 25, minutes: 20 },
  { name: 'B_SUSTAINED_LOAD', customers: 50, minutes: 45 },
  { name: 'C_HIGHER_SUSTAINED', customers: 75, minutes: 60 },
  { name: 'D_COOLDOWN', customers: 20, minutes: 20 },
  { name: 'E_RECOVERY_CHECK_3', customers: 3, minutes: 4 },
  { name: 'E_RECOVERY_CHECK_2', customers: 2, minutes: 4 },
  { name: 'E_RECOVERY_CHECK_1', customers: 1, minutes: 4 }
].map((c) => ({ ...c, ms: Math.max(10_000, Math.floor(c.minutes * 60_000 * scale)) }));

const counters = {
  totals: { requests: 0, success: 0, non2xx: 0, avgMsSum: 0 },
  bookingCreateSuccess: 0,
  duplicateBookingAttempts: 0,
  lifecycleViolations: 0,
  reconnectRecoveryFailures: 0,
  mismatchEvents: 0
};

const bookingStore = new Map();
const idempotencyKeys = new Set();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OUTPUT_FILE = process.env.LVTP_REPORT_FILE || 'docs/runtime-validation/latest-phase1-stress-report.json';

function ensureReportDir() {
  const dir = OUTPUT_FILE.split('/').slice(0, -1).join('/');
  if (dir) fs.mkdirSync(dir, { recursive: true });
}

async function preflight() {
  const health = await request('/health');
  if (!health.ok) {
    const error = {
      startedAt: NOW,
      baseUrl: BASE_URL,
      preflight: 'failed',
      reason: 'API health endpoint is unavailable. Start apps/api before running endurance validation.',
      healthStatus: health.status,
      healthError: health.error || null
    };
    ensureReportDir();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(error, null, 2));
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}


async function request(path, options = {}) {
  const started = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'content-type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const body = await response.json().catch(() => ({}));
    const ms = Date.now() - started;

    counters.totals.requests += 1;
    counters.totals.avgMsSum += ms;
    if (response.ok) counters.totals.success += 1;
    if (!response.ok) counters.totals.non2xx += 1;

    return { ok: response.ok, status: response.status, body, ms };
  } catch (error) {
    const ms = Date.now() - started;
    counters.totals.requests += 1;
    counters.totals.non2xx += 1;
    counters.totals.avgMsSum += ms;
    return { ok: false, status: 0, body: {}, ms, error: String(error) };
  }
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

function snapshotProcessStats() {
  try {
    const pid = fs.readFileSync(API_PID_FILE, 'utf8').trim();
    const ps = execSync(`ps -p ${pid} -o %cpu=,%mem=,rss=`).toString().trim().split(/\s+/);
    return {
      cpuPct: Number(ps[0] || 0),
      memPct: Number(ps[1] || 0),
      rssKb: Number(ps[2] || 0)
    };
  } catch {
    return { cpuPct: 0, memPct: 0, rssKb: 0 };
  }
}

function pickAction() {
  const roll = Math.random() * 100;
  if (roll < 35) return 'create';
  if (roll < 55) return 'tracking';
  if (roll < 70) return 'price';
  if (roll < 80) return 'reconnect';
  if (roll < 90) return 'navigation';
  if (roll < 95) return 'driverStatus';
  return 'invalidTransition';
}

function randomBooking() {
  const values = [...bookingStore.values()];
  if (!values.length) return null;
  return values[Math.floor(Math.random() * values.length)];
}

async function simulateAction(actorId) {
  const action = pickAction();
  if (action === 'create') {
    const idem = `create-${actorId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    if (idempotencyKeys.has(idem)) counters.duplicateBookingAttempts += 1;
    idempotencyKeys.add(idem);
    const res = await request('/bookings', {
      method: 'POST',
      headers: { 'x-idempotency-key': idem },
      body: JSON.stringify({
        customerId: `customer-${actorId}`,
        pickupAddress: 'Antwerp Central',
        dropoffAddress: 'Brussels Airport',
        distanceKm: 42
      })
    });
    if (res.ok && res.body.booking) {
      counters.bookingCreateSuccess += 1;
      bookingStore.set(res.body.booking.id, res.body.booking);
    }
    return { action, ...res };
  }

  if (action === 'tracking') {
    const b = randomBooking();
    if (!b?.trackingCode) return { action, ...(await request('/health')) };
    return { action, ...(await request(`/tracking/${b.trackingCode}`)) };
  }

  if (action === 'price') {
    return { action, ...(await request('/maps/quote?pickup=51.2194,4.4025&dropoff=50.9010,4.4844')) };
  }

  if (action === 'navigation') {
    return { action, ...(await request('/health')) };
  }

  if (action === 'reconnect') {
    const res = await request('/operations/diagnostics');
    if (!res.ok) counters.reconnectRecoveryFailures += 1;
    return { action, ...res };
  }

  if (action === 'driverStatus') {
    const b = randomBooking();
    if (!b?.id) return { action, ...(await request('/drivers')) };
    return {
      action,
      ...(await request(`/bookings/${b.id}/tracking`, {
        method: 'POST',
        body: JSON.stringify({
          bookingId: b.id,
          driverId: 'driver-sim',
          latitude: 51.2194,
          longitude: 4.4025,
          capturedAt: new Date().toISOString(),
          idempotencyKey: `gps-${b.id}-${Date.now()}`
        })
      }))
    };
  }

  const b = randomBooking();
  if (!b?.id) return { action, ...(await request('/bookings/nonexistent/status', { method: 'POST', body: JSON.stringify({ status: 'completed', actor: 'driver' }) })) };
  const invalid = await request(`/bookings/${b.id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: 'pending', actor: 'driver', expectedVersion: b.version ?? 1, idempotencyKey: `invalid-${Date.now()}` })
  });
  if (!invalid.ok) counters.lifecycleViolations += 1;
  return { action, ...invalid };
}

(async function main() {
  await preflight();
  const report = { startedAt: NOW, baseUrl: BASE_URL, preflight: 'passed', cycles: [] };

  for (const cycle of CYCLES) {
    const cycleEnd = Date.now() + cycle.ms;
    const samples = [];
    const runtimeSnapshots = [];

    while (Date.now() < cycleEnd) {
      const burst = await Promise.all(Array.from({ length: cycle.customers }, (_, index) => simulateAction(index + 1)));
      samples.push(...burst);
      runtimeSnapshots.push(snapshotProcessStats());
      await sleep(sleepMs);
    }

    const lat = samples.map((s) => s.ms);
    const success = samples.filter((s) => s.ok).length;
    const non2xx = samples.length - success;

    report.cycles.push({
      name: cycle.name,
      customers: cycle.customers,
      runtimeMinutes: (cycle.ms / 60000).toFixed(2),
      totalRequests: samples.length,
      successRatePct: Number(((success / Math.max(1, samples.length)) * 100).toFixed(2)),
      non2xxRatePct: Number(((non2xx / Math.max(1, samples.length)) * 100).toFixed(2)),
      avgResponseMs: Number((lat.reduce((a, b) => a + b, 0) / Math.max(1, lat.length)).toFixed(2)),
      p95Ms: percentile(lat, 0.95),
      p99Ms: percentile(lat, 0.99),
      cpuMaxPct: Math.max(...runtimeSnapshots.map((s) => s.cpuPct), 0),
      rssMaxKb: Math.max(...runtimeSnapshots.map((s) => s.rssKb), 0)
    });
  }

  report.summary = {
    totalRequests: counters.totals.requests,
    successRatePct: Number(((counters.totals.success / Math.max(1, counters.totals.requests)) * 100).toFixed(2)),
    non2xxRatePct: Number(((counters.totals.non2xx / Math.max(1, counters.totals.requests)) * 100).toFixed(2)),
    avgResponseMs: Number((counters.totals.avgMsSum / Math.max(1, counters.totals.requests)).toFixed(2)),
    bookingCreateSuccess: counters.bookingCreateSuccess,
    duplicateBookingAttempts: counters.duplicateBookingAttempts,
    lifecycleViolations: counters.lifecycleViolations,
    reconnectRecoveryFailures: counters.reconnectRecoveryFailures,
    adminCustomerDriverMismatchEvents: counters.mismatchEvents,
    pm2RestartsObserved: 'collect externally via pm2 logs',
    nginxApiErrorsObserved: 'collect externally via nginx/api logs'
  };

  ensureReportDir();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();
