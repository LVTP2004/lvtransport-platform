import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const domainApp = createApp();
const server = express();

server.use(cors());
server.use(express.json());
server.use(morgan('dev'));

server.get('/health', (_req, res) => {
  res.json(domainApp.health());
});

server.use('/api', routes);

const host = process.env.LVTP_FIREBASE_MODE === 'staging' ? '127.0.0.1' : '0.0.0.0';
server.listen(port, host, () => {
  console.log(`LVTP API listening on ${host}:${port}`);
});
