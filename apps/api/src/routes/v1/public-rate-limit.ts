import type { RequestHandler } from 'express';

/** Process-local, fixed-window budget. Express decides which proxies, if any, are trusted. */
export function publicRateLimit(perClient: number, total: number, now = Date.now): RequestHandler {
  const windowMs = 60_000;
  let windowEnd = 0;
  let used = 0;
  const clients = new Map<string, number>();

  return (req, res, next) => {
    const time = now();
    if (time >= windowEnd) {
      windowEnd = time + windowMs;
      used = 0;
      clients.clear();
    }
    const client = req.ip || req.socket.remoteAddress || 'unknown';
    const clientUsed = clients.get(client) ?? 0;
    if (used >= total || clientUsed >= perClient) {
      res.set({
        'Cache-Control': 'no-store',
        'Retry-After': String(Math.max(1, Math.ceil((windowEnd - time) / 1000))),
      }).status(429).json({ success: false, message: 'Te veel verzoeken. Probeer later opnieuw.' });
      return;
    }
    // Only admitted requests allocate a client bucket, so total bounds map size.
    used++;
    clients.set(client, clientUsed + 1);
    next();
  };
}
