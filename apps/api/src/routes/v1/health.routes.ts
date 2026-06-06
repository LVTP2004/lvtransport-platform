import { createApp } from '../../app.js';

const app = createApp();

export const healthRoutes = {
  health() {
    return app.health();
  }
};
