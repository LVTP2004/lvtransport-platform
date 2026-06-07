type AnyRecord = Record<string, any>;

class EmptyPersistenceRepository {
  private rides = new Map<string, AnyRecord>();
  private payments = new Map<string, AnyRecord>();
  private auditEvents: AnyRecord[] = [];
  private messageEvents: AnyRecord[] = [];
  private notificationAttempts = new Map<string, AnyRecord>();
  private recoveryEvents = new Map<string, AnyRecord>();

  async getRideById(id: string) { return this.rides.get(id) ?? null; }
  async createRide(record: AnyRecord) { this.rides.set(record.id, record); return record; }
  async updateRideStatus(id: string, status: string, updatedAt = new Date().toISOString()) {
    const ride = this.rides.get(id); if (!ride) return null;
    const next = { ...ride, status, updatedAt }; this.rides.set(id, next); return next;
  }
  async assignDriver(id: string, driverId: string, updatedAt = new Date().toISOString()) {
    const ride = this.rides.get(id); if (!ride) return null;
    const next = { ...ride, assignedDriverId: driverId, updatedAt }; this.rides.set(id, next); return next;
  }

  async listPayments() { return [...this.payments.values()]; }
  async createPayment(record: AnyRecord) { this.payments.set(record.id, record); return record; }
  async updatePaymentStatus(id: string, status: string, updatedAt = new Date().toISOString()) {
    const payment = this.payments.get(id); if (!payment) return null;
    const next = { ...payment, status, updatedAt }; this.payments.set(id, next); return next;
  }
  async attachInvoiceReference(id: string, invoiceReference: string, updatedAt = new Date().toISOString()) {
    const payment = this.payments.get(id); if (!payment) return null;
    const next = { ...payment, invoiceReference, updatedAt }; this.payments.set(id, next); return next;
  }

  async listAuditEvents() { return this.auditEvents; }
  async recordAuditEvent(event: AnyRecord) { this.auditEvents.push(event); return event; }

  async listMessageEvents(rideId?: string) {
    return rideId ? this.messageEvents.filter((e) => e.rideId === rideId) : this.messageEvents;
  }
  async createMessageEvent(event: AnyRecord) { this.messageEvents.push(event); return event; }
  async recordMessageEvent(event: AnyRecord) { return this.createMessageEvent(event); }

  async listFailedNotifications() {
    return [...this.notificationAttempts.values()].filter((n) => n.status === 'failed');
  }
  async listNotificationAttempts() { return [...this.notificationAttempts.values()]; }
  async createNotificationAttempt(event: AnyRecord) { this.notificationAttempts.set(event.id, event); return event; }
  async recordNotificationAttempt(event: AnyRecord) { return this.createNotificationAttempt(event); }
  async updateNotificationStatus(id: string, status: string, errorMessage?: string | null, updatedAt = new Date().toISOString()) {
    const attempt = this.notificationAttempts.get(id); if (!attempt) return null;
    const next = { ...attempt, status, errorMessage, updatedAt }; this.notificationAttempts.set(id, next); return next;
  }

  async listRecoveryEvents
(status?: string) {
    const events = [...this.recoveryEvents.values()];
    return status ? events.filter((e) => e.status === status) : events;
  }

  async createRecoveryEvent(event: AnyRecord) {
    this.recoveryEvents.set(event.id, event);
    return event;
  }

  async recordRecoveryEvent(event: AnyRecord) {
    return this.createRecoveryEvent(event);
  }

  async updateRecoveryStatus(id: string, status: string, notes?: string | null, updatedAt = new Date().toISOString()) {
    const event = this.recoveryEvents.get(id);
    if (!event) return null;
    const next = { ...event, status, notes, updatedAt };
    this.recoveryEvents.set(id, next);
    return next;
  }
}

export const emptyPersistenceRepository = new EmptyPersistenceRepository();
