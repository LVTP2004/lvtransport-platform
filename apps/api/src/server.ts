import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3011);
const app = createApp();

app.listen(port, '127.0.0.1', () => {
  console.log(JSON.stringify({
    ok: true,
    service: '@lvtransport/api',
    port,
    time: new Date().toISOString()
  }));
});
