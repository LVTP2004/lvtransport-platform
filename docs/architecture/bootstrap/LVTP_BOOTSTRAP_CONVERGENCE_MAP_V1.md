# LVTP BOOTSTRAP CONVERGENCE MAP V1

Status: GENERATED
Category: Implementation Bootstrap

## RideStatus Definitions
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/driver/src/app/App.tsx:              <div className="flex gap-2">{nextStatuses.map((status) => <button key={status} className="rounded border border-zinc-600 px-3 py-1" onClick={() => dispatchMvpStore.updateRideStatus(activeRide.bookingId, status, DRIVER_ID)}>{status}</button>)}</div>
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/api/src/dispatch/dispatch.service.ts:    const assignment = dispatchMvpStore.updateRideStatus(bookingId, status, actorId);
apps/api/src/persistence/firebase-rest.repositories.ts:  RideStatus,
apps/api/src/persistence/firebase-rest.repositories.ts:  async updateRideStatus(id: string, status: RideStatus): Promise<RideRecord | null> {
apps/api/src/persistence/repository-contracts.ts:export type RideStatus = 'pending' | 'assigned' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
apps/api/src/persistence/repository-contracts.ts:  status: RideStatus;
apps/api/src/persistence/repository-contracts.ts:export interface RideRepository {
apps/api/src/persistence/repository-contracts.ts:  updateRideStatus(id: string, status: RideStatus): Promise<RideRecord | null>;
apps/api/src/modules/persistence/in-memory-empty.repository.ts:  RideStatus
apps/api/src/modules/persistence/in-memory-empty.repository.ts:  async updateRideStatus(_id: string, _status: RideStatus): Promise<RideRecord | null> { return null; }
apps/api/src/modules/persistence/contracts.ts:export type RideStatus = 'created' | 'assigned' | 'driver_en_route' | 'in_progress' | 'completed' | 'cancelled';
apps/api/src/modules/persistence/contracts.ts:export interface RideRecord {
apps/api/src/modules/persistence/contracts.ts:  status: RideStatus;
apps/api/src/modules/persistence/contracts.ts:export type RideStatus = 'requested' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
apps/api/src/modules/persistence/contracts.ts:export interface RideRecord {
apps/api/src/modules/persistence/contracts.ts:  status: RideStatus;
apps/api/src/modules/persistence/contracts.ts:export type RideStatus = string;
apps/api/src/modules/persistence/contracts.ts:export interface RideRecord {
apps/api/src/modules/persistence/contracts.ts:  status: RideStatus;
apps/api/src/modules/persistence/contracts.ts:export interface RideRepository {
apps/api/src/modules/persistence/contracts.ts:  updateRideStatus(id: string, status: RideStatus): Promise<RideRecord | null>;
apps/api/src/modules/persistence/contracts.ts:  updateRideStatus(id: string, status: RideStatus, updatedAt: string): Promise<RideRecord | null>;
apps/api/src/modules/persistence/sqlite.repositories.ts:  RideStatus,
apps/api/src/modules/persistence/sqlite.repositories.ts:const mapRide = (row: any): RideRecord => ({ id: row.id, code: row.code, customerId: row.customer_id, status: row.status as RideStatus, assignedDriverId: row.assigned_driver_id, createdAt: row.created_at, updatedAt: row.updated_at });
apps/api/src/modules/persistence/sqlite.repositories.ts:  async updateRideStatus(id, status, updatedAt) { return safe(() => { db.prepare('UPDATE rides SET status = ?, updated_at = ? WHERE id = ?').run(status, updatedAt, id); const row = db.prepare('SELECT * FROM rides WHERE id = ?').get(id); return row ? mapRide(row) : null; }, 'Failed to update ride status'); },
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
packages/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
packages/shared/src/ride-lifecycle.ts:export type RideStatus =
packages/shared/src/ride-lifecycle.ts:export const FINAL_RIDE_STATUSES: readonly RideStatus[] = [
packages/shared/src/ride-lifecycle.ts:export const RIDE_STATUS_TRANSITIONS: Record<RideStatus, readonly RideStatus[]> = {
packages/shared/src/ride-lifecycle.ts:export function isFinalRideStatus(status: RideStatus): boolean {
packages/shared/src/ride-lifecycle.ts:export function canTransitionRideStatus(from: RideStatus, to: RideStatus): boolean {
packages/shared/src/ride-lifecycle.ts:export function normalizeLegacyRideStatus(input: string): RideStatus {
packages/shared/src/ride-lifecycle.ts:  const legacyMap: Record<string, RideStatus> = {
packages/shared/src/ride-lifecycle.ts:  return legacyMap[normalized] ?? (normalized as RideStatus);

## Tracking Code Implementations
apps/web/src/pages/home/HomeOriginal.tsx:  vip: 'Activeer VIP/business privileges binnen het private LV-ecosysteem.',
apps/web/src/pages/home/HomeOriginal.tsx:    setAuthStatus('Verified identity geactiveerd. Welkom in het private LV-ecosysteem.');
apps/web/src/pages/Booking.tsx:  const [trackingCode, setTrackingCode] = useState('')
apps/web/src/pages/Booking.tsx:    const code = (codeOverride ?? trackingCode).trim()
apps/web/src/pages/Booking.tsx:            <input style={fieldStyle} placeholder="Bijvoorbeeld LV-MA37F9-F3A29D" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
apps/driver/src/app/App.tsx:  { id: 'LV-9012', rider: 'Ava M.', route: 'Bellagio → The Venetian', fare: '$24.80', status: 'Completed' },
apps/driver/src/app/App.tsx:  { id: 'LV-9011', rider: 'Noah P.', route: 'Wynn → Airport T1', fare: '$31.20', status: 'Completed' },
apps/driver/src/app/App.tsx:  { id: 'LV-9010', rider: 'Sophia R.', route: 'Aria → Fremont Street', fare: '$19.30', status: 'Completed' }
apps/api/src/tracking/tracking.events.ts:  trackingCode: string;
apps/api/src/tracking/tracking.service.ts:const generateTrackingCode = (bookingId: string) => `trk_${bookingId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${Math.random().toString(36).slice(2, 8)}`;
apps/api/src/tracking/tracking.service.ts:  trackingCode: string;
apps/api/src/tracking/tracking.service.ts:    const trackingCode = generateTrackingCode(bookingId);
apps/api/src/tracking/tracking.service.ts:    const trackingUrl = `/tracking/${trackingCode}`;
apps/api/src/tracking/tracking.service.ts:      trackingCode,
apps/api/src/tracking/tracking.service.ts:    trackingStore.set(trackingCode, payload);
apps/api/src/tracking/tracking.service.ts:  findByTrackingCode(trackingCode: string) {
apps/api/src/tracking/tracking.service.ts:    return trackingStore.get(trackingCode) ?? null;
apps/api/src/tracking/tracking.service.ts:    const trackingCode = crypto.randomBytes(5).toString('hex').toUpperCase();
apps/api/src/tracking/tracking.service.ts:      trackingCode,
apps/api/src/tracking/tracking.service.ts:      publicUrl: `/tracking/${trackingCode}`,
apps/api/src/tracking/tracking.service.ts:    trackingLinks.set(trackingCode, link);
apps/api/src/tracking/tracking.service.ts:  lookupByCode(trackingCode: string) {
apps/api/src/tracking/tracking.service.ts:    const link = trackingLinks.get(trackingCode.toUpperCase());
apps/api/src/bookings/booking-engine.service.ts:  trackingCode: string;
apps/api/src/bookings/booking-engine.service.ts:  createBooking(input: Omit<Booking, 'id' | 'status' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'fare'> & { distanceKm: number }) {
apps/api/src/bookings/booking-engine.service.ts:    const trackingCode = `LV-${id.slice(0, 8).toUpperCase()}`;
apps/api/src/bookings/booking-engine.service.ts:      trackingCode,
apps/api/src/bookings/booking-engine.service.ts:    return this.listBookings().find((booking) => booking.trackingCode === code);
apps/api/src/bookings/notification-orchestrator.service.ts:    const trackingCode = input.bookingId.slice(0, 8).toUpperCase();
apps/api/src/bookings/notification-orchestrator.service.ts:    const trackingUrl = `https://track.lvtransport.local/${trackingCode}`;
apps/api/src/bookings/notification-orchestrator.service.ts:    return { trackingCode, trackingUrl, customerNotification, adminAlert };
apps/api/src/bookings/booking.service.ts:const makeBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;
apps/api/src/bookings/booking.service.ts:    const trackingCode = this.generateTrackingCode();
apps/api/src/bookings/booking.service.ts:    const path = `${TRACKING_BASE_PATH}/${trackingCode}`;
apps/api/src/bookings/booking.service.ts:      trackingCode,
apps/api/src/bookings/booking.service.ts:  private generateTrackingCode() {
apps/api/src/bookings/booking.service.ts:      data: { trackingCode: tracking.trackingCode, trackingUrl: tracking.trackingUrl },
apps/api/src/bookings/booking.events.ts:  trackingCode?: string;
apps/api/src/routes/v1/bookings.routes.ts:router.get('/tracking/:trackingCode', (req, res) => {
apps/api/src/routes/v1/bookings.routes.ts:  const booking = bookingEngineService.findByTrackingCode(req.params.trackingCode);
apps/api/src/modules/bookings/service.ts:  return `LV-${stamp}-${token}`;
apps/api/src/services/realtime-orchestrator.service.ts:const createBookingCode = () => `LV-${Math.floor(100000 + Math.random() * 900000)}`;
apps/api/src/services/booking.service.ts:  return `LV-${new Date().getFullYear()}-${randomPart}`;
packages/moni-assistent/src/notifications.ts:    trackingCode: booking.trackingCode ?? null,
packages/moni-assistent/src/bookingFlow.ts:  booking.trackingCode = deps.generateTrackingCode(booking.id);
packages/moni-assistent/src/types.ts:  trackingCode?: string;
packages/moni-assistent/src/types.ts:  generateTrackingCode: (bookingId: string) => string;
packages/shared/src/tracking.ts:export function createTrackingCode(): TrackingCode {
packages/shared/src/tracking.ts:  return `LV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
packages/shared/src/tracking.ts:  return /^LV-[A-F0-9]{8}$/.test(normalizeTrackingCode(input));

## localStorage Operational Usage
apps/web/node_modules/typescript/lib/lib.dom.d.ts:    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/web/node_modules/typescript/lib/lib.dom.d.ts:    readonly localStorage: Storage;
apps/web/node_modules/typescript/lib/lib.dom.d.ts:/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/web/node_modules/typescript/lib/lib.dom.d.ts:declare var localStorage: Storage;
apps/web/src/modules/moni/learning/controlled-learning.ts:  const current = globalThis.localStorage?.getItem(storageKey);
apps/web/src/modules/moni/learning/controlled-learning.ts:  globalThis.localStorage?.setItem(storageKey, JSON.stringify(parsed.slice(0, 200)));
apps/web/src/pages/home/HomeOriginal.tsx:  const [identity, setIdentity] = useState<VerifiedIdentity | null>(() => JSON.parse(localStorage.getItem('lvtp_verified_identity') ?? 'null'));
apps/web/src/pages/home/HomeOriginal.tsx:    localStorage.setItem('lvtp_verified_identity', JSON.stringify(nextIdentity));
apps/web/src/pages/home/HomeOriginal.tsx:    const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
apps/web/src/pages/home/HomeOriginal.tsx:    localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));
apps/web/src/pages/home/HomeOriginal.tsx:    const records = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
apps/web/src/pages/home/HomeOriginal.tsx:      {identity && <div className='identity-chip glass-panel'>Verified: {identity.name} • {identity.roleIntent} <button onClick={() => { localStorage.removeItem('lvtp_verified_identity'); setIdentity(null); }}>Afmelden</button></div>}
apps/web/src/utils/operationalSound.ts:  return window.localStorage.getItem(STORAGE_KEY) !== 'false'
apps/web/src/utils/operationalSound.ts:  window.localStorage.setItem(STORAGE_KEY, String(enabled))
apps/web-consolidated-grey/node_modules/typescript/lib/lib.dom.d.ts:    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/web-consolidated-grey/node_modules/typescript/lib/lib.dom.d.ts:    readonly localStorage: Storage;
apps/web-consolidated-grey/node_modules/typescript/lib/lib.dom.d.ts:/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/web-consolidated-grey/node_modules/typescript/lib/lib.dom.d.ts:declare var localStorage: Storage;
apps/driver/node_modules/typescript/lib/lib.dom.d.ts:    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/driver/node_modules/typescript/lib/lib.dom.d.ts:    readonly localStorage: Storage;
apps/driver/node_modules/typescript/lib/lib.dom.d.ts:/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/driver/node_modules/typescript/lib/lib.dom.d.ts:declare var localStorage: Storage;
apps/driver/src/app/App.tsx:  const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
apps/driver/src/modules/auth/state/auth.state.ts:    const saved = localStorage.getItem(STORAGE_KEY);
apps/driver/src/modules/auth/state/auth.state.ts:    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
apps/driver/src/modules/auth/state/auth.state.ts:    localStorage.removeItem(STORAGE_KEY);
apps/api/node_modules/typescript/lib/lib.dom.d.ts:    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/api/node_modules/typescript/lib/lib.dom.d.ts:    readonly localStorage: Storage;
apps/api/node_modules/typescript/lib/lib.dom.d.ts:/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/api/node_modules/typescript/lib/lib.dom.d.ts:declare var localStorage: Storage;
apps/api/node_modules/@types/node/web-globals/storage.d.ts:    var localStorage: Storage;
apps/business/node_modules/typescript/lib/lib.dom.d.ts:    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/business/node_modules/typescript/lib/lib.dom.d.ts:    readonly localStorage: Storage;
apps/business/node_modules/typescript/lib/lib.dom.d.ts:/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/business/node_modules/typescript/lib/lib.dom.d.ts:declare var localStorage: Storage;
apps/admin/node_modules/typescript/lib/lib.dom.d.ts:    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/admin/node_modules/typescript/lib/lib.dom.d.ts:    readonly localStorage: Storage;
apps/admin/node_modules/typescript/lib/lib.dom.d.ts:/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) */
apps/admin/node_modules/typescript/lib/lib.dom.d.ts:declare var localStorage: Storage;
apps/admin/src/app/App.tsx:  const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
apps/admin/src/modules/auth/state/auth.state.ts:    const saved = localStorage.getItem(STORAGE_KEY);
apps/admin/src/modules/auth/state/auth.state.ts:    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
apps/admin/src/modules/auth/state/auth.state.ts:    localStorage.removeItem(STORAGE_KEY);

## Dispatch Contracts
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export type DispatchBookingStatus =
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export interface DispatchAssignment {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  status: DispatchBookingStatus;
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  bookings: DispatchAssignment[];
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const assignments = new Map<string, DispatchAssignment>();
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const pushHistory = (assignment: DispatchAssignment, event: DispatchEvent): void => {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export const dispatchMvpStore = {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  upsertPendingBooking(bookingId: string, customerId: string): DispatchAssignment {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    const created: DispatchAssignment = {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  assignDriver(bookingId: string, customerId: string, driverId: string, actorId = 'admin'): DispatchAssignment {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  driverRespond(bookingId: string, driverId: string, decision: 'accept' | 'reject'): DispatchAssignment | undefined {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getBooking(bookingId: string): DispatchAssignment | undefined {
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getDriverActiveRide(driverId: string): DispatchAssignment | undefined {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export type DispatchBookingStatus =
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export interface DispatchAssignment {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  status: DispatchBookingStatus;
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  bookings: DispatchAssignment[];
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const assignments = new Map<string, DispatchAssignment>();
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const pushHistory = (assignment: DispatchAssignment, event: DispatchEvent): void => {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export const dispatchMvpStore = {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  upsertPendingBooking(bookingId: string, customerId: string): DispatchAssignment {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    const created: DispatchAssignment = {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  assignDriver(bookingId: string, customerId: string, driverId: string, actorId = 'admin'): DispatchAssignment {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  driverRespond(bookingId: string, driverId: string, decision: 'accept' | 'reject'): DispatchAssignment | undefined {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getBooking(bookingId: string): DispatchAssignment | undefined {
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getDriverActiveRide(driverId: string): DispatchAssignment | undefined {
apps/driver/src/app/App.tsx:  dispatchMvpStore,
apps/driver/src/app/App.tsx:  type DispatchBookingStatus,
apps/driver/src/app/App.tsx:const nextStatuses: DispatchBookingStatus[] = ['driver_arriving', 'passenger_onboard', 'completed'];
apps/driver/src/app/App.tsx:    dispatchMvpStore.setDriverAvailability(DRIVER_ID, availability);
apps/driver/src/app/App.tsx:  useEffect(() => dispatchMvpStore.subscribe(setState), []);
apps/driver/src/app/App.tsx:  const activeRide = dispatchMvpStore.getDriverActiveRide(DRIVER_ID);
apps/driver/src/app/App.tsx:                <button className="rounded bg-amber-500 px-3 py-2 text-zinc-900" onClick={() => dispatchMvpStore.driverRespond(activeRide.bookingId, DRIVER_ID, 'accept')}>Accept Ride</button>
apps/driver/src/app/App.tsx:                <button className="rounded border border-zinc-600 px-3 py-2" onClick={() => dispatchMvpStore.driverRespond(activeRide.bookingId, DRIVER_ID, 'reject')}>Reject Ride</button>
apps/driver/src/app/App.tsx:              <div className="flex gap-2">{nextStatuses.map((status) => <button key={status} className="rounded border border-zinc-600 px-3 py-1" onClick={() => dispatchMvpStore.updateRideStatus(activeRide.bookingId, status, DRIVER_ID)}>{status}</button>)}</div>
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export type DispatchBookingStatus =
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export interface DispatchAssignment {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  status: DispatchBookingStatus;
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  bookings: DispatchAssignment[];
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const assignments = new Map<string, DispatchAssignment>();
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const pushHistory = (assignment: DispatchAssignment, event: DispatchEvent): void => {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export const dispatchMvpStore = {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  upsertPendingBooking(bookingId: string, customerId: string): DispatchAssignment {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    const created: DispatchAssignment = {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  assignDriver(bookingId: string, customerId: string, driverId: string, actorId = 'admin'): DispatchAssignment {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  driverRespond(bookingId: string, driverId: string, decision: 'accept' | 'reject'): DispatchAssignment | undefined {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getBooking(bookingId: string): DispatchAssignment | undefined {
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getDriverActiveRide(driverId: string): DispatchAssignment | undefined {
apps/api/src/dispatch/dispatch.service.ts:import { dispatchMvpStore, type DispatchBookingStatus } from '@lvtransport/realtime';
apps/api/src/dispatch/dispatch.service.ts:    const assignment = dispatchMvpStore.assignDriver(params.bookingId, params.customerId, params.driverId);
apps/api/src/dispatch/dispatch.service.ts:  driverDecision(params: { bookingId: string; driverId: string; decision: 'accept' | 'reject' }) {
apps/api/src/dispatch/dispatch.service.ts:    const assignment = dispatchMvpStore.driverRespond(params.bookingId, params.driverId, params.decision);
apps/api/src/dispatch/dispatch.service.ts:  updateStatus(bookingId: string, status: DispatchBookingStatus, actorId: string) {
apps/api/src/dispatch/dispatch.service.ts:    const assignment = dispatchMvpStore.updateRideStatus(bookingId, status, actorId);
apps/api/src/persistence/firebase-rest.repositories.ts:  async assignDriver(id: string, driverId: string, driverName: string): Promise<RideRecord | null> {
apps/api/src/persistence/repository-contracts.ts:  assignDriver(id: string, driverId: string, driverName: string): Promise<RideRecord | null>;
apps/api/src/bookings/booking.service.ts:  assignDriver(bookingId: string, driverId: string, expectedVersion?: number) {
apps/api/src/bookings/booking.events.ts:export type DispatchBookingStatus =
apps/api/src/bookings/booking.events.ts:  status: DispatchBookingStatus;
apps/api/src/routes/v1/index.ts:  try { res.json({ booking: realtimeOrchestratorService.assignDriver({ bookingId: req.params.bookingId, ...req.body }) }); }
apps/api/src/routes/v1/bookings.routes.ts:    const booking = bookingService.assignDriver(req.params.id, driverId, expectedVersion);
apps/api/src/modules/persistence/in-memory-empty.repository.ts:  async assignDriver(_id: string, _driverId: string): Promise<RideRecord | null> { return null; }
apps/api/src/modules/persistence/contracts.ts:  assignDriver(id: string, driverId: string): Promise<RideRecord | null>;
apps/api/src/modules/persistence/contracts.ts:  assignDriver(id: string, driverId: string, updatedAt: string): Promise<RideRecord | null>;
apps/api/src/modules/persistence/sqlite.repositories.ts:  async assignDriver(id, driverId, updatedAt) { return safe(() => { db.prepare('UPDATE rides SET assigned_driver_id = ?, updated_at = ? WHERE id = ?').run(driverId, updatedAt, id); const row = db.prepare('SELECT * FROM rides WHERE id = ?').get(id); return row ? mapRide(row) : null; }, 'Failed to assign driver'); },
apps/api/src/services/lvtp-failure-recovery.simulation.test.ts:    realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Driver ${i + 1}` });
apps/api/src/services/lvtp-failure-recovery.simulation.test.ts:    const assigned = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: unavailableDriver, driverName: 'Unavailable Driver' });
apps/api/src/services/realtime-orchestrator.lifecycle-guard.test.ts:  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-terminal', driverName: 'Driver Terminal' });
apps/api/src/services/realtime-orchestrator.lifecycle-guard.test.ts:  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-invalid-accept', driverName: 'Driver Invalid Accept' });
apps/api/src/services/realtime-orchestrator.lifecycle-guard.test.ts:  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-restore', driverName: 'Driver Restore' });
apps/api/src/services/realtime-orchestrator.lifecycle-guard.test.ts:  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-stale-version', driverName: 'Driver Stale Version' });
apps/api/src/services/realtime-orchestrator.lifecycle-guard.test.ts:  const assigned = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-idempotent-response', driverName: 'Driver Idempotent Response' });
apps/api/src/services/realtime-orchestrator.repeatability-chaos.test.ts:    realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Repeat Driver ${i}` });
apps/api/src/services/realtime-orchestrator.repeatability-chaos.test.ts:  const first = realtimeOrchestratorService.assignDriver({
apps/api/src/services/realtime-orchestrator.repeatability-chaos.test.ts:  const replay = realtimeOrchestratorService.assignDriver({
apps/api/src/services/realtime-orchestrator.repeatability-chaos.test.ts:  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: 'Recover Driver' });
apps/api/src/services/realtime-orchestrator.assign-driver.test.ts:  const first = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-idem', driverName: 'Driver A' });
apps/api/src/services/realtime-orchestrator.assign-driver.test.ts:  const second = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-idem', driverName: 'Driver A' });
apps/api/src/services/realtime-orchestrator.assign-driver.test.ts:  realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-main', driverName: 'Main Driver' });
apps/api/src/services/realtime-orchestrator.assign-driver.test.ts:    () => realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId: 'driver-other', driverName: 'Other Driver' }),
apps/api/src/services/realtime-orchestrator.assign-driver.test.ts:    () => realtimeOrchestratorService.assignDriver({ bookingId, driverId: 'driver-hydrated', driverName: 'Hydrated Driver' }),
apps/api/src/services/realtime-orchestrator.service.ts:  assignDriver(params: { bookingId: string; driverId: string; driverName: string; idempotencyKey?: string }): BookingRecord {
apps/api/src/services/final-ecosystem-scorecard.service.test.ts:  const assigned = realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Driver ${suffix}` });
apps/api/src/services/realtime-orchestrator.controlled-validation.test.ts:    const assign = () => realtimeOrchestratorService.assignDriver({ bookingId: booking.id, driverId, driverName: `Driver ${i}`, idempotencyKey: `assign:${booking.id}` });
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export type DispatchBookingStatus =
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export interface DispatchAssignment {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  status: DispatchBookingStatus;
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  bookings: DispatchAssignment[];
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const assignments = new Map<string, DispatchAssignment>();
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:const pushHistory = (assignment: DispatchAssignment, event: DispatchEvent): void => {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:export const dispatchMvpStore = {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  upsertPendingBooking(bookingId: string, customerId: string): DispatchAssignment {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    const created: DispatchAssignment = {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  assignDriver(bookingId: string, customerId: string, driverId: string, actorId = 'admin'): DispatchAssignment {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  driverRespond(bookingId: string, driverId: string, decision: 'accept' | 'reject'): DispatchAssignment | undefined {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getBooking(bookingId: string): DispatchAssignment | undefined {
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:  getDriverActiveRide(driverId: string): DispatchAssignment | undefined {
apps/admin/src/app/App.tsx:import { dispatchMvpStore, getDispatchSnapshot, type DispatchBookingStatus } from '@lvtransport/realtime';
apps/admin/src/app/App.tsx:  useEffect(() => dispatchMvpStore.subscribe(setState), []);
apps/admin/src/app/App.tsx:  const assign = () => dispatchMvpStore.assignDriver(bookingId, customerId, driverId, 'admin-control');
apps/admin/src/app/App.tsx:function Status({ status }: { status: DispatchBookingStatus }) {
packages/realtime/src/dispatch/mvp.ts:export type DispatchBookingStatus =
packages/realtime/src/dispatch/mvp.ts:export interface DispatchAssignment {
packages/realtime/src/dispatch/mvp.ts:  status: DispatchBookingStatus;
packages/realtime/src/dispatch/mvp.ts:  bookings: DispatchAssignment[];
packages/realtime/src/dispatch/mvp.ts:const assignments = new Map<string, DispatchAssignment>();
packages/realtime/src/dispatch/mvp.ts:const pushHistory = (assignment: DispatchAssignment, event: DispatchEvent): void => {
packages/realtime/src/dispatch/mvp.ts:export const dispatchMvpStore = {
packages/realtime/src/dispatch/mvp.ts:  upsertPendingBooking(bookingId: string, customerId: string): DispatchAssignment {
packages/realtime/src/dispatch/mvp.ts:    const created: DispatchAssignment = {
packages/realtime/src/dispatch/mvp.ts:  assignDriver(bookingId: string, customerId: string, driverId: string, actorId = 'admin'): DispatchAssignment {
packages/realtime/src/dispatch/mvp.ts:  driverRespond(bookingId: string, driverId: string, decision: 'accept' | 'reject'): DispatchAssignment | undefined {
packages/realtime/src/dispatch/mvp.ts:  updateRideStatus(bookingId: string, status: DispatchBookingStatus, actorId: string): DispatchAssignment | undefined {
packages/realtime/src/dispatch/mvp.ts:  getBooking(bookingId: string): DispatchAssignment | undefined {
packages/realtime/src/dispatch/mvp.ts:  getDriverActiveRide(driverId: string): DispatchAssignment | undefined {

## Moni Verified Context Candidates
apps/web/node_modules/typescript/lib/typescript.d.ts:                unverified?: boolean;
apps/web/node_modules/typescript/lib/typescript.d.ts:        unverified?: boolean;
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    | 'booking_status_updated';
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:        { type: 'booking_status_updated', actorId: 'system', occurredAt: now(), note: 'booking pending' },
apps/web/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:      type: 'booking_status_updated',
apps/web/src/architecture/notification.architecture.ts:    'booking_status_update',
apps/web/src/modules/moni/types/moni.types.ts:  | 'booking_status_explanation'
apps/web/src/modules/moni/types/moni.types.ts:export type MoniContextEnvelope = {
apps/web/src/modules/moni/types/moni.types.ts:  booking?: { bookingId?: string; status?: string; knownFields?: MoniBookingFields };
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:import type { MoniAudience, MoniBranch, MoniContextEnvelope, MoniEscalationReason, MoniIntent, MoniResponse } from '../types/moni.types';
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:const buildReviewPrompt = (context: MoniContextEnvelope): string => {
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:  if ((context.booking?.status ?? '').toLowerCase() !== 'completed') {
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:    return 'Reviews are available for verified completed rides only. Share your booking code and I will confirm eligibility.';
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:  return 'Thank you for riding with LVTP. You can leave a verified premium review for punctuality, professionalism, comfort, operational communication, airport reliability, and overall premium experience.';
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:  context: MoniContextEnvelope;
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:    input.intent === 'booking_status_explanation'
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:      ? explainBookingStatus(input.context.booking?.status)
apps/web/src/modules/moni/core/moni-assistant-core.service.ts:              ? explainBookingStatus(input.context.booking?.status)
apps/web/src/modules/moni/templates/responses.ts:    booking_status_explanation: 'Ik deel alleen geverifieerde statusinformatie uit het boekingssysteem.',
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:import type { MoniBookingFields, MoniContextEnvelope } from '../types/moni.types';
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:export const getMissingBookingFields = (context: MoniContextEnvelope): Array<keyof MoniBookingFields> => {
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:  const known = context.booking?.knownFields ?? {};
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:  return map[normalized] ?? 'Booking status is currently unverified. Please share your booking code for confirmation.';
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:export const explainOnboardingStatus = (context: MoniContextEnvelope): string => {
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:  if (!onboarding.identityVerified) missing.push('verified identity check');
apps/web/src/modules/moni/adapters/booking-context.adapter.ts:    return 'Your premium onboarding is fully verified. You can proceed with booking, tracking, and VIP/business operations.';
apps/web/src/modules/moni/adapters/driver-context.adapter.ts:import type { MoniContextEnvelope } from '../types/moni.types';
apps/web/src/modules/moni/adapters/driver-context.adapter.ts:export const buildDriverSupportGuidance = (context: MoniContextEnvelope): string => {
apps/web/src/modules/moni/rules/response-rules.ts:const prohibitedClaims = ['invent_price', 'invent_driver_location', 'invent_booking_status', 'auto_email', 'auto_invoice'];
apps/web/src/modules/moni/rules/response-rules.ts:    'I can only share verified booking and operations information. For sensitive details, I will escalate to the owner/operator.'
apps/web/src/modules/moni/rules/response-rules.ts:  noUnverifiedStatus: true,
apps/web/src/pages/home/HomeOriginal.tsx:  verifiedAt: string;
apps/web/src/pages/home/HomeOriginal.tsx:  expansion: 'Start verified partner/operator onboarding voor LV Business Expansion.'
apps/web/src/pages/home/HomeOriginal.tsx:  const [identity, setIdentity] = useState<VerifiedIdentity | null>(() => JSON.parse(localStorage.getItem('lvtp_verified_identity') ?? 'null'));
apps/web/src/pages/home/HomeOriginal.tsx:  const [verifiedReviews, setVerifiedReviews] = useState<string[]>([]);
apps/web/src/pages/home/HomeOriginal.tsx:      setAuthStatus('Email en telefoon zijn verplicht voor verified operational toegang.');
apps/web/src/pages/home/HomeOriginal.tsx:      verifiedAt: new Date().toISOString()
apps/web/src/pages/home/HomeOriginal.tsx:    localStorage.setItem('lvtp_verified_identity', JSON.stringify(nextIdentity));
apps/web/src/pages/home/HomeOriginal.tsx:    let message = `Bedankt ${identity.name || 'klant'}, uw verified rit ${code} is ingediend.`;
apps/web/src/pages/home/HomeOriginal.tsx:      <section id='hero' className='glass-panel hero-panel rounded-3xl p-6 sm:p-10'><p className='text-xs uppercase tracking-[0.25em] text-lv-champagne'>LV Transport Platform</p><h1 className='mt-3 text-4xl font-semibold sm:text-6xl'>Calm Luxury Mobility, Realtime Intelligence</h1><p className='mt-4 max-w-3xl text-lv-mist'>Een emotioneel premium, realtime en verified ecosysteem voor executive mobiliteit met concierge-grade coordinatie en operationele rust.</p><div className='mt-6 flex flex-wrap gap-2'><button className='nav-btn' onClick={() => requireIdentity('booking', () => navigate('/booking', 'booking'))}>Reserveer nu</button><button className='nav-btn' onClick={() => requireIdentity('tracking', () => navigate('/tracking', 'tracking'))}>Volg uw rit</button></div></section>
apps/web/src/pages/home/HomeOriginal.tsx:        <h3 className='text-2xl font-semibold'>Concierge Booking Flow</h3><p className='mt-2 text-sm text-lv-mist'>Alle betekenisvolle acties verlopen via verified identity.</p>
apps/web/src/pages/home/HomeOriginal.tsx:      <section className='glass-panel rounded-3xl p-6'><h3 className='text-xl font-semibold'>Verified Ride Reviews</h3><p className='text-sm text-lv-mist'>Alle reviews zijn gekoppeld aan completed rides en verified identities.</p><ul className='mt-3 space-y-2'>{verifiedReviews.length ? verifiedReviews.map((review) => <li key={review} className='status-line status-line--active'>{review}</li>) : <li className='status-line'>Nog geen eligible verified reviews.</li>}</ul><Button variant='secondary' className='mt-3' onClick={() => requireIdentity('reviews', () => setTrackingResult('Verified review flow geactiveerd na completed ride lifecycle.'))}>Open review flow</Button></section>
apps/web/src/pages/home/HomeOriginal.tsx:      <section className='glass-panel rounded-3xl p-6'><h3 className='text-xl font-semibold'>LV Business Expansion</h3><p className='text-lv-mist text-sm'>U brengt operationele capaciteit. LVTP levert verified dispatch, realtime lifecycle controle en premium klanttoegang.</p><Button className='mt-3' onClick={() => requireIdentity('expansion', () => setTrackingResult('Expansion onboarding geopend voor verified operator intake.'))}>Start Expansion Onboarding</Button></section>
apps/web/src/pages/home/HomeOriginal.tsx:      {identity && <div className='identity-chip glass-panel'>Verified: {identity.name} • {identity.roleIntent} <button onClick={() => { localStorage.removeItem('lvtp_verified_identity'); setIdentity(null); }}>Afmelden</button></div>}
apps/web/src/pages/Booking.tsx:      setLifecycleState(result.booking.status === 'confirmed' ? 'assignment_pending' : 'request_received')
apps/web/src/pages/Booking.tsx:      setConfirmation(`Boeking bevestigd. Uw referentie: ${code}. Status: ${result.booking.status}.`)
apps/web-consolidated-grey/node_modules/typescript/lib/typescript.d.ts:                unverified?: boolean;
apps/web-consolidated-grey/node_modules/typescript/lib/typescript.d.ts:        unverified?: boolean;
apps/driver/node_modules/typescript/lib/typescript.d.ts:                unverified?: boolean;
apps/driver/node_modules/typescript/lib/typescript.d.ts:        unverified?: boolean;
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    | 'booking_status_updated';
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:        { type: 'booking_status_updated', actorId: 'system', occurredAt: now(), note: 'booking pending' },
apps/driver/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:      type: 'booking_status_updated',
apps/driver/src/architecture/notification.architecture.ts:  driverEvents: ['driver_assignment', 'booking_status_update', 'support_ticket_update', 'vip_business_update'],
apps/driver/src/app/App.tsx:    const nextStatus = transitionMap[booking.status];
apps/driver/src/app/App.tsx:    if (!nextStatus || !canTransitionLifecycle(booking.status, nextStatus)) return;
apps/driver/src/app/App.tsx:    if (isImmutableLifecycleStatus(booking.status)) return;
apps/driver/src/app/App.tsx:          <p className="text-sm text-zinc-300">Status: {booking.status}</p>
apps/driver/src/app/App.tsx:          {stepLabel[booking.status] && <button className="lvtp-btn-primary mt-3 w-full" onClick={() => updateStatus(booking)}>{stepLabel[booking.status]}</button>}
apps/driver/src/app/App.tsx:          {booking.status === 'completed' && <p className="mt-2 text-sm text-emerald-300">Rit correct afgerond.</p>}
apps/moni-core-service/node_modules/nats/lib/jetstream/types.d.ts:     * Set of constraints that when specified are verified by the server.
apps/api/node_modules/typescript/lib/typescript.d.ts:                unverified?: boolean;
apps/api/node_modules/typescript/lib/typescript.d.ts:        unverified?: boolean;
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    | 'booking_status_updated';
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:        { type: 'booking_status_updated', actorId: 'system', occurredAt: now(), note: 'booking pending' },
apps/api/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:      type: 'booking_status_updated',
apps/api/node_modules/@types/node/tls.d.ts:         * Returns the reason why the peer's certificate was not been verified. This
apps/api/node_modules/@types/node/tls.d.ts:         * and its integrity is verified; large fragments can span multiple roundtrips
apps/api/src/bookings/booking-engine.service.ts:    booking.status = action === 'accept' ? 'accepted' : 'rejected';
apps/api/src/bookings/notification-orchestrator.service.ts:      body: `Driver assigned for booking ${context.bookingId}.`,
apps/api/src/bookings/notification-orchestrator.service.ts:      type: 'booking_status_update',
apps/api/src/bookings/booking-notification-flow.service.ts:      bookingId: context.bookingId,
apps/api/src/bookings/booking-notification-flow.service.ts:      body: `Your ride is confirmed for booking ${context.bookingId}.`,
apps/api/src/bookings/booking-notification-flow.service.ts:      bookingId: context.bookingId,
apps/api/src/bookings/booking-notification-flow.service.ts:      type: 'booking_status_update',
apps/api/src/bookings/booking-notification-flow.service.ts:      body: `Booking ${context.bookingId} is now ${context.status}.`,
apps/api/src/bookings/booking-notification-flow.service.ts:      bookingId: context.bookingId,
apps/api/src/bookings/booking-notification-flow.service.ts:      bookingId: context.bookingId,
apps/api/src/bookings/booking-notification-flow.service.ts:      body: `Booking ${context.bookingId} requires dispatch review.`,
apps/api/src/bookings/booking-notification-flow.service.ts:      data: { bookingStatus: context.status, dedupeKey: `${context.bookingId}:admin_alert` },
apps/api/src/bookings/booking-notification-flow.service.ts:    notificationService.archiveOperationalAlertsForBooking(context.bookingId);
apps/api/src/bookings/booking-notification-flow.service.ts:      bookingId: context.bookingId,
apps/api/src/bookings/booking-notification-flow.service.ts:      type: 'booking_status_update',
apps/api/src/bookings/booking-notification-flow.service.ts:      body: `Ride ${context.bookingId} is completed. Thank you for riding with LV Transport.`,
apps/api/src/bookings/booking.service.ts:    if (!canTransitionBookingStatus(booking.status, nextStatus)) throw new Error(`Invalid transition ${booking.status} -> ${nextStatus}`);
apps/api/src/bookings/booking.service.ts:    booking.status = nextStatus;
apps/api/src/bookings/booking.service.ts:  booking_status_update: 'Booking {{bookingId}} is now {{status}}.',
apps/api/src/bookings/booking.service.ts:  booking_status_update: 'Booking {{bookingId}} updated to {{status}}',
apps/api/src/bookings/booking.service.ts:        eventType: 'booking.status.updated',
apps/api/src/bookings/booking.service.ts:      template: 'booking_status_update',
apps/api/src/bookings/booking.service.ts:      body: this.renderTemplate(whatsappTemplates.booking_status_update, payload),
apps/api/src/bookings/booking.events.ts:export type BookingEventName = (typeof BOOKING_EVENTS)[keyof typeof BOOKING_EVENTS] | 'booking.status.updated';
apps/api/src/controllers/booking.controller.ts:        status: booking.status,
apps/api/src/notifications/notification.service.ts:  message.type === 'booking_status_update' && message.data?.bookingStatus === 'completed';
apps/api/src/notifications/notification.types.ts:  | 'booking.status.updated'
apps/api/src/notifications/notification.types.ts:  template: 'booking_confirmation' | 'booking_status_update' | 'driver_assigned' | 'admin_new_booking_alert';
apps/api/src/notifications/notification.types.ts:  | 'booking_status_update'
apps/api/src/runtime/restore-validation.service.ts:      checks.push({ id: 'restore.lineage-validation', status: lineageValid ? 'pass' : 'fail', message: lineageValid ? 'Restore lineage marker verified.' : 'Restore lineage marker missing.', details: { manifest: path.join(latestSnapshot, 'manifest.txt') } });
apps/api/src/modules/interim-operations/enums/interim-operations.enums.ts:  VERIFIED_READY = 'verified_ready',
apps/api/src/modules/bookings/service.ts:    booking.status = nextState;
apps/api/src/services/lvtp-failure-recovery.simulation.test.ts:  paymentDelay: 'Your payment is being verified securely. Your booking details are preserved while we complete this step.',
apps/api/src/services/lvtp-failure-recovery.simulation.test.ts:  driverReject: 'Your ride remains active. We are assigning another verified driver and will keep your pickup coordinated.'
apps/api/src/services/lvtp-failure-recovery.simulation.test.ts:    const pendingSafe = booking.status === 'pending' && booking.paymentStatus === 'pending';
apps/api/src/services/lvtp-failure-recovery.simulation.test.ts:    realtimeOrchestratorService.upsertExternalBooking({ id: booking.id, referenceCode: booking.code, pickup: booking.pickup, destination: booking.destination, serviceType: 'airport', scheduledAt: updatedAt, customerName: booking.customerName, status: booking.status });
apps/api/src/services/operational-analytics.service.ts:      status: booking.status,
apps/api/src/services/operational-analytics.service.ts:      assignedAt: booking.status === 'assigned' ? booking.updatedAt : undefined
apps/api/src/services/operational-analytics.service.ts:      status: booking.status,
apps/api/src/services/operational-analytics.service.ts:    if (!current.assignedAt && booking.status === 'assigned') current.assignedAt = booking.updatedAt;
apps/api/src/services/operational-analytics.service.ts:    if (current.assignedAt && (booking.status === 'en_route' || booking.status === 'cancelled') && previousStatus === 'assigned') {
apps/api/src/services/operational-analytics.service.ts:      if (booking.status === 'en_route') this.assignmentAccepts += 1;
apps/api/src/services/operational-analytics.service.ts:      if (booking.status === 'cancelled') this.assignmentRejects += 1;
apps/api/src/services/operational-analytics.service.ts:    current.status = booking.status;
apps/api/src/services/operational-analytics.service.ts:    if (booking.status === 'completed') {
apps/api/src/services/operational-analytics.service.ts:      byStatus[booking.status] += 1;
apps/api/src/services/operational-analytics.service.ts:      if (booking.status === 'completed') {
apps/api/src/services/operational-analytics.service.ts:        if (booking.status === 'completed') businessCompletedRides += 1;
apps/api/src/services/final-ecosystem-scorecard.service.ts:      { key: 'payment_trust', label: 'Payment trust', score: clamp((pct(readiness.payments.filter((p) => p.state === 'ready').length, readiness.payments.length) * 0.7) + (completion * 0.3)), rationale: 'Payment trust combines provider readiness with verified completed rides.' },
apps/api/src/services/realtime-orchestrator.service.ts:  const nextState = stateByBookingStatus[booking.status];
apps/api/src/services/realtime-orchestrator.service.ts:  const previousStatus = booking.status;
apps/api/src/services/realtime-orchestrator.service.ts:  booking.status = nextStatus;
apps/api/src/services/realtime-orchestrator.service.ts:    appendLifecycleEvent(booking, { type: 'snapshot', status: booking.status, actor: 'system', at: now, note: 'Hydrated from booking flow service', metadata: { source: 'booking_flow_hydration' } });
apps/api/src/services/realtime-orchestrator.service.ts:      const canonicalStatus = toCanonicalBookingStatus(booking.status);
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'duplicate_event', status: booking.status, actor: 'admin', at: new Date().toISOString(), note: 'Duplicate assignment prevented by idempotency key', metadata: { idempotencyKey: params.idempotencyKey } });
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'duplicate_event', status: booking.status, actor: 'admin', at: new Date().toISOString(), note: 'Duplicate assignment prevented for same driver', metadata: { driverId: params.driverId } });
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'assignment_attempt', status: booking.status, actor: 'admin', at: new Date().toISOString(), note: 'Assignment attempt throttled', metadata: { driverId: params.driverId, attemptKey, lastAttemptAt } });
apps/api/src/services/realtime-orchestrator.service.ts:        reportLifecycleAnomaly(booking, booking.status, 'assigned');
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'invalid_transition', status: booking.status, actor: 'admin', at: new Date().toISOString(), note: 'Invalid assignment transition blocked', metadata: { requestedStatus: 'assigned', driverId: params.driverId } });
apps/api/src/services/realtime-orchestrator.service.ts:      booking.status = 'assigned'; booking.version += 1; booking.updatedAt = now;
apps/api/src/services/realtime-orchestrator.service.ts:      emit('booking.updated', booking); emit('driver.assigned', booking); emit('driver.status.updated', driverStates.get(params.driverId)); emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: now });
apps/api/src/services/realtime-orchestrator.service.ts:    if (TERMINAL_BOOKING_STATUSES.has(booking.status)) throw new Error('TERMINAL_STATE_IMMUTABLE');
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'duplicate_event', status: booking.status, actor: 'driver', at: new Date().toISOString(), note: 'Duplicate driver assignment response suppressed by idempotency key', metadata: { idempotencyKey: params.idempotencyKey, action: params.action } });
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'sync_diagnostic', status: booking.status, actor: 'driver', at: new Date().toISOString(), note: 'Driver assignment response rejected due to version mismatch', metadata: { expectedVersion: params.expectedVersion, currentVersion: booking.version, action: params.action } });
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'sync_diagnostic', status: booking.status, actor: 'driver', at: new Date().toISOString(), note: 'Out-of-order driver assignment response rejected', metadata: { eventAt: params.eventAt, bookingUpdatedAt: booking.updatedAt, action: params.action } });
apps/api/src/services/realtime-orchestrator.service.ts:    const previousStatus = booking.status;
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'invalid_transition', status: booking.status, actor: 'driver', at: now, note: 'Driver rejection blocked due to immutable lifecycle state', metadata: { requestedStatus: 'cancelled' } });
apps/api/src/services/realtime-orchestrator.service.ts:      booking.status = 'cancelled'; booking.version += 1; booking.updatedAt = now; appendLifecycleEvent(booking, { type: 'transition', status: 'cancelled', previousStatus, actor: 'driver', at: now, note: 'Driver rejected assignment' });
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'invalid_transition', status: booking.status, actor: 'driver', at: now, note: 'Driver acceptance blocked due to invalid lifecycle state', metadata: { requestedStatus: 'accepted' } });
apps/api/src/services/realtime-orchestrator.service.ts:      booking.status = 'accepted'; booking.version += 1; booking.updatedAt = now; appendLifecycleEvent(booking, { type: 'transition', status: 'accepted', previousStatus, actor: 'driver', at: now, note: 'Driver accepted assignment' });
apps/api/src/services/realtime-orchestrator.service.ts:    emit('booking.updated', booking); emit('booking.lifecycle.changed', booking); emit('admin.live.updated', { bookingId: booking.id, driverId: params.driverId, status: booking.status, at: now });
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'duplicate_event', status: booking.status, actor, at: new Date().toISOString(), note: 'Duplicate transition suppressed by idempotency key', metadata: { idempotencyKey: params.idempotencyKey, requestedStatus: nextStatus } });
apps/api/src/services/realtime-orchestrator.service.ts:      operationalObservabilityService.trackLifecycleMutation({ bookingId: booking.id, actor, from: booking.status, to: nextStatus, version: booking.version, result: 'duplicate', reason: 'idempotency_key' });
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'sync_diagnostic', status: booking.status, actor, at: new Date().toISOString(), note: 'Version mismatch transition rejected', metadata: { expectedVersion: params.expectedVersion, currentVersion: booking.version, requestedStatus: nextStatus } });
apps/api/src/services/realtime-orchestrator.service.ts:      operationalObservabilityService.trackLifecycleMutation({ bookingId: booking.id, actor, from: booking.status, to: nextStatus, version: booking.version, result: 'stale', reason: 'version_mismatch' });
apps/api/src/services/realtime-orchestrator.service.ts:        appendLifecycleEvent(booking, { type: 'sync_diagnostic', status: booking.status, actor, at: new Date().toISOString(), note: 'Out-of-order lifecycle event rejected', metadata: { eventAt: params.eventAt, bookingUpdatedAt: booking.updatedAt, requestedStatus: nextStatus } });
apps/api/src/services/realtime-orchestrator.service.ts:    if (TERMINAL_BOOKING_STATUSES.has(booking.status)) {
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'invalid_transition', status: booking.status, actor, at: new Date().toISOString(), note: 'Mutation against terminal lifecycle state blocked', metadata: { requestedStatus: nextStatus } });
apps/api/src/services/realtime-orchestrator.service.ts:      operationalObservabilityService.trackLifecycleMutation({ bookingId: booking.id, actor, from: booking.status, to: nextStatus, version: booking.version, result: 'rejected', reason: 'terminal_state_immutable' });
apps/api/src/services/realtime-orchestrator.service.ts:    if (booking.status === nextStatus) {
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'duplicate_event', status: booking.status, actor, at: new Date().toISOString(), note: 'No-op transition ignored', metadata: { requestedStatus: nextStatus } });
apps/api/src/services/realtime-orchestrator.service.ts:    if (!allowedTransitions[booking.status].has(nextStatus)) {
apps/api/src/services/realtime-orchestrator.service.ts:      appendLifecycleEvent(booking, { type: 'invalid_transition', status: booking.status, actor, at: new Date().toISOString(), note: 'Invalid lifecycle transition blocked', metadata: { requestedStatus: nextStatus } });
apps/api/src/services/realtime-orchestrator.service.ts:      operationalObservabilityService.trackLifecycleMutation({ bookingId: booking.id, actor, from: booking.status, to: nextStatus, version: booking.version, result: 'rejected', reason: 'invalid_transition' });
apps/api/src/services/realtime-orchestrator.service.ts:    const previousStatus = booking.status;
apps/api/src/services/realtime-orchestrator.service.ts:    booking.status = nextStatus; booking.version += 1; booking.updatedAt = now; appendLifecycleEvent(booking, { type: 'transition', status: nextStatus, previousStatus, actor, at: now, metadata: { requestedStatus: params.status } });
apps/api/src/services/realtime-orchestrator.service.ts:    emit('booking.updated', booking); emit('booking.lifecycle.changed', booking); emit('admin.live.updated', { bookingId: booking.id, status: booking.status, at: now });
apps/api/src/services/realtime-orchestrator.service.ts:      if (booking.status !== 'assigned' || !booking.assignmentExpiresAt) continue;
apps/api/src/services/realtime-orchestrator.service.ts:      booking.status = 'failed'; booking.version += 1; booking.updatedAt = new Date().toISOString();
apps/api/src/services/realtime-orchestrator.service.ts:      emit('admin.live.updated', { bookingId: booking.id, status: booking.status, at: booking.updatedAt });
apps/api/src/services/realtime-orchestrator.service.ts:    const recovered = Array.from(bookings.values()).filter((booking) => booking.assignedDriverId === driverId && ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status)));
apps/api/src/services/realtime-orchestrator.service.ts:      if (booking) appendLifecycleEvent(booking, { type: 'sync_diagnostic', status: booking.status, actor: 'system', at: now, note: 'Suppressed duplicate realtime coordinate', metadata: { driverId: params.driverId, lat: params.lat, lng: params.lng } });
apps/api/src/services/realtime-orchestrator.service.ts:      if (booking.status === 'in_progress') {
apps/api/src/services/realtime-orchestrator.service.ts:      if (booking.status === 'completed') {
apps/api/src/services/realtime-orchestrator.service.ts:      if (['pending', 'assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))) restoredBookings.push(booking.id);
apps/api/src/services/realtime-orchestrator.service.ts:    const staleAssignments = Array.from(bookings.values()).filter((booking) => booking.status === 'assigned' && booking.assignmentExpiresAt && new Date(booking.assignmentExpiresAt).getTime() <= Date.now());
apps/api/src/services/realtime-orchestrator.service.ts:      .filter((booking) => !['completed', 'cancelled', 'failed'].includes(booking.status) && now - new Date(booking.updatedAt).getTime() > 15 * 60_000)
apps/api/src/services/realtime-orchestrator.service.ts:      .map((booking) => ({ bookingId: booking.id, status: booking.status, updatedAt: booking.updatedAt }));
apps/api/src/services/realtime-orchestrator.service.ts:      activeAssignments: Array.from(bookings.values()).filter((booking) => ['assigned', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))).length
apps/api/src/services/realtime-orchestrator.service.ts:      activeRideCount: Array.from(bookings.values()).filter((booking) => ['assigned', 'en_route', 'arrived', 'in_progress'].includes(toCanonicalBookingStatus(booking.status))).length,
apps/business/node_modules/typescript/lib/typescript.d.ts:                unverified?: boolean;
apps/business/node_modules/typescript/lib/typescript.d.ts:        unverified?: boolean;
apps/admin/node_modules/typescript/lib/typescript.d.ts:                unverified?: boolean;
apps/admin/node_modules/typescript/lib/typescript.d.ts:        unverified?: boolean;
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:    | 'booking_status_updated';
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:        { type: 'booking_status_updated', actorId: 'system', occurredAt: now(), note: 'booking pending' },
apps/admin/node_modules/@lvtransport/realtime/src/dispatch/mvp.ts:      type: 'booking_status_updated',
apps/admin/src/app/App.tsx:              <p>{booking.bookingId} • {booking.customerId} • Driver: {booking.driverId ?? 'unassigned'} • <Status status={booking.status} /></p>
apps/admin/src/app/App.tsx:    const stalled = input.bookings.filter((booking) => ['arrived', 'failed'].includes(booking.status)).length;
apps/admin/src/app/App.tsx:  const pendingRides = useMemo(() => bookings.filter((booking) => ['pending', 'searching_driver', 'quote_pending'].includes(booking.status)).length, [bookings]);
apps/admin/src/app/App.tsx:  const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)).length, [bookings]);
packages/moni-assistent/src/notifications.ts:  status: booking.status,
packages/moni-assistent/src/notifications.ts:  status: booking.status,
packages/moni-assistent/src/bookingIntegration.ts:    fallback: "I can only continue with verified booking data. Please share the missing details.",
packages/moni-assistent/src/bookingIntegration.ts:        metadata: { bookingStatus: booking.status, referenceCode: booking.referenceCode ?? null },
packages/moni-assistent/src/bookingFlow.ts:    booking.status = "issue";
packages/moni-assistent/src/bookingFlow.ts:  booking.status = "validated";
packages/moni-assistent/src/bookingFlow.ts:    booking.status = "priced";
packages/moni-assistent/src/bookingFlow.ts:    booking.status = "issue";
packages/moni-assistent/src/bookingFlow.ts:    booking.status = "issue";
packages/moni-assistent/src/bookingFlow.ts:  booking.status = "assigned";
packages/moni-assistent/src/statusFlow.ts:  const allowedStatuses = statusTransitions[booking.status];
packages/moni-assistent/src/statusFlow.ts:    booking.status = "issue";
packages/moni-assistent/src/statusFlow.ts:    booking.issueMessage = `Invalid status transition: ${booking.status} -> ${nextStatus}`;
packages/moni-assistent/src/statusFlow.ts:  booking.status = nextStatus;
packages/realtime/src/dispatch/mvp.ts:    | 'booking_status_updated';
packages/realtime/src/dispatch/mvp.ts:        { type: 'booking_status_updated', actorId: 'system', occurredAt: now(), note: 'booking pending' },
packages/realtime/src/dispatch/mvp.ts:      type: 'booking_status_updated',
