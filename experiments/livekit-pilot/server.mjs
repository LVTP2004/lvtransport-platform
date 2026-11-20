#!/usr/bin/env node
// Local-only LiveKit pilot; not a booking service or production token endpoint.
import { createServer } from 'node:http';
import { createHmac, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const PORT = 8799;
export const HOST = '127.0.0.1';
export const ORIGIN = `http://${HOST}:${PORT}`;
export const ROOM = 'lvtp-video-lab';
const directory = dirname(fileURLToPath(import.meta.url));
const allowed = new Map([
  ['/', ['index.html','text/html; charset=utf-8']],
  ['/index.html', ['index.html','text/html; charset=utf-8']],
  ['/client.js', ['client.js','text/javascript; charset=utf-8']],
]);

export function makeToken({ role, key, secret, now = Math.floor(Date.now()/1000), nonce = randomBytes(8).toString('hex') }) {
  if (!['passenger','driver'].includes(role)) throw Error('invalid pilot role');
  if (typeof key !== 'string' || !key || typeof secret !== 'string' || !secret) throw Error('missing key');
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = b64({ alg: 'HS256', typ: 'JWT' });
  const payload = b64({
    iss: key, sub: `pilot-${role}-${nonce}`, name: role === 'passenger' ? 'Pasajero (prueba)' : 'Conductor (prueba)',
    iat: now, nbf: now - 2, exp: now + 600, jti: nonce,
    video: { room: ROOM, roomJoin: true, canPublish: true, canSubscribe: true,
      canPublishData: false, roomCreate: false, roomAdmin: false, roomList: false,
      roomRecord: false, ingressAdmin: false }
  });
  const signing = `${header}.${payload}`;
  const signature = createHmac('sha256', secret).update(signing).digest('base64url');
  return `${signing}.${signature}`;
}

export function configuration(env = process.env) {
  // No live credentials, no public listeners, no arbitrary endpoints.
  if (env.LIVEKIT_PILOT_DEV !== '1') throw Error('Set LIVEKIT_PILOT_DEV=1 explicitly');
  if (env.LIVEKIT_URL !== 'ws://127.0.0.1:7880') throw Error('This pilot allows only local LiveKit on port 7880');
  if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) throw Error('LiveKit development credentials are required');
  return { key: env.LIVEKIT_API_KEY, secret: env.LIVEKIT_API_SECRET, url: env.LIVEKIT_URL };
}

function headers(res, type='application/json; charset=utf-8') {
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',
    "default-src 'none'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self'; connect-src 'self' ws://127.0.0.1:7880; img-src 'self' data:; media-src 'self' blob:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
}
function send(res, status, object) {
  headers(res); res.statusCode = status; res.end(JSON.stringify(object));
}
export function createPilotServer(config) {
  return createServer(async (req, res) => {
    if (req.headers.host !== `${HOST}:${PORT}`) return send(res,403,{error:'forbidden'});
    if (req.url === '/token') {
      if (req.method !== 'POST' || req.headers.origin !== ORIGIN ||
          req.headers['content-type']?.split(';')[0] !== 'application/json') return send(res,403,{error:'forbidden'});
      let size=0, chunks=[];
      try {
        for await (const part of req) {
          size += part.length;
          if (size > 256) return send(res,413,{error:'too_large'});
          chunks.push(part);
        }
        const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || Object.keys(body).length!==1 || !['passenger','driver'].includes(body.role))
          return send(res,400,{error:'invalid_role'});
        return send(res,200,{serverUrl:config.url,token:makeToken({role:body.role,key:config.key,secret:config.secret})});
      } catch { return send(res,400,{error:'invalid_json'}); }
    }
    if (req.method!=='GET' || !allowed.has(req.url)) return send(res,404,{error:'not_found'});
    try {
      const [filename,type] = allowed.get(req.url);
      headers(res,type);
      res.statusCode=200;
      res.end(await readFile(join(directory,filename)));
    } catch { send(res,500,{error:'asset_unavailable'}); }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const config=configuration();
    createPilotServer(config).listen(PORT,HOST,()=>{
      console.log(`LVTP LiveKit pilot: ${ORIGIN} (local development only)`);
    });
  } catch(e) {
    console.error('Pilot configuration error:',e.message);
    process.exitCode=1;
  }
}
