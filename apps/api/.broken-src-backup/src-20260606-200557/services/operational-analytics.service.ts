import type { BookingLifecycleStatus, BookingRecord, DriverRealtimeState } from './realtime-orchestrator.service.js';

export type AnalyticsTrendBucket = {
  bucketStartIso: string;
  completedRides: number;
  grossRevenue: number;
  businessCompletedRides: number;
};

export type AdminOperationalSnapshot = {
  generatedAt: string;
  realtime: {
    activeBookings: number;
    completedBookings: number;
    driverOnline: number;
    driverBusy: number;
  };
  bookingAnalytics: {
    total: number;
    byStatus: Record<BookingLifecycleStatus, number>;
    completionRate: number;
  };
  revenueTracking: {
    grossBookedRevenue: number;
    grossCompletedRevenue: number;
    completedRideCount: number;
    averageCompletedRideRevenue: number;
    synchronizedBookingIds: string[];
  };
  businessAccounts: {
    trackedAccounts: number;
    rides: number;
    completedRides: number;
    grossRevenue: number;
  };
  dispatchEfficiency: {
    assignments: number;
    accepts: number;
    rejects: number;
    acceptanceRate: number;
    averageAssignmentResponseSeconds: number;
  };
  trend: AnalyticsTrendBucket[];
};

type BookingAnalyticsRecord = {
  bookingId: string;
  accountId?: string;
  fareTotal: number;
  completedRevenue: number;
  completedAt?: string;
  status: BookingLifecycleStatus;
  createdAt: string;
  assignedAt?: string;
};

const lifecycleStatuses: BookingLifecycleStatus[] = ['pending','assigned','accepted','en_route','arrived','in_progress','completed','cancelled','failed'];

class OperationalAnalyticsService {
  private bookings = new Map<string, BookingAnalyticsRecord>();
  private drivers = new Map<string, DriverRealtimeState>();
  private assignmentResponses: number[] = [];
  private assignmentAttempts = 0;
  private assignmentAccepts = 0;
  private assignmentRejects = 0;
  private cachedSnapshot: AdminOperationalSnapshot | null = null;
  private cacheBuiltAtMs = 0;
  private readonly cacheTtlMs = 750;

  trackBookingCreated(booking: BookingRecord): void {
    this.invalidateCache();
    this.bookings.set(booking.id, {
      bookingId: booking.id,
      accountId: booking.customerName.startsWith('BIZ-') ? booking.customerName : undefined,
      fareTotal: this.deriveFare(booking),
      completedRevenue: 0,
      status: booking.status,
      createdAt: booking.createdAt,
      assignedAt: booking.status === 'assigned' ? booking.updatedAt : undefined
    });
  }

  trackBookingTransition(booking: BookingRecord, previousStatus?: BookingLifecycleStatus): void {
    this.invalidateCache();
    const current = this.bookings.get(booking.id) ?? {
      bookingId: booking.id,
      fareTotal: this.deriveFare(booking),
      completedRevenue: 0,
      status: booking.status,
      createdAt: booking.createdAt
    };
    if (!current.assignedAt && booking.status === 'assigned') current.assignedAt = booking.updatedAt;
    if (current.assignedAt && (booking.status === 'en_route' || booking.status === 'cancelled') && previousStatus === 'assigned') {
      this.assignmentResponses.push(Math.max(0, (new Date(booking.updatedAt).getTime() - new Date(current.assignedAt).getTime()) / 1000));
      if (booking.status === 'en_route') this.assignmentAccepts += 1;
      if (booking.status === 'cancelled') this.assignmentRejects += 1;
    }
    current.status = booking.status;
    if (booking.status === 'completed') {
      current.completedRevenue = current.fareTotal;
      current.completedAt = booking.updatedAt;
    }
    this.bookings.set(booking.id, current);
  }

  trackAssignmentIssued(): void { this.assignmentAttempts += 1; this.invalidateCache(); }

  trackDriverState(driver: DriverRealtimeState): void { this.drivers.set(driver.driverId, driver); this.invalidateCache(); }

  rebuildFromSnapshots(bookings: BookingRecord[], drivers: DriverRealtimeState[]): void {
    this.bookings.clear();
    this.drivers.clear();
    for (const b of bookings) {
      this.trackBookingCreated(b);
      this.trackBookingTransition(b);
    }
    for (const d of drivers) this.drivers.set(d.driverId, d);
    this.invalidateCache();
  }

