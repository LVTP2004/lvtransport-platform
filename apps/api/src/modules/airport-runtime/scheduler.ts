import { airportRuntimeService } from './service.js';

type RuntimeJobResult = {
  ok: boolean;
  executedAt: string;
  providers: string[];
  mode: 'backend-only';
};

class AirportRuntimeScheduler {
  private interval: NodeJS.Timeout | null = null;

  start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      try {
        const result = await this.runCycle();
        console.log('[airport-runtime-sync]', JSON.stringify(result));
      } catch (error) {
        console.error('[airport-runtime-sync-error]', error);
      }
    }, 300000);
  }

  stop() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = null;
  }

  async runCycle(): Promise<RuntimeJobResult> {
    await airportRuntimeService.getSnapshot({
      flightNumber: 'SN204',
      airline: 'Brussels Airlines',
      terminal: 'A',
      arrivalAirport: 'BRU',
    });

    return {
      ok: true,
      executedAt: new Date().toISOString(),
      providers: [
        'flightaware',
        'aviationstack',
        'flightradar',
        'airport_feed',
      ],
      mode: 'backend-only',
    };
  }
}

export const airportRuntimeScheduler =
  new AirportRuntimeScheduler();
