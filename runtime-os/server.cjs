const http = require('http');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');
const { createClient } = require('redis');

const PORT = Number(process.env.RUNTIME_OS_PORT || 3010);
const API = process.env.LVTP_API || 'http://127.0.0.1:3000';
const CHANNELS = [
  'lvtp:runtime:events',
  'lvtp:dispatch:events',
  'lvtp:airport:events',
  'lvtp:driver:events',
  'lvtp:founder:events',
  'lvtp:incident:events',
  'lvtp:replay:events',
  'lvtp:continuity:events'
];

const clients = new Set();

function json(res, code, data) {
  res.writeHead(code, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  res.end(JSON.stringify(data));
}

async function proxyJson(url) {
  const r = await fetch(url);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { ok:false, status:r.status, body:text.slice(0,500) }; }
}

function broadcast(event) {
  const payload = JSON.stringify(event);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/' || req.url === '/index.html') {
      const file = path.join(__dirname, 'public', 'index.html');
      res.writeHead(200, {'Content-Type':'text/html'});
      return res.end(fs.readFileSync(file));
    }

    if (req.url === '/runtime/status') {
      const health = await proxyJson(`${API}/health`);
      const founder = await proxyJson(`${API}/api/v1/founder/intelligence`);
      return json(res, 200, {
        ok: true,
        runtime: 'lvtp-runtime-os',
        port: PORT,
        api: API,
        websocket: true,
        redis: global.redisReady === true,
        channels: CHANNELS,
        health,
        founder,
        time: new Date().toISOString()
      });
    }

    if (req.url === '/runtime/publish-test') {
      const event = {
        type: 'runtime.test',
        source: 'lvtp-runtime-os',
        channel: 'lvtp:runtime:events',
        payload: { status: 'live', continuity: 100 },
        at: new Date().toISOString()
      };
      if (global.publisher) await global.publisher.publish(event.channel, JSON.stringify(event));
      broadcast(event);
      return json(res, 200, event);
    }

    if (req.url === '/health') return json(res, 200, await proxyJson(`${API}/health`));
    if (req.url === '/founder/intelligence') return json(res, 200, await proxyJson(`${API}/api/v1/founder/intelligence`));

    json(res, 404, { ok:false, error:'not_found' });
  } catch (e) {
    json(res, 500, { ok:false, error:e.message });
  }
});

const wss = new WebSocketServer({ server });
wss.on('connection', async ws => {
  clients.add(ws);
  ws.send(JSON.stringify({
    type: 'runtime.connected',
    source: 'lvtp-runtime-os',
    redis: global.redisReady === true,
    channels: CHANNELS,
    at: new Date().toISOString()
  }));
  ws.on('close', () => clients.delete(ws));
});

async function bootRedis() {
  try {
    const subscriber = createClient();
    const publisher = createClient();
    subscriber.on('error', () => {});
    publisher.on('error', () => {});
    await subscriber.connect();
    await publisher.connect();
    global.publisher = publisher;
    global.redisReady = true;

    for (const ch of CHANNELS) {
      await subscriber.subscribe(ch, message => {
        let parsed;
        try { parsed = JSON.parse(message); } catch { parsed = { raw: message }; }
        broadcast({ channel: ch, ...parsed });
      });
    }

    await publisher.publish('lvtp:runtime:events', JSON.stringify({
      type: 'runtime.os.online',
      source: 'lvtp-runtime-os',
      port: PORT,
      at: new Date().toISOString()
    }));
  } catch {
    global.redisReady = false;
  }
}

server.listen(PORT, '0.0.0.0', async () => {
  await bootRedis();
  console.log(`LVTP Runtime OS live on ${PORT}`);
});
