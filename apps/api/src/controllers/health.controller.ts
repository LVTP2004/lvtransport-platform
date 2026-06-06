import { createApp } from '../app.js';

const app = createApp();

export const healthController = () => {
  return app.health();
};

export const readinessController = () => {
  return {
    ...app.health(),
    status: 'ready'
  };
};

export const startupValidationController = () => {
  return {
    ...app.health(),
    status: 'startup-valid'
  };
};
