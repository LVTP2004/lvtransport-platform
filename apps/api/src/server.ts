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

server.listen(port, '0.0.0.0', () => {
  console.log(`LVTP API listening on 0.0.0.0:${port}`);
});
