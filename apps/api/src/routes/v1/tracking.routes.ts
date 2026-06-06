import { createApp } from '../../app.js';

const app = createApp() as any;

export const trackingRoutes = {
  lookup(code: string) {
    return app.track?.(code) ?? app.findByTrackingCode?.(code) ?? null;
  }
};