  getAdminSnapshot(): AdminOperationalSnapshot {
    if (this.cachedSnapshot && Date.now() - this.cacheBuiltAtMs < this.cacheTtlMs) return this.cachedSnapshot;
    const byStatus = lifecycleStatuses.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<BookingLifecycleStatus, number>);
    let grossBookedRevenue = 0;
    let grossCompletedRevenue = 0;
    let completedRideCount = 0;
    let businessRides = 0;
    let businessCompletedRides = 0;
    let businessGrossRevenue = 0;
    const synchronizedBookingIds: string[] = [];
    const trendMap = new Map<string, AnalyticsTrendBucket>();

    for (const booking of this.bookings.values()) {
      byStatus[booking.status] += 1;
      grossBookedRevenue += booking.fareTotal;
      if (booking.status === 'completed') {
        completedRideCount += 1;
        grossCompletedRevenue += booking.completedRevenue;
        synchronizedBookingIds.push(booking.bookingId);
        const day = (booking.completedAt ?? booking.createdAt).slice(0, 10);
        const bucket = trendMap.get(day) ?? { bucketStartIso: `${day}T00:00:00.000Z`, completedRides: 0, grossRevenue: 0, businessCompletedRides: 0 };
        bucket.completedRides += 1;
        bucket.grossRevenue += booking.completedRevenue;
        if (booking.accountId) bucket.businessCompletedRides += 1;
        trendMap.set(day, bucket);
      }
      if (booking.accountId) {
        businessRides += 1;
        businessGrossRevenue += booking.fareTotal;
        if (booking.status === 'completed') businessCompletedRides += 1;
      }
    }

    const driverOnline = Array.from(this.drivers.values()).filter((d) => d.state !== 'offline').length;
    const driverBusy = Array.from(this.drivers.values()).filter((d) => ['assigned','en_route','arrived','in_progress'].includes(d.state)).length;
    const avgResponse = this.assignmentResponses.length ? this.assignmentResponses.reduce((a, b) => a + b, 0) / this.assignmentResponses.length : 0;

    this.cachedSnapshot = {
      generatedAt: new Date().toISOString(),
      realtime: { activeBookings: byStatus.assigned + byStatus.accepted + byStatus.en_route + byStatus.arrived + byStatus.in_progress, completedBookings: byStatus.completed, driverOnline, driverBusy },
      bookingAnalytics: {
        total: this.bookings.size,
        byStatus,
        completionRate: this.bookings.size ? Number((byStatus.completed / this.bookings.size).toFixed(4)) : 0,
      },
      revenueTracking: {
        grossBookedRevenue: Number(grossBookedRevenue.toFixed(2)),
        grossCompletedRevenue: Number(grossCompletedRevenue.toFixed(2)),
        completedRideCount,
        averageCompletedRideRevenue: completedRideCount ? Number((grossCompletedRevenue / completedRideCount).toFixed(2)) : 0,
        synchronizedBookingIds
      },
      businessAccounts: {
        trackedAccounts: new Set(Array.from(this.bookings.values()).map((b) => b.accountId).filter(Boolean)).size,
        rides: businessRides,
        completedRides: businessCompletedRides,
        grossRevenue: Number(businessGrossRevenue.toFixed(2))
      },
      dispatchEfficiency: {
        assignments: this.assignmentAttempts,
        accepts: this.assignmentAccepts,
        rejects: this.assignmentRejects,
        acceptanceRate: this.assignmentAttempts ? Number((this.assignmentAccepts / this.assignmentAttempts).toFixed(4)) : 0,
        averageAssignmentResponseSeconds: Number(avgResponse.toFixed(1))
      },
      trend: Array.from(trendMap.values()).sort((a, b) => a.bucketStartIso.localeCompare(b.bucketStartIso))
    };
    this.cacheBuiltAtMs = Date.now();
    return this.cachedSnapshot;
  }

  private invalidateCache(): void {
    this.cachedSnapshot = null;
    this.cacheBuiltAtMs = 0;
  }

  private deriveFare(_booking: BookingRecord): number {
    return 0;
  }
}

export const operationalAnalyticsService = new OperationalAnalyticsService();
