import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
// Development API is reachable through Vite's local proxy; do not expose it to the network.
// Production still uses the public container bind address unless explicitly configured.
const host = process.env.HOST?.trim() || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
const domainApp = createApp();
const server = express();

server.use(cors());
server.use(express.json());
server.use(morgan('dev'));

server.get('/health', (_req, res) => {
  res.json(domainApp.health());
});

server.use('/api', routes);

server.listen(port, host, () => {
  console.log(`LVTP API listening on ${host}:${port}`);
});
