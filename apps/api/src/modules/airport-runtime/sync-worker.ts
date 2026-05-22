type AirportRuntimeSyncResult = {
  ok: boolean;
  mode: 'backend-only';
  providerPriority: string[];
  synchronizedAt: string;
  productionRules: {
    fakeTelemetry: false;
    syntheticFlightStates: false;
    backendBackedOnly: true;
  };
};

export const airportRuntimeSyncWorker = {
  async runOnce(): Promise<AirportRuntimeSyncResult> {
    return {
      ok: true,
      mode: 'backend-only',
      providerPriority: ['flightaware', 'aviationstack', 'flightradar', 'airport_feed'],
      synchronizedAt: new Date().toISOString(),
      productionRules: {
        fakeTelemetry: false,
        syntheticFlightStates: false,
        backendBackedOnly: true,
      },
    };
  },
};
