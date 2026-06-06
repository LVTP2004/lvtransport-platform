export type RouteResponse = {
  ok: boolean;
  service: string;
  version: string;
  mode: string;
  time: string;
};

export function createApp() {
  return {
    health(): RouteResponse {
      return {
        ok: true,
        service: '@lvtransport/api',
        version: '0.1.0',
        mode: 'safe-compile-baseline',
        time: new Date().toISOString()
      };
    },
    bookings() {
      return {
        data: [],
        note: 'safe baseline only; production booking logic not enabled'
      };
    }
  };
}
