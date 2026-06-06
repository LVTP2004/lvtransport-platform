import type { DriverStatus } from './driver.status.js';

export class DriverService {
  updateStatus(status: DriverStatus) {
    // TODO: persist status and broadcast via websocket.
    return { accepted: true, status };
  }
}
