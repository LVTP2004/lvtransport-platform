import { bookingLifecycleRealtimeService } from './booking-lifecycle-realtime.service.js';

export const realtimeOrchestratorService = {
  initialize(): void {
    bookingLifecycleRealtimeService.initialize();
  },
};
