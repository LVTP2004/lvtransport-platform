# ATLAS AUDITOR LAYER V1

Generated: 2026-06-04T12:26:15+02:00
Mode: READ_ONLY
Purpose: map canonical, legacy, duplicate, conflict and risk zones.

## Git
implementation/moni-repair-orchestrator-v1
 M apps/admin/src/app/App.js
 M apps/admin/tsconfig.tsbuildinfo
 M apps/api/package.json
 M apps/api/src/auth/middleware/authenticate.ts
 M apps/api/src/auth/middleware/authorize.ts
 M apps/api/src/auth/services/access-control.service.ts
 M apps/api/src/bookings/booking.service.ts
 M apps/api/src/modules/payments/interfaces/payment.interfaces.ts
 M apps/api/src/modules/payments/services/payment-architecture.service.ts
 M apps/api/src/modules/persistence/in-memory-empty.repository.ts
 M apps/api/src/modules/persistence/sqlite.repositories.ts
 M apps/api/src/notifications/notification.types.ts
 M apps/api/src/persistence/repository-contracts.ts
 M apps/api/src/routes/v1/persistence.routes.ts
 M apps/api/src/server.ts
 M apps/api/src/tracking/tracking.service.ts
 M docs/moni/MONI_REPAIR_ORCHESTRATOR_V1.md
 M moni-core/founder/live/moni-repair-queue.json
 M packages/auth/src/index.ts
 M packages/realtime/src/bookings/lifecycle.ts
 M packages/realtime/src/models/realtime.ts
 M pnpm-lock.yaml
?? apps/api/src/bookings/booking.service.ts.bak.20260603-191723
?? apps/api/src/bookings/booking.service.ts.bak.p1-20260603-194925
?? apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z
?? apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925
?? apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300
?? apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713
?? apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802
?? apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-085252
?? apps/api/src/modules/persistence/in-memory-empty.repository.ts.bak.20260602-113755
?? apps/api/src/modules/persistence/in-memory-empty.repository.ts.bak.20260602-120051
?? apps/api/src/modules/persistence/in-memory-empty.repository.ts.bak.20260602-183457
?? apps/api/src/modules/persistence/sqlite.repositories.ts.bak.20260602-183927
?? apps/api/src/operational-memory/cli.ts.bak.20260602-205451
?? apps/api/src/persistence/repository-contracts.ts.bak.20260603-191723
?? apps/api/src/routes/v1/persistence.routes.ts.bak.20260602-120051
?? apps/api/src/websocket/socket.server.ts.bak.forge-v12-2026-06-03T22-01-28-756Z
?? docs/architecture/bootstrap/MONI_API_STABILIZATION_SEQUENCE_V1.md
?? docs/architecture/bootstrap/MONI_AUTONOMOUS_REPAIR_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_AUTOPILOT_SAFE_V1.md
?? docs/architecture/bootstrap/MONI_BOTTLENECK_SURGICAL_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_COGNITIVE_DIRECTOR_V2.md
?? docs/architecture/bootstrap/MONI_CONTRACT_RECONCILIATION_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_DECISION_PATTERN_ENGINE_V1.md
?? docs/architecture/bootstrap/MONI_ERROR_CLASSIFIER_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_EXECUTION_MENTOR_V1.md
?? docs/architecture/bootstrap/MONI_FIXER_PROMOTION_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_FIXER_REGISTRY_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_FIX_STRATEGY_POLICY_V1.md
?? docs/architecture/bootstrap/MONI_LIVE_QUEUE_V3.md
?? docs/architecture/bootstrap/MONI_OBSTACLE_ENGINE_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_SAFE_CYCLE_V2.md
?? docs/architecture/bootstrap/MONI_SURGICAL_LOOP_REPORT_V1.md
?? docs/architecture/bootstrap/MONI_V2_OBSERVER_MENTOR_OPERATOR.md
?? docs/architecture/bootstrap/MONI_WORK_QUEUE_V1.md
?? docs/architecture/bootstrap/PAYMENT_SERVICE_ADAPTER_FIX_V1.md
?? docs/architecture/bootstrap/PAYMENT_SERVICE_ADAPTER_PLAN_V1.md
?? docs/founder/MONI_APPROVAL_AUTOMATION_V1.md
?? docs/moni/MONI_EXECUTIVE_CONTROLLER_V2.md
?? forge/forge-risk-policy-v1.json
?? moni-core/engines/
?? moni-core/fixers/
?? moni-core/founder/live/decision-pattern-brief.md
?? moni-core/founder/live/execution-mentor-brief.md
?? moni-core/founder/live/execution-mentor-state.json
?? moni-core/founder/live/forge-risk-report.json
?? moni-core/founder/live/moni-v2-brief.md
?? moni-core/organization/
?? moni-core/policies/fix-strategy-policy-v1.json
?? moni-core/queue/moni-work-queue.mjs
?? moni-core/runtime/autonomous/watchdog/
?? moni-core/v2/
?? packages/realtime/src/bookings/lifecycle.ts.bak.20260601212917
?? packages/realtime/src/models/realtime.ts.bak.20260601212917
?? runtime/atlas-auditor/
?? runtime/atlas/
?? runtime/autopilot/
?? runtime/build/booking-legacy-usage.txt
?? runtime/build/booking-record-inventory.txt
?? runtime/build/moni-bottleneck-now.txt
?? runtime/build/sqlite.repositories.before-root-fix.ts
?? runtime/decisions/
?? runtime/fixes/
?? runtime/moni-v2/
?? runtime/moni/
?? runtime/queue/
?? scripts/forge/forge-risk-scan.sh
?? scripts/moni-api-stabilization-sequence.sh
?? scripts/moni-autonomous-repair.sh
?? scripts/moni-autopilot-safe.sh
?? scripts/moni-bottleneck-surgical.sh
?? scripts/moni-cognitive-director-v2.sh
?? scripts/moni-contract-reconciliation.sh
?? scripts/moni-decision-pattern.sh
?? scripts/moni-engine-suite.sh
?? scripts/moni-error-classifier.sh
?? scripts/moni-fix-payment-service-adapters.sh
?? scripts/moni-fixer-promotion.sh
?? scripts/moni-fixer-registry.sh
?? scripts/moni-live-queue.sh
?? scripts/moni-mentor.sh
?? scripts/moni-next-fix.sh
?? scripts/moni-obstacle-engine.sh
?? scripts/moni-organization-engine.sh
?? scripts/moni-payment-adapter-plan.sh
?? scripts/moni-safe-cycle-v2.sh
?? scripts/moni-surgical-loop.sh
?? scripts/moni-system-scan.sh
?? scripts/moni-v2.sh
?? scripts/moni-work-queue.sh

## Build Errors
src/bookings/booking.service.ts(36,7): error TS2353: Object literal may only specify known properties, and 'customerId' does not exist in type 'LegacyBookingRecord'.
src/dispatch/dispatch.service.ts(2,10): error TS2305: Module '"../bookings/bookings.service.js"' has no exported member 'bookingsService'.
src/modules/payments/payment.routes.ts(14,96): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
src/modules/payments/services/payment-architecture.service.ts(44,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: "authorization"; status: PaymentSessionStatus.CREATED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.
src/modules/payments/services/payment-architecture.service.ts(72,29): error TS2345: Argument of type '{ id: string; paymentSessionId: string; bookingId: string; type: "capture"; status: PaymentSessionStatus.CAPTURED; amount: MoneyAmount; createdAt: string; }' is not assignable to parameter of type 'TransactionHistoryEntry'.
src/modules/payments/services/payment-architecture.service.ts(96,11): error TS2741: Property 'requestedBy' is missing in type '{ id: string; transactionId: string; reason: "duplicate" | "customer_request" | "fraud_suspected" | "service_issue"; state: RefundState.REQUESTED; amount: { currency: string; valueMinor: number; }; }' but required in type 'RefundRecord'.
src/modules/payments/services/payment-architecture.service.ts(121,21): error TS2304: Cannot find name 'PaymentProvider'.
src/websocket/socket.server.ts(107,33): error TS2339: Property 'shutdown' does not exist on type '{ initialize(): void; registerClient(socket: WebSocket): void; createBooking(input: { customerName?: string | undefined; pickup: string; destination: string; serviceType?: "standard" | ... 2 more ... | undefined; scheduledAt?: string | undefined; paymentStatus?: "pending" | ... 4 more ... | undefined; }): BookingRec...'.

## Error Codes
      3 TS2345
      1 TS2741
      1 TS2353
      1 TS2339
      1 TS2305
      1 TS2304

## booking-refs
Refs: 133
apps/api/src/bookings/booking.service.ts:17:type LegacyBookingRecord = BookingRecord & {
apps/api/src/bookings/booking.service.ts:33:    const booking: LegacyBookingRecord = {
apps/api/src/bookings/booking.service.ts:3:import type { BookingLifecycleStatus, BookingRecord, BookingTimelineEntry } from '@lvtransport/realtime';
apps/api/src/bookings/booking.service.ts:9:const bookingStore = new Map<string, LegacyBookingRecord>();
apps/api/src/bookings/booking.service.ts.bak.20260603-191723:25:    const booking: BookingRecord = {
apps/api/src/bookings/booking.service.ts.bak.20260603-191723:3:import type { BookingLifecycleStatus, BookingRecord } from '@lvtransport/realtime';
apps/api/src/bookings/booking.service.ts.bak.20260603-191723:9:const bookingStore = new Map<string, BookingRecord>();
apps/api/src/bookings/booking.service.ts.bak.p1-20260603-194925:25:    const booking: BookingRecord = {
apps/api/src/bookings/booking.service.ts.bak.p1-20260603-194925:3:import type { BookingLifecycleStatus, BookingRecord } from '@lvtransport/realtime';
apps/api/src/bookings/booking.service.ts.bak.p1-20260603-194925:9:const bookingStore = new Map<string, BookingRecord>();
apps/api/src/bookings/bookings.service.ts:3:import type { BookingRecord, BookingTimelineEntry } from '@lvtransport/realtime';
apps/api/src/bookings/bookings.service.ts:5:export const emitBookingEvent = (booking: BookingRecord, timelineEntry: BookingTimelineEntry): void => {
apps/api/src/dispatch/dispatch.service.ts:21:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts:34:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts:7:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:21:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:34:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:7:    bookingsService.publishBookingState({
apps/api/src/modules/airport-intelligence/service.ts:2:import type { AirportCoordinationInput, AirportIntelligenceState, BookingRecord, FlightOperationalStatus, LVMessage } from '../bookings/dto.js';
apps/api/src/modules/airport-intelligence/service.ts:30:  applyFlightSignal(booking: BookingRecord, signal: { delayMin?: number; terminal?: string; cancelled?: boolean; source?: string }): LVMessage[] {
apps/api/src/modules/bookings/dto.ts:31:export interface CreateBookingDto {
apps/api/src/modules/bookings/dto.ts:82:export interface BookingRecord extends CreateBookingDto {
apps/api/src/modules/bookings/moni-assistant.adapter.ts:14:  async createBookingFromAssistant(payload: MoniBookingCreatePayload, idempotencyKey: string): Promise<BookingRecord> {
apps/api/src/modules/bookings/moni-assistant.adapter.ts:15:    const dto: CreateBookingDto = {
apps/api/src/modules/bookings/moni-assistant.adapter.ts:2:import type { BookingRecord, CreateBookingDto } from './dto.js';
apps/api/src/modules/bookings/repository.ts:10:  findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts:11:  list(): Promise<BookingRecord[]>;
apps/api/src/modules/bookings/repository.ts:15:  bookings: BookingRecord[];
apps/api/src/modules/bookings/repository.ts:3:import type { BookingRecord } from './dto.js';
apps/api/src/modules/bookings/repository.ts:48:  async getById(id: string): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts:53:  async create(record: BookingRecord): Promise<BookingRecord> {
apps/api/src/modules/bookings/repository.ts:6:  getById(id: string): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts:70:  async update(record: BookingRecord): Promise<BookingRecord> {
apps/api/src/modules/bookings/repository.ts:79:  async findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts:7:  create(record: BookingRecord): Promise<BookingRecord>;
apps/api/src/modules/bookings/repository.ts:86:  async list(): Promise<BookingRecord[]> {
apps/api/src/modules/bookings/repository.ts:8:  update(record: BookingRecord): Promise<BookingRecord>;
apps/api/src/modules/bookings/repository.ts:91:  async findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts:9:  findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:10:  list(): Promise<BookingRecord[]>;
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:14:  bookings: BookingRecord[];
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:3:import type { BookingRecord } from './dto.js';
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:47:  async create(record: BookingRecord): Promise<BookingRecord> {
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:64:  async update(record: BookingRecord): Promise<BookingRecord> {
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:6:  create(record: BookingRecord): Promise<BookingRecord>;
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:73:  async findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:7:  update(record: BookingRecord): Promise<BookingRecord>;
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:80:  async list(): Promise<BookingRecord[]> {
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:85:  async findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:8:  findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts.bak.p1-20260603-194925:9:  findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:10:  findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:11:  list(): Promise<BookingRecord[]>;
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:15:  bookings: BookingRecord[];
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:3:import type { BookingRecord } from './dto.js';
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:48:  async create(record: BookingRecord): Promise<BookingRecord> {
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:65:  async update(record: BookingRecord): Promise<BookingRecord> {
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:6:  getById(id: string): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:74:  async findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:7:  create(record: BookingRecord): Promise<BookingRecord>;
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:81:  async list(): Promise<BookingRecord[]> {
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:86:  async findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null> {
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:8:  update(record: BookingRecord): Promise<BookingRecord>;
apps/api/src/modules/bookings/repository.ts.bak.safe-autopatch-20260603-203300:9:  findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null>;
apps/api/src/modules/bookings/service.ts:106:    airportIntel?: BookingRecord['airportIntel'];
apps/api/src/modules/bookings/service.ts:107:    airportIntelligence?: BookingRecord['airportIntelligence'];
apps/api/src/modules/bookings/service.ts:108:    generatedLVMessages: BookingRecord['lvMessenger']['messages'];
apps/api/src/modules/bookings/service.ts:132:  ): Promise<BookingRecord> {
apps/api/src/modules/bookings/service.ts:23:  async createBooking(input: CreateBookingDto, idempotencyKey: string): Promise<BookingRecord> {
apps/api/src/modules/bookings/service.ts:24:    const hydrateRealtimeLifecycle = (booking: BookingRecord) => {
apps/api/src/modules/bookings/service.ts:2:import type { BookingRecord, CreateBookingDto } from './dto.js';
apps/api/src/modules/bookings/service.ts:53:    const booking: BookingRecord = {
apps/api/src/modules/bookings/service.ts:99:  async listBookings(): Promise<BookingRecord[]> {
apps/api/src/modules/bookings/validation.ts:1:import type { CreateBookingDto, ServiceType } from './dto.js';
apps/api/src/modules/bookings/validation.ts:5:export const validateCreateBookingPayload = (payload: unknown): CreateBookingDto => {
apps/api/src/modules/bookings/validation.ts:7:  const candidate = payload as Partial<CreateBookingDto> & { scheduledAt?: string };
apps/api/src/modules/lv-messenger/service.ts:21:  append(booking: BookingRecord, message: LVMessage): void {
apps/api/src/modules/lv-messenger/service.ts:26:  appendBatch(booking: BookingRecord, messages: LVMessage[]): void {
apps/api/src/modules/lv-messenger/service.ts:2:import type { BookingRecord, LVMessage } from '../bookings/dto.js';
apps/api/src/services/booking.service.ts:30:export const bookingService = {

## dispatch-refs
Refs: 228
apps/admin/src/app/App.js:18:    import { dispatchMvpStore, getDispatchSnapshot, type DispatchBookingStatus } from '@lvtransport/realtime';
apps/admin/src/app/App.js:21:        const [state, setState] = useState(getDispatchSnapshot());
apps/admin/src/app/App.js:25:        useEffect(() => dispatchMvpStore.subscribe(setState), []);
apps/admin/src/app/App.js:26:        const assign = () => dispatchMvpStore.assignDriver(bookingId, customerId, driverId, 'admin-control');
apps/admin/src/app/App.js:33:        return (_jsxs("main", { className: "min-h-screen bg-zinc-900 p-6 text-zinc-100", children: [_jsx("h1", { className: "text-2xl font-bold text-amber-300", children: "Dispatch Control Tower (MVP)" }), _jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-4", children: Object.entries(counts).map(([k, v]) => _jsxs("div", { className: "rounded-xl border border-zinc-700 p-3", children: [k, ": ", v] }, k)) }), _jsxs("section", { className: "mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4", children: [_jsx("h2", { className: "font-semibold text-amber-200", children: "Assign Booking" }), _jsxs("div", { className: "mt-3 grid gap-2 md:grid-cols-4", children: [_jsx("input", { className: "rounded bg-zinc-800 p-2", value: bookingId, onChange: (e) => setBookingId(e.target.value) }), _jsx("input", { className: "rounded bg-zinc-800 p-2", value: customerId, onChange: (e) => setCustomerId(e.target.value) }), _jsx("select", { className: "rounded bg-zinc-800 p-2", value: driverId, onChange: (e) => setDriverId(e.target.value), children: DRIVERS.map((d) => _jsx("option", { children: d }, d)) }), _jsx("button", { className: "rounded bg-amber-500 px-3 py-2 font-semibold text-zinc-900", onClick: assign, children: "Assign" })] })] }), _jsxs("section", { className: "mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4", children: [_jsx("h2", { className: "font-semibold text-amber-200", children: "Assignment History / Driver Response" }), _jsx("div", { className: "mt-3 space-y-3", children: state.bookings.map((booking) => (_jsxs("article", { className: "rounded border border-zinc-700 p-3", children: [_jsxs("p", { children: [booking.bookingId, " \u2022 ", booking.customerId, " \u2022 Driver: ", booking.driverId ?? 'unassigned', " \u2022 ", _jsx(Status, { status: booking.status })] }), _jsx("ul", { className: "mt-2 list-disc pl-5 text-xs text-zinc-300", children: booking.history.map((h, i) => _jsxs("li", { children: [h.occurredAt, " \u2014 ", h.type, " (", h.actorId, ") ", h.note ?? ''] }, `${h.occurredAt}-${i}`)) })] }, booking.bookingId))) })] })] }));
apps/admin/src/app/App.js:37:            { label: 'Dispatch', icon: '⌖' },
apps/admin/src/app/App.js:57:                                            : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`, children: [_jsx("span", { className: "w-4 text-center", children: icon }), " ", label] }, label))) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Operations Center" }), _jsx("p", { className: "text-lg font-medium text-white", children: "Regional Dispatch & Service Health" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { className: "rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm transition hover:border-amber-300 hover:text-amber-200", children: "Today" }), _jsx("button", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-2 transition hover:border-amber-300 hover:text-amber-200", children: _jsx("span", { children: "\uD83D\uDD14" }) })] })] }), _jsxs("div", { className: "space-y-5 p-5", children: [_jsxs("section", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { title: "Revenue Today", value: "$84,290", trend: "+6.4% vs yesterday", tone: "gold" }), _jsx(MetricCard, { title: "Active Rides", value: "148", trend: "12 nearing destination", tone: "emerald" }), _jsx(MetricCard, { title: "Driver Utilization", value: "91%", trend: "Across 3 operating zones", tone: "blue" }), _jsx(MetricCard, { title: "Critical Alerts", value: "3", trend: "2 requires dispatch intervention", tone: "rose" })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("div", { className: "space-y-5 xl:col-span-2", children: [_jsx(Panel, { title: "Booking Management", icon: _jsx("span", { children: "\u25C8" }), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[620px] text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-[0.16em] text-zinc-400", children: _jsx("tr", { children: ['ID', 'Service', 'Status', 'Driver', 'ETA', 'Payment'].map((h) => (_jsx("th", { className: "px-2 py-2", children: h }, h))) }) }), _jsx("tbody", { children: bookings.map((row) => (_jsx("tr", { className: "border-t border-zinc-800 text-zinc-200 transition hover:bg-zinc-900/70", children: row.map((cell) => (_jsx("td", { className: "px-2 py-3", children: cell }, cell))) }, row[0]))) })] }) }) }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsx(Panel, { title: "Active Rides", icon: _jsx("span", { children: "\u25C9" }), children: _jsxs("ul", { className: "space-y-3 text-sm text-zinc-300", children: [_jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8821 \u2022 Downtown to Terminal 1 \u2022 14 min" }), _jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8830 \u2022 Convention to Bellagio \u2022 9 min" }), _jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8833 \u2022 Wynn to Airport \u2022 21 min" })] }) }), _jsx(Panel, { title: "Driver Monitoring", icon: _jsx("span", { children: "\u25CD" }), children: _jsx("div", { className: "grid gap-3 text-sm", children: ['On Duty 126', 'Break 14', 'Offline 8'].map((d) => (_jsx("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition hover:border-amber-300/40", children: d }, d))) }) })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(Panel, { title: "Live Status Widgets", icon: _jsx("span", { children: "\u25CC" }), children: _jsxs("div", { className: "space-y-2 text-sm text-zinc-300", children: [_jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["System Health: ", _jsx("span", { className: "text-emerald-300", children: "Stable" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Avg Wait Time: ", _jsx("span", { className: "text-amber-200", children: "5m 42s" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Traffic Index: ", _jsx("span", { className: "text-rose-300", children: "High" })] })] }) }), _jsx(Panel, { title: "Alerts & Incidents", icon: _jsx("span", { children: "\u26A0" }), children: _jsxs("ul", { className: "space-y-2 text-sm text-zinc-300", children: [_jsx("li", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2", children: "New booking alert \u2022 BK-10928 received" }), _jsx("li", { className: "rounded-lg border border-rose-500/30 bg-rose-500/10 p-2", children: "Engine anomaly \u2022 Unit DV-14" }), _jsx("li", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-2", children: "Late pickup cluster \u2022 Sector West" }), _jsx("li", { className: "rounded-lg border border-sky-500/30 bg-sky-500/10 p-2", children: "Road closure \u2022 Strip Blvd" })] }) })] })] }), _jsxs("section", { className: "grid gap-5 lg:grid-cols-3", children: [_jsx(Panel, { title: "Dispatch Overview", icon: _jsx("span", { children: "\u2316" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "56 open dispatch tasks, 18 pending route approvals." }) }), _jsx(Panel, { title: "Fleet Overview", icon: _jsx("span", { children: "\u25A3" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "184 vehicles total \u2022 169 available \u2022 10 maintenance \u2022 5 offline." }) }), _jsx(Panel, { title: "Admin Settings", icon: _jsx("span", { children: "\u2699" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "Role profiles, escalation rules, and SLA thresholds configuration panel placeholder." }) })] }), _jsxs("section", { className: "grid gap-5 lg:grid-cols-2", children: [_jsx(Panel, { title: "Customer Activity", icon: _jsx("span", { children: "\u25CE" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "Bookings/hour peak: 94 \u2022 Repeat customer ratio: 47% \u2022 App satisfaction: 4.8/5." }) }), _jsx(Panel, { title: "Audit / Activity Log", icon: _jsx("span", { children: "\u25F7" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "10:32 Dispatch reassigned R-8821 \u2022 10:29 Refund prepared (manual approval) \u2022 10:25 Stripe test webhook accepted." }) })] }), "type RuntimeState = 'Healthy' | 'Warning' | 'Degraded' | 'Critical'; type SyncState = 'live' | 'recovering' | 'degraded'; type Booking = ", id, ": string; status: string; referenceCode?: string; pickup?: string; destination?: string; lifecycle?: ", version ?  : number, "; airportIntel?: ", flightNumber ?  : string, "; airline?: string; terminal?: string; arrivalAirport?: string; }; airportIntelligence?: ", enabled, ": boolean; pickupBufferMin: number; synchronizedAt: string; monitoring: ", providerPriority, ": string[]; status: string; delayMin: number; terminal: string | null; notes: string[]; }; }; lvMessenger?: ", messages ?  : Array, "; }; }; type Driver = ", driverId, ": string; state: string }; type Incident = ", code, ": string; severity: string; message: string }; type AttentionItem = ", title, ": string; state: RuntimeState; reason: string }; type LeoExecutiveSummary = ", headline, ": string; priority: string; report: string; }; type CopilotCapability = 'explain' | 'summarize' | 'correlate' | 'recommend_inspection_steps'; type CopilotEvidenceSource = 'admin.bookings' | 'drivers.liveStates' | 'operations.incidents' | 'runtime.sync'; type CopilotEvidence = ", source, ": CopilotEvidenceSource; reference: string; detail: string }; type CopilotResponse = ", capability, ": CopilotCapability; answer: string; lineage: string; deterministicCitations: string[]; evidence: CopilotEvidence[]; insufficientEvidence: boolean; }; const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1'; const stateTone: Record", _jsx(RuntimeState, {}), ", string> = ", Healthy, ": 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100', Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100', Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100', Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100' }; const severityRank: Record", _jsx(RuntimeState, {}), ", number> = ", Healthy, ": 0, Warning: 1, Degraded: 2, Critical: 3 }; const mergeState = (...states: RuntimeState[]): RuntimeState => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy'); const buildDeterministicCopilotResponse = (input: ", query, ": string; bookings: Booking[]; drivers: Driver[]; incidents: Incident[]; sync: SyncState; }): CopilotResponse => ", , "const normalized = input.query.toLowerCase(); const citations = [ `admin.bookings:count=$", input.bookings.length, "`, `drivers.liveStates:count=$", input.drivers.length, "`, `operations.incidents:count=$", input.incidents.length, "`, `runtime.sync:$", input.sync, "` ]; const evidence: CopilotEvidence[] = [", source, ": 'admin.bookings', reference: `bookings_total:$", input.bookings.length, "`, detail: `Total bookings visible in control tower: $", input.bookings.length, "` },", source, ": 'drivers.liveStates', reference: `drivers_total:$", input.drivers.length, "`, detail: `Driver state feed records: $", input.drivers.length, "` },", source, ": 'operations.incidents', reference: `incidents_total:$", input.incidents.length, "`, detail: `Incident records: $", input.incidents.length, "` },", source, ": 'runtime.sync', reference: `sync_state:$", input.sync, "`, detail: `Realtime sync state is $", input.sync, "` } ]; if (!input.query.trim()) ", , "return ", capability, ": 'summarize', answer: 'Insufficient evidence request context: provide a concrete operational question to summarize deterministic sources.', lineage: 'Deterministic retrieval pipeline: query -> source snapshot -> bounded response. No hidden inference applied.', deterministicCitations: citations, evidence, insufficientEvidence: true }; } if (normalized.includes('correlat')) ", , "const stalled = input.bookings.filter((booking) => ['arrived', 'failed'].includes(booking.status)).length; return ", capability, ": 'correlate', answer: `Correlation (source-bound): stalled rides=$", stalled, ", incidents=$", input.incidents.length, ", sync=$", input.sync, ". Investigate whether stalled rides and incidents share timestamps in the incident ledger.`, lineage: 'Correlated only deterministic counters from admin/bookings + operations/incidents + sync state.', deterministicCitations: citations, evidence, insufficientEvidence: false }; } if (normalized.includes('inspect') || normalized.includes('step') || normalized.includes('recommend')) ", , "const hasEvidence = input.bookings.length > 0 || input.drivers.length > 0 || input.incidents.length > 0; return ", capability, ": 'recommend_inspection_steps', answer: hasEvidence ? 'Inspection steps: (1) verify booking lifecycle versions for non-terminal rides, (2) compare online driver availability to pending/searching bookings, (3) cross-check open incidents against failed/arrived rides, (4) confirm realtime sync stability before escalation.' : 'Insufficient evidence: no source data available for safe inspection guidance. Validate source feeds first.', lineage: 'Recommendations constrained to observable control tower sources; no autonomous actions proposed.', deterministicCitations: citations, evidence, insufficientEvidence: !hasEvidence }; } if (normalized.includes('explain')) ", , "return ", capability, ": 'explain', answer: `Explanation: control tower currently tracks $", input.bookings.length, " bookings, $", input.drivers.length, " drivers, $", input.incidents.length, " incidents, and sync=$", input.sync, ". This explanation is strictly source-bound and does not infer hidden operational reality.`, lineage: 'Explanation rendered from deterministic in-memory snapshot derived from fetched sources.', deterministicCitations: citations, evidence, insufficientEvidence: false }; } return ", capability, ": 'summarize', answer: `Operational summary: bookings=$", input.bookings.length, ", drivers=$", input.drivers.length, ", incidents=$", input.incidents.length, ", sync=$", input.sync, ". Ask to explain, correlate, or recommend inspection steps for focused evidence narratives.`, lineage: 'Summary generated from deterministic retrieval of currently loaded sources only.', deterministicCitations: citations, evidence, insufficientEvidence: false }; }; export function App() ", , "const [bookings, setBookings] = useState", _jsx(Booking, {}), "[]>([]); const [drivers, setDrivers] = useState", _jsx(Driver, {}), "[]>([]); const [incidents, setIncidents] = useState", _jsx(Incident, {}), "[]>([]); const [sync, setSync] = useState", _jsxs(SyncState, { children: ["('recovering'); const [copilotQuery, setCopilotQuery] = useState(''); useEffect(() => ", , "const load = async () => ", , "try ", , "const [bookingRes, driverRes, incidentRes] = await Promise.all([ fetch(`$", API_BASE, "/admin/bookings`), fetch(`$", API_BASE, "/drivers/live-states`), fetch(`$", API_BASE, "/operations/incidents`) ]); const b = await bookingRes.json(); const d = await driverRes.json(); const i = await incidentRes.json(); setBookings(Array.isArray(b.bookings) ? b.bookings : []); setDrivers(Array.isArray(d.drivers) ? d.drivers : []); setIncidents(Array.isArray(i.incidents) ? i.incidents : []); setSync('live'); } catch ", setSync('degraded'), "; } }; load(); const poll = setInterval(load, 12000); return () => clearInterval(poll); }, []); const pendingRides = useMemo(() => bookings.filter((booking) => ['pending', 'searching_driver', 'quote_pending'].includes(booking.status)).length, [bookings]); const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)).length, [bookings]); const onlineDrivers = useMemo(() => drivers.filter((driver) => ['online', 'active'].includes(driver.state)).length, [drivers]); const founderAttention = useMemo", _jsx(AttentionItem, {}), "[]>(() => ", , "const attention: AttentionItem[] = []; bookings.forEach((ride) => ", , "if (ride.status === 'arrived') attention.push(", title, ": `Pickup waiting \u00B7 $", ride.referenceCode ?? ride.id, "`, state: 'Warning', reason: 'Passenger pickup confirmation pending.' }); if (ride.status === 'failed') attention.push(", title, ": `Failed ride \u00B7 $", ride.referenceCode ?? ride.id, "`, state: 'Degraded', reason: 'Manual intervention required.' }); }); if (sync !== 'live') attention.push(", title, ": 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' }); return attention.slice(0, 4); }, [bookings, sync]); const runtimeState = useMemo", _jsxs(RuntimeState, { children: ["(() => mergeState(...founderAttention.map((a) => a.state), incidents.length > 2 ? 'Warning' : 'Healthy'), [founderAttention, incidents.length]); const trustLevel = runtimeState === 'Healthy' ? 'High' : runtimeState === 'Warning' ? 'Guarded' : runtimeState === 'Degraded' ? 'Stressed' : 'Critical'; const leoSummary = useMemo", _jsxs(LeoExecutiveSummary, { children: ["(() => ", , "const top = founderAttention[0]; if (!top) ", , "return ", headline, ": 'Leo IA \u00B7 Operations stable', priority: 'No anomaly requires founder escalation right now.', report: 'All active simulations remain inside controlled thresholds. Continue routine monitoring.' }; } return ", headline, ": `Leo IA \u00B7 $", top.state, " anomaly observed`, priority: `Priority: $", top.title, ".`, report: `Recommendation: resolve $", top.title.toLowerCase(), " first, then verify airport coordination and payment confidence.` }; }, [founderAttention]); const copilotResponse = useMemo( () => buildDeterministicCopilotResponse(", query, ": copilotQuery, bookings, drivers, incidents, sync }), [copilotQuery, bookings, drivers, incidents, sync] ); return ", _jsx("main", { className: "min-h-screen bg-lvtp-obsidian p-4 text-zinc-100 sm:p-5", children: _jsxs("div", { className: "relative mx-auto max-w-6xl space-y-4", children: [_jsx("header", { className: "lvtp-shell rounded-3xl p-5", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Founder Cockpit" }), _jsx("h1", { className: "text-lg font-semibold text-amber-200 sm:text-xl", children: "Realtime Operations" })] })] }), _jsx("span", { className: `rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`, children: runtimeState })] }) }), _jsxs("section", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Active rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: activeRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Pending rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: pendingRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Drivers online" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: onlineDrivers })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "System trust level" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-amber-100", children: trustLevel }), _jsxs("p", { className: "mt-1 text-xs text-zinc-400", children: ["Sync: ", sync] })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card xl:col-span-2 rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Ride lifecycle visibility" }), _jsx("div", { className: "mt-3 space-y-3", children: bookings.map((ride) => {
apps/admin/src/app/App.js:62:                                                                                                }) })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Founder priorities" }), _jsx("div", { className: "mt-3 space-y-2", children: founderAttention.length ? founderAttention.map((item) => _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 p-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("p", { className: "text-sm text-zinc-100", children: item.title }), _jsx("span", { className: `rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`, children: item.state })] }), _jsx("p", { className: "mt-1 text-xs text-zinc-300", children: item.reason })] }, item.title)) : _jsx("p", { className: "text-sm text-zinc-300", children: "No founder actions required." }) })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4 xl:col-span-2", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Leo IA executive summary" }), _jsx("p", { className: "mt-3 text-sm text-zinc-100", children: leoSummary.headline }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: leoSummary.priority }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: leoSummary.report })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Operational health" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsxs("li", { children: ["Airport pickups waiting: ", bookings.filter((r) => r.status === 'arrived').length] }), _jsxs("li", { children: ["Payment retries: ", bookings.filter((r) => r.status === 'failed').length] }), _jsxs("li", { children: ["Incidents observed: ", incidents.length] }), _jsxs("li", { children: ["Moni reassurance need: ", founderAttention.some((a) => a.title.startsWith('Airport pickup')) ? 'Elevated' : 'Normal'] })] })] })] }), _jsxs("section", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Constrained Operational Copilot" }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Capabilities: explain, summarize, correlate, recommend inspection steps. Hard boundaries: no state mutation, no replay execution, no hidden inference, no auto-escalation, no self-healing." }), _jsx("div", { className: "mt-3 flex flex-col gap-2 sm:flex-row", children: _jsx("input", { value: copilotQuery, onChange: (event) => setCopilotQuery(event.target.value), className: "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-zinc-100", placeholder: "Ask for an explanation, summary, correlation, or inspection guidance..." }) }), _jsxs("div", { className: "mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-200", children: [_jsxs("p", { children: [_jsx("strong", { children: "Answer:" }), " ", copilotResponse.answer] }), _jsxs("p", { className: "mt-1", children: [_jsx("strong", { children: "Source lineage:" }), " ", copilotResponse.lineage] }), _jsxs("p", { className: "mt-1", children: [_jsx("strong", { children: "Insufficient evidence:" }), " ", copilotResponse.insufficientEvidence ? 'yes' : 'no'] }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Evidence references" }), _jsx("ul", { className: "mt-1 list-disc space-y-1 pl-5 text-xs text-zinc-300", children: copilotResponse.evidence.map((item) => _jsxs("li", { children: [item.source, "::", item.reference, " \u2014 ", item.detail] }, `${item.source}-${item.reference}`)) }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Deterministic citations" }), _jsx("ul", { className: "mt-1 list-disc space-y-1 pl-5 text-xs text-zinc-300", children: copilotResponse.deterministicCitations.map((citation) => _jsx("li", { children: citation }, citation)) })] })] })] }) }), "; } function Status(", status, ": ", status, ": DispatchBookingStatus }) ", , "return ", _jsx("span", { className: "text-emerald-300", children: status }), "; }"] })] })] })] })] })] }) }));
apps/admin/src/app/App.tsx:120:              <p className="text-lg font-medium text-white">Regional Dispatch & Service Health</p>
apps/admin/src/app/App.tsx:135:              <MetricCard title="Critical Alerts" value="3" trend="2 requires dispatch intervention" tone="rose" />
apps/admin/src/app/App.tsx:17:import { dispatchMvpStore, getDispatchSnapshot, type DispatchBookingStatus } from '@lvtransport/realtime';
apps/admin/src/app/App.tsx:203:              <Panel title="Dispatch Overview" icon={<span>⌖</span>}><p className="text-sm text-zinc-300">56 open dispatch tasks, 18 pending route approvals.</p></Panel>
apps/admin/src/app/App.tsx:210:              <Panel title="Audit / Activity Log" icon={<span>◷</span>}><p className="text-sm text-zinc-300">10:32 Dispatch reassigned R-8821 • 10:29 Refund prepared (manual approval) • 10:25 Stripe test webhook accepted.</p></Panel>
apps/admin/src/app/App.tsx:22:  const [state, setState] = useState(getDispatchSnapshot());
apps/admin/src/app/App.tsx:27:  useEffect(() => dispatchMvpStore.subscribe(setState), []);
apps/admin/src/app/App.tsx:29:  const assign = () => dispatchMvpStore.assignDriver(bookingId, customerId, driverId, 'admin-control');
apps/admin/src/app/App.tsx:40:      <h1 className="text-2xl font-bold text-amber-300">Dispatch Control Tower (MVP)</h1>
apps/admin/src/app/App.tsx:505:function Status({ status }: { status: DispatchBookingStatus }) {
apps/admin/src/app/App.tsx:72:  { label: 'Dispatch', icon: '⌖' },
apps/admin/src/pwa.js:7:        window.dispatchEvent(new CustomEvent('lv:install-ready'));
apps/admin/src/pwa.ts:8:    window.dispatchEvent(new CustomEvent('lv:install-ready'));
apps/api/data/operational-memory/index/memory-index.json:21:      "source": "dispatch.service",
apps/api/data/operational-memory/index/memory-index.json:22:      "message": "dispatch replay checkpoint",
apps/api/data/operational-memory/index/memory-index.json:30:        "dispatch:replay"
apps/api/data/operational-memory/seed.jsonl:2:{"id":"evt-002","timestamp":"2026-01-01T00:01:00.000Z","source":"dispatch.service","category":"replay","message":"dispatch replay checkpoint","entityType":"ride","entityId":"test","correlationId":"test","requestId":"req-2","replayId":"replay-1","lineage":["dispatch:replay"]}
apps/api/src/bookings/booking-notification-flow.service.ts:48:    const dispatch = notificationService.createDriverAssignmentDispatchNotification({
apps/api/src/bookings/booking-notification-flow.service.ts:56:      customerResult: dispatch.customer,
apps/api/src/bookings/booking-notification-flow.service.ts:57:      driverResult: dispatch.driver,
apps/api/src/bookings/booking-notification-flow.service.ts:58:      adminResult: dispatch.admin,
apps/api/src/bookings/booking-notification-flow.service.ts:69:      title: 'Dispatch alert',
apps/api/src/bookings/booking-notification-flow.service.ts:70:      body: `Booking ${context.bookingId} requires dispatch review.`,
apps/api/src/bookings/booking.service.ts:154:        body: `Booking ${input.bookingId} requires dispatch visibility.`,
apps/api/src/bookings/booking.service.ts.bak.20260603-191723:146:        body: `Booking ${input.bookingId} requires dispatch visibility.`,
apps/api/src/bookings/booking.service.ts.bak.p1-20260603-194925:146:        body: `Booking ${input.bookingId} requires dispatch visibility.`,
apps/api/src/bookings/notification-orchestrator.service.ts:31:      recipientId: (input.adminId as string) ?? 'admin_dispatch',
apps/api/src/controllers/health.controller.ts:18:  const dispatch = realtimeOrchestratorService.getDispatchDiagnostics();
apps/api/src/controllers/health.controller.ts:20:  const hasCriticalDrift = dispatch.staleAssignments.length > 0;
apps/api/src/controllers/health.controller.ts:29:        websocketClients: dispatch.websocketClients,
apps/api/src/controllers/health.controller.ts:30:        replayBufferSize: dispatch.replayBufferSize,
apps/api/src/controllers/health.controller.ts:31:        staleDrivers: dispatch.staleDrivers,
apps/api/src/controllers/health.controller.ts:34:        staleAssignments: dispatch.staleAssignments,
apps/api/src/controllers/health.controller.ts:35:        activeAssignmentAttempts: dispatch.activeAssignmentAttempts,
apps/api/src/dispatch/dispatch.service.ts:18:    const assignment = dispatchMvpStore.driverRespond(params.bookingId, params.driverId, params.decision);
apps/api/src/dispatch/dispatch.service.ts:1:import { dispatchMvpStore, type DispatchBookingStatus } from '@lvtransport/realtime';
apps/api/src/dispatch/dispatch.service.ts:21:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts:31:  updateStatus(bookingId: string, status: DispatchBookingStatus, actorId: string) {
apps/api/src/dispatch/dispatch.service.ts:32:    const assignment = dispatchMvpStore.updateRideStatus(bookingId, status, actorId);
apps/api/src/dispatch/dispatch.service.ts:34:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts:4:export const dispatchService = {
apps/api/src/dispatch/dispatch.service.ts:6:    const assignment = dispatchMvpStore.assignDriver(params.bookingId, params.customerId, params.driverId);
apps/api/src/dispatch/dispatch.service.ts:7:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:18:    const assignment = dispatchMvpStore.driverRespond(params.bookingId, params.driverId, params.decision);
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:1:import { dispatchMvpStore, type DispatchBookingStatus } from '@lvtransport/realtime';
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:21:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:31:  updateStatus(bookingId: string, status: DispatchBookingStatus, actorId: string) {
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:32:    const assignment = dispatchMvpStore.updateRideStatus(bookingId, status, actorId);
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:34:    bookingsService.publishBookingState({
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:4:export const dispatchService = {
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:6:    const assignment = dispatchMvpStore.assignDriver(params.bookingId, params.customerId, params.driverId);
apps/api/src/dispatch/dispatch.service.ts.bak.forge-v12-2026-06-03T22-01-28-734Z:7:    bookingsService.publishBookingState({
apps/api/src/modules/bookings/dto.ts:20:  preferredDispatchNote?: string;
apps/api/src/modules/execution-governance/execution-governance.service.ts:165:      approval_reason: 'Manual dispatch override approved by operations lead',
apps/api/src/modules/execution-governance/execution-governance.service.ts:169:      source_lineage_references: ['booking:test', 'dispatch-policy:v3']
apps/api/src/modules/interim-operations/dto/interim-operations.dto.ts:15:  priority: DispatchPriority;
apps/api/src/modules/interim-operations/dto/interim-operations.dto.ts:1:import { DispatchPriority, InterimWorkerAvailabilityState } from '../enums/interim-operations.enums';
apps/api/src/modules/interim-operations/dto/interim-operations.dto.ts:29:export interface PrepareDispatchBatchDto {
apps/api/src/modules/interim-operations/enums/interim-operations.enums.ts:13:  DISPATCHING = 'dispatching',
apps/api/src/modules/interim-operations/enums/interim-operations.enums.ts:32:  BLAST_DISPATCH = 'blast_dispatch',
apps/api/src/modules/interim-operations/enums/interim-operations.enums.ts:47:export enum DispatchPriority {
apps/api/src/modules/interim-operations/interfaces/interim-operations.interfaces.ts:27:  priority: DispatchPriority;
apps/api/src/modules/interim-operations/interfaces/interim-operations.interfaces.ts:2:  DispatchPriority,
apps/api/src/modules/interim-operations/interfaces/interim-operations.interfaces.ts:53:  dispatchIssuedAtIso: string;
apps/api/src/modules/interim-operations/README.md:14:- operational dispatch preparation
apps/api/src/modules/interim-operations/README.md:50:4. **Dispatch Coordination Engine (Conceptual)**
apps/api/src/modules/interim-operations/README.md:66:Business Request -> Request Validation -> Candidate Match -> Dispatch Offer
apps/api/src/modules/interim-operations/services/interim-operations-architecture.service.ts:109:      dispatchIssuedAtIso: new Date().toISOString(),
apps/api/src/modules/interim-operations/services/interim-operations-architecture.service.ts:19:  PrepareDispatchBatchDto,
apps/api/src/modules/interim-operations/services/interim-operations-architecture.service.ts:2:  DispatchPriority,
apps/api/src/modules/interim-operations/services/interim-operations-architecture.service.ts:41:      skills: ['replacement-driver', 'dispatch-support'],
apps/api/src/modules/interim-operations/services/interim-operations-architecture.service.ts:83:  prepareDispatchBatch(dto: PrepareDispatchBatchDto) {

## payment-refs
Refs: 131
apps/api/src/auth/middleware/authenticate.ts:58:      sessionId: claims.sessionId,
apps/api/src/modules/payments/dto/payment.dto.ts:14:  sessionId: string;
apps/api/src/modules/payments/dto/payment.dto.ts:1:import { PaymentProvider } from '../enums/payment.enums.js';
apps/api/src/modules/payments/dto/payment.dto.ts:22:  requestedBy: string;
apps/api/src/modules/payments/dto/payment.dto.ts:6:  provider: PaymentProvider;
apps/api/src/modules/payments/enums/payment.enums.ts:1:export enum PaymentProvider {
apps/api/src/modules/payments/enums/payment.enums.ts:6:export enum PaymentSessionStatus {
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:15:export interface PaymentSession {
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:19:  provider: PaymentProvider;
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:20:  status: PaymentSessionStatus;
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:33:  activePaymentSessionId?: string;
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:3:  PaymentProvider,
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:41:export interface RefundRecord {
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:47:  requestedBy: string;
apps/api/src/modules/payments/interfaces/payment.interfaces.ts:5:  PaymentSessionStatus,
apps/api/src/modules/payments/models/payment.models.ts:11:  status: PaymentSessionStatus;
apps/api/src/modules/payments/models/payment.models.ts:1:import { PaymentSessionStatus } from '../enums/payment.enums.js';
apps/api/src/modules/payments/models/payment.models.ts:4:export interface TransactionHistoryEntry {
apps/api/src/modules/payments/payment.routes.ts:11:router.post('/checkout/:sessionId/confirm', (req, res) => {
apps/api/src/modules/payments/payment.routes.ts:12:  const session = paymentArchitectureService.confirmSession(req.params.sessionId);
apps/api/src/modules/payments/payment.routes.ts:19:router.post('/webhooks/:provider', (req, res) => res.json(paymentArchitectureService.handleWebhookEvent(req.body.eventType, req.body.sessionId)));
apps/api/src/modules/payments/services/payment-architecture.service.ts:10:const transactionHistory: TransactionHistoryEntry[] = [];
apps/api/src/modules/payments/services/payment-architecture.service.ts:117:  handleWebhookEvent(envelope: PaymentWebhookEnvelope | string, sessionId?: string): PaymentWebhookHandlerResult {
apps/api/src/modules/payments/services/payment-architecture.service.ts:11:const refunds = new Map<string, RefundRecord>();
apps/api/src/modules/payments/services/payment-architecture.service.ts:121:          provider: PaymentProvider.STRIPE,
apps/api/src/modules/payments/services/payment-architecture.service.ts:126:          replayGuardKey: `manual_${envelope}_${sessionId ?? 'none'}`,
apps/api/src/modules/payments/services/payment-architecture.service.ts:127:          data: { sessionId },
apps/api/src/modules/payments/services/payment-architecture.service.ts:173:  restoreAfterReconnect(dto: { bookingId?: string; sessionId?: string }) {
apps/api/src/modules/payments/services/payment-architecture.service.ts:175:      ?? (dto.sessionId ? sessions.get(dto.sessionId)?.bookingId : undefined);
apps/api/src/modules/payments/services/payment-architecture.service.ts:19:      checkoutState: PaymentSessionStatus.CHECKOUT_PENDING,
apps/api/src/modules/payments/services/payment-architecture.service.ts:27:    const session: PaymentSession = {
apps/api/src/modules/payments/services/payment-architecture.service.ts:32:      status: PaymentSessionStatus.CREATED,
apps/api/src/modules/payments/services/payment-architecture.service.ts:3:import { BookingPaymentState, PaymentRetryStrategy, PaymentSessionStatus, RefundState } from '../enums/payment.enums.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts:49:      status: PaymentSessionStatus.CREATED,
apps/api/src/modules/payments/services/payment-architecture.service.ts:4:import type { BookingPaymentSnapshot, PaymentSession, RefundRecord } from '../interfaces/payment.interfaces.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts:5:import type { TransactionHistoryEntry } from '../models/payment.models.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts:61:  confirmSession(sessionId: string) {
apps/api/src/modules/payments/services/payment-architecture.service.ts:62:    return this.confirmPayment(sessionId);
apps/api/src/modules/payments/services/payment-architecture.service.ts:66:  confirmPayment(sessionId: string) {
apps/api/src/modules/payments/services/payment-architecture.service.ts:67:    const session = sessions.get(sessionId);
apps/api/src/modules/payments/services/payment-architecture.service.ts:70:    session.status = PaymentSessionStatus.CAPTURED;
apps/api/src/modules/payments/services/payment-architecture.service.ts:71:    bookingStates.set(session.bookingId, { bookingId: session.bookingId, state: BookingPaymentState.PAID, lastTransactionId: sessionId });
apps/api/src/modules/payments/services/payment-architecture.service.ts:77:      status: PaymentSessionStatus.CAPTURED,
apps/api/src/modules/payments/services/payment-architecture.service.ts:88:      sessionId: dto.sessionId,
apps/api/src/modules/payments/services/payment-architecture.service.ts:8:const sessions = new Map<string, PaymentSession>();
apps/api/src/modules/payments/services/payment-architecture.service.ts:96:    const record: RefundRecord = {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:10:const transactionHistory: TransactionHistoryEntry[] = [];
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:113:  handleWebhookEvent(envelope: PaymentWebhookEnvelope | string, sessionId?: string): PaymentWebhookHandlerResult {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:115:      ? ({ eventType: envelope, sessionId, signatureValidated: true } as PaymentWebhookEnvelope)
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:11:const refunds = new Map<string, RefundRecord>();
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:160:  restoreAfterReconnect(dto: { bookingId?: string; sessionId?: string }) {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:162:      ?? (dto.sessionId ? sessions.get(dto.sessionId)?.bookingId : undefined);
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:19:      checkoutState: PaymentSessionStatus.CHECKOUT_PENDING,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:27:    const session: PaymentSession = {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:32:      status: PaymentSessionStatus.CREATED,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:3:import { BookingPaymentState, PaymentSessionStatus } from '../enums/payment.enums.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:45:      status: PaymentSessionStatus.CREATED,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:4:import type { BookingPaymentSnapshot, PaymentSession, RefundRecord } from '../interfaces/payment.interfaces.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:57:  confirmSession(sessionId: string) {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:58:    return this.confirmPayment(sessionId);
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:5:import type { TransactionHistoryEntry } from '../models/payment.models.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:62:  confirmPayment(sessionId: string) {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:63:    const session = sessions.get(sessionId);
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:66:    session.status = PaymentSessionStatus.CAPTURED;
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:67:    bookingStates.set(session.bookingId, { bookingId: session.bookingId, state: BookingPaymentState.PAID, lastTransactionId: sessionId });
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:73:      status: PaymentSessionStatus.CAPTURED,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:84:      sessionId: dto.sessionId,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:8:const sessions = new Map<string, PaymentSession>();
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-054713:92:    const record: RefundRecord = {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:10:const transactionHistory: TransactionHistoryEntry[] = [];
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:113:  handleWebhookEvent(envelope: PaymentWebhookEnvelope | string, sessionId?: string): PaymentWebhookHandlerResult {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:115:      ? ({ eventType: envelope, sessionId, signatureValidated: true } as PaymentWebhookEnvelope)
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:11:const refunds = new Map<string, RefundRecord>();
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:160:  restoreAfterReconnect(dto: { bookingId?: string; sessionId?: string }) {
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:162:      ?? (dto.sessionId ? sessions.get(dto.sessionId)?.bookingId : undefined);
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:19:      checkoutState: PaymentSessionStatus.CHECKOUT_PENDING,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:32:      status: PaymentSessionStatus.CREATED,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:3:import { BookingPaymentState, PaymentSessionStatus } from '../enums/payment.enums.js';
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:45:      status: PaymentSessionStatus.CREATED,
apps/api/src/modules/payments/services/payment-architecture.service.ts.bak.20260603-064802:4:import type { BookingPaymentSnapshot, PaymentSession, RefundRecord } from '../interfaces/payment.interfaces.js';

## websocket-refs
Refs: 135
apps/admin/src/app/App.js:57:                                            : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`, children: [_jsx("span", { className: "w-4 text-center", children: icon }), " ", label] }, label))) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Operations Center" }), _jsx("p", { className: "text-lg font-medium text-white", children: "Regional Dispatch & Service Health" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { className: "rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm transition hover:border-amber-300 hover:text-amber-200", children: "Today" }), _jsx("button", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-2 transition hover:border-amber-300 hover:text-amber-200", children: _jsx("span", { children: "\uD83D\uDD14" }) })] })] }), _jsxs("div", { className: "space-y-5 p-5", children: [_jsxs("section", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { title: "Revenue Today", value: "$84,290", trend: "+6.4% vs yesterday", tone: "gold" }), _jsx(MetricCard, { title: "Active Rides", value: "148", trend: "12 nearing destination", tone: "emerald" }), _jsx(MetricCard, { title: "Driver Utilization", value: "91%", trend: "Across 3 operating zones", tone: "blue" }), _jsx(MetricCard, { title: "Critical Alerts", value: "3", trend: "2 requires dispatch intervention", tone: "rose" })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("div", { className: "space-y-5 xl:col-span-2", children: [_jsx(Panel, { title: "Booking Management", icon: _jsx("span", { children: "\u25C8" }), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[620px] text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-[0.16em] text-zinc-400", children: _jsx("tr", { children: ['ID', 'Service', 'Status', 'Driver', 'ETA', 'Payment'].map((h) => (_jsx("th", { className: "px-2 py-2", children: h }, h))) }) }), _jsx("tbody", { children: bookings.map((row) => (_jsx("tr", { className: "border-t border-zinc-800 text-zinc-200 transition hover:bg-zinc-900/70", children: row.map((cell) => (_jsx("td", { className: "px-2 py-3", children: cell }, cell))) }, row[0]))) })] }) }) }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsx(Panel, { title: "Active Rides", icon: _jsx("span", { children: "\u25C9" }), children: _jsxs("ul", { className: "space-y-3 text-sm text-zinc-300", children: [_jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8821 \u2022 Downtown to Terminal 1 \u2022 14 min" }), _jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8830 \u2022 Convention to Bellagio \u2022 9 min" }), _jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8833 \u2022 Wynn to Airport \u2022 21 min" })] }) }), _jsx(Panel, { title: "Driver Monitoring", icon: _jsx("span", { children: "\u25CD" }), children: _jsx("div", { className: "grid gap-3 text-sm", children: ['On Duty 126', 'Break 14', 'Offline 8'].map((d) => (_jsx("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition hover:border-amber-300/40", children: d }, d))) }) })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(Panel, { title: "Live Status Widgets", icon: _jsx("span", { children: "\u25CC" }), children: _jsxs("div", { className: "space-y-2 text-sm text-zinc-300", children: [_jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["System Health: ", _jsx("span", { className: "text-emerald-300", children: "Stable" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Avg Wait Time: ", _jsx("span", { className: "text-amber-200", children: "5m 42s" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Traffic Index: ", _jsx("span", { className: "text-rose-300", children: "High" })] })] }) }), _jsx(Panel, { title: "Alerts & Incidents", icon: _jsx("span", { children: "\u26A0" }), children: _jsxs("ul", { className: "space-y-2 text-sm text-zinc-300", children: [_jsx("li", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2", children: "New booking alert \u2022 BK-10928 received" }), _jsx("li", { className: "rounded-lg border border-rose-500/30 bg-rose-500/10 p-2", children: "Engine anomaly \u2022 Unit DV-14" }), _jsx("li", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-2", children: "Late pickup cluster \u2022 Sector West" }), _jsx("li", { className: "rounded-lg border border-sky-500/30 bg-sky-500/10 p-2", children: "Road closure \u2022 Strip Blvd" })] }) })] })] }), _jsxs("section", { className: "grid gap-5 lg:grid-cols-3", children: [_jsx(Panel, { title: "Dispatch Overview", icon: _jsx("span", { children: "\u2316" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "56 open dispatch tasks, 18 pending route approvals." }) }), _jsx(Panel, { title: "Fleet Overview", icon: _jsx("span", { children: "\u25A3" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "184 vehicles total \u2022 169 available \u2022 10 maintenance \u2022 5 offline." }) }), _jsx(Panel, { title: "Admin Settings", icon: _jsx("span", { children: "\u2699" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "Role profiles, escalation rules, and SLA thresholds configuration panel placeholder." }) })] }), _jsxs("section", { className: "grid gap-5 lg:grid-cols-2", children: [_jsx(Panel, { title: "Customer Activity", icon: _jsx("span", { children: "\u25CE" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "Bookings/hour peak: 94 \u2022 Repeat customer ratio: 47% \u2022 App satisfaction: 4.8/5." }) }), _jsx(Panel, { title: "Audit / Activity Log", icon: _jsx("span", { children: "\u25F7" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "10:32 Dispatch reassigned R-8821 \u2022 10:29 Refund prepared (manual approval) \u2022 10:25 Stripe test webhook accepted." }) })] }), "type RuntimeState = 'Healthy' | 'Warning' | 'Degraded' | 'Critical'; type SyncState = 'live' | 'recovering' | 'degraded'; type Booking = ", id, ": string; status: string; referenceCode?: string; pickup?: string; destination?: string; lifecycle?: ", version ?  : number, "; airportIntel?: ", flightNumber ?  : string, "; airline?: string; terminal?: string; arrivalAirport?: string; }; airportIntelligence?: ", enabled, ": boolean; pickupBufferMin: number; synchronizedAt: string; monitoring: ", providerPriority, ": string[]; status: string; delayMin: number; terminal: string | null; notes: string[]; }; }; lvMessenger?: ", messages ?  : Array, "; }; }; type Driver = ", driverId, ": string; state: string }; type Incident = ", code, ": string; severity: string; message: string }; type AttentionItem = ", title, ": string; state: RuntimeState; reason: string }; type LeoExecutiveSummary = ", headline, ": string; priority: string; report: string; }; type CopilotCapability = 'explain' | 'summarize' | 'correlate' | 'recommend_inspection_steps'; type CopilotEvidenceSource = 'admin.bookings' | 'drivers.liveStates' | 'operations.incidents' | 'runtime.sync'; type CopilotEvidence = ", source, ": CopilotEvidenceSource; reference: string; detail: string }; type CopilotResponse = ", capability, ": CopilotCapability; answer: string; lineage: string; deterministicCitations: string[]; evidence: CopilotEvidence[]; insufficientEvidence: boolean; }; const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1'; const stateTone: Record", _jsx(RuntimeState, {}), ", string> = ", Healthy, ": 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100', Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100', Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100', Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100' }; const severityRank: Record", _jsx(RuntimeState, {}), ", number> = ", Healthy, ": 0, Warning: 1, Degraded: 2, Critical: 3 }; const mergeState = (...states: RuntimeState[]): RuntimeState => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy'); const buildDeterministicCopilotResponse = (input: ", query, ": string; bookings: Booking[]; drivers: Driver[]; incidents: Incident[]; sync: SyncState; }): CopilotResponse => ", , "const normalized = input.query.toLowerCase(); const citations = [ `admin.bookings:count=$", input.bookings.length, "`, `drivers.liveStates:count=$", input.drivers.length, "`, `operations.incidents:count=$", input.incidents.length, "`, `runtime.sync:$", input.sync, "` ]; const evidence: CopilotEvidence[] = [", source, ": 'admin.bookings', reference: `bookings_total:$", input.bookings.length, "`, detail: `Total bookings visible in control tower: $", input.bookings.length, "` },", source, ": 'drivers.liveStates', reference: `drivers_total:$", input.drivers.length, "`, detail: `Driver state feed records: $", input.drivers.length, "` },", source, ": 'operations.incidents', reference: `incidents_total:$", input.incidents.length, "`, detail: `Incident records: $", input.incidents.length, "` },", source, ": 'runtime.sync', reference: `sync_state:$", input.sync, "`, detail: `Realtime sync state is $", input.sync, "` } ]; if (!input.query.trim()) ", , "return ", capability, ": 'summarize', answer: 'Insufficient evidence request context: provide a concrete operational question to summarize deterministic sources.', lineage: 'Deterministic retrieval pipeline: query -> source snapshot -> bounded response. No hidden inference applied.', deterministicCitations: citations, evidence, insufficientEvidence: true }; } if (normalized.includes('correlat')) ", , "const stalled = input.bookings.filter((booking) => ['arrived', 'failed'].includes(booking.status)).length; return ", capability, ": 'correlate', answer: `Correlation (source-bound): stalled rides=$", stalled, ", incidents=$", input.incidents.length, ", sync=$", input.sync, ". Investigate whether stalled rides and incidents share timestamps in the incident ledger.`, lineage: 'Correlated only deterministic counters from admin/bookings + operations/incidents + sync state.', deterministicCitations: citations, evidence, insufficientEvidence: false }; } if (normalized.includes('inspect') || normalized.includes('step') || normalized.includes('recommend')) ", , "const hasEvidence = input.bookings.length > 0 || input.drivers.length > 0 || input.incidents.length > 0; return ", capability, ": 'recommend_inspection_steps', answer: hasEvidence ? 'Inspection steps: (1) verify booking lifecycle versions for non-terminal rides, (2) compare online driver availability to pending/searching bookings, (3) cross-check open incidents against failed/arrived rides, (4) confirm realtime sync stability before escalation.' : 'Insufficient evidence: no source data available for safe inspection guidance. Validate source feeds first.', lineage: 'Recommendations constrained to observable control tower sources; no autonomous actions proposed.', deterministicCitations: citations, evidence, insufficientEvidence: !hasEvidence }; } if (normalized.includes('explain')) ", , "return ", capability, ": 'explain', answer: `Explanation: control tower currently tracks $", input.bookings.length, " bookings, $", input.drivers.length, " drivers, $", input.incidents.length, " incidents, and sync=$", input.sync, ". This explanation is strictly source-bound and does not infer hidden operational reality.`, lineage: 'Explanation rendered from deterministic in-memory snapshot derived from fetched sources.', deterministicCitations: citations, evidence, insufficientEvidence: false }; } return ", capability, ": 'summarize', answer: `Operational summary: bookings=$", input.bookings.length, ", drivers=$", input.drivers.length, ", incidents=$", input.incidents.length, ", sync=$", input.sync, ". Ask to explain, correlate, or recommend inspection steps for focused evidence narratives.`, lineage: 'Summary generated from deterministic retrieval of currently loaded sources only.', deterministicCitations: citations, evidence, insufficientEvidence: false }; }; export function App() ", , "const [bookings, setBookings] = useState", _jsx(Booking, {}), "[]>([]); const [drivers, setDrivers] = useState", _jsx(Driver, {}), "[]>([]); const [incidents, setIncidents] = useState", _jsx(Incident, {}), "[]>([]); const [sync, setSync] = useState", _jsxs(SyncState, { children: ["('recovering'); const [copilotQuery, setCopilotQuery] = useState(''); useEffect(() => ", , "const load = async () => ", , "try ", , "const [bookingRes, driverRes, incidentRes] = await Promise.all([ fetch(`$", API_BASE, "/admin/bookings`), fetch(`$", API_BASE, "/drivers/live-states`), fetch(`$", API_BASE, "/operations/incidents`) ]); const b = await bookingRes.json(); const d = await driverRes.json(); const i = await incidentRes.json(); setBookings(Array.isArray(b.bookings) ? b.bookings : []); setDrivers(Array.isArray(d.drivers) ? d.drivers : []); setIncidents(Array.isArray(i.incidents) ? i.incidents : []); setSync('live'); } catch ", setSync('degraded'), "; } }; load(); const poll = setInterval(load, 12000); return () => clearInterval(poll); }, []); const pendingRides = useMemo(() => bookings.filter((booking) => ['pending', 'searching_driver', 'quote_pending'].includes(booking.status)).length, [bookings]); const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)).length, [bookings]); const onlineDrivers = useMemo(() => drivers.filter((driver) => ['online', 'active'].includes(driver.state)).length, [drivers]); const founderAttention = useMemo", _jsx(AttentionItem, {}), "[]>(() => ", , "const attention: AttentionItem[] = []; bookings.forEach((ride) => ", , "if (ride.status === 'arrived') attention.push(", title, ": `Pickup waiting \u00B7 $", ride.referenceCode ?? ride.id, "`, state: 'Warning', reason: 'Passenger pickup confirmation pending.' }); if (ride.status === 'failed') attention.push(", title, ": `Failed ride \u00B7 $", ride.referenceCode ?? ride.id, "`, state: 'Degraded', reason: 'Manual intervention required.' }); }); if (sync !== 'live') attention.push(", title, ": 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' }); return attention.slice(0, 4); }, [bookings, sync]); const runtimeState = useMemo", _jsxs(RuntimeState, { children: ["(() => mergeState(...founderAttention.map((a) => a.state), incidents.length > 2 ? 'Warning' : 'Healthy'), [founderAttention, incidents.length]); const trustLevel = runtimeState === 'Healthy' ? 'High' : runtimeState === 'Warning' ? 'Guarded' : runtimeState === 'Degraded' ? 'Stressed' : 'Critical'; const leoSummary = useMemo", _jsxs(LeoExecutiveSummary, { children: ["(() => ", , "const top = founderAttention[0]; if (!top) ", , "return ", headline, ": 'Leo IA \u00B7 Operations stable', priority: 'No anomaly requires founder escalation right now.', report: 'All active simulations remain inside controlled thresholds. Continue routine monitoring.' }; } return ", headline, ": `Leo IA \u00B7 $", top.state, " anomaly observed`, priority: `Priority: $", top.title, ".`, report: `Recommendation: resolve $", top.title.toLowerCase(), " first, then verify airport coordination and payment confidence.` }; }, [founderAttention]); const copilotResponse = useMemo( () => buildDeterministicCopilotResponse(", query, ": copilotQuery, bookings, drivers, incidents, sync }), [copilotQuery, bookings, drivers, incidents, sync] ); return ", _jsx("main", { className: "min-h-screen bg-lvtp-obsidian p-4 text-zinc-100 sm:p-5", children: _jsxs("div", { className: "relative mx-auto max-w-6xl space-y-4", children: [_jsx("header", { className: "lvtp-shell rounded-3xl p-5", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Founder Cockpit" }), _jsx("h1", { className: "text-lg font-semibold text-amber-200 sm:text-xl", children: "Realtime Operations" })] })] }), _jsx("span", { className: `rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`, children: runtimeState })] }) }), _jsxs("section", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Active rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: activeRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Pending rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: pendingRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Drivers online" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: onlineDrivers })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "System trust level" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-amber-100", children: trustLevel }), _jsxs("p", { className: "mt-1 text-xs text-zinc-400", children: ["Sync: ", sync] })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card xl:col-span-2 rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Ride lifecycle visibility" }), _jsx("div", { className: "mt-3 space-y-3", children: bookings.map((ride) => {
apps/admin/src/app/App.tsx:404:    if (sync !== 'live') attention.push({ title: 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' });
apps/admin/src/firebase/index.js:1:import { initializeFirebaseApp, prepareAuth, prepareFirestore, prepareRealtimeDatabase, adminMonitoringEventArchitecture } from "@lvtransport/realtime";
apps/admin/src/firebase/index.js:2:const app = initializeFirebaseApp({
apps/admin/src/firebase/index.ts:1:import { initializeFirebaseApp, prepareAuth, prepareFirestore, prepareRealtimeDatabase, adminMonitoringEventArchitecture } from "@lvtransport/realtime";
apps/admin/src/firebase/index.ts:3:const app = initializeFirebaseApp({
apps/api/README.md:10:- `src/websocket` WebSocket server scaffold
apps/api/README.md:3:Scaffolded backend architecture with modular domains, API versioning, middleware, and WebSocket/event foundations.
apps/api/README.md:60:- WebSocket server scaffold (`/ws`)
apps/api/src/controllers/health.controller.ts:29:        websocketClients: dispatch.websocketClients,
apps/api/src/drivers/driver.service.ts:5:    // TODO: persist status and broadcast via websocket.
apps/api/src/firebase/index.ts:14:const app = initializeFirebaseApp({
apps/api/src/firebase/index.ts:24:export const createApiRealtimeArchitecture = (firebaseTransport: RealtimeTransport, websocketTransport: RealtimeTransport) => ({
apps/api/src/firebase/index.ts:2:  FirebaseWebsocketBridge,
apps/api/src/firebase/index.ts:33:  bridge: new FirebaseWebsocketBridge({ firebase: firebaseTransport, websocket: websocketTransport })
apps/api/src/firebase/index.ts:5:  initializeFirebaseApp,
apps/api/src/modules/airport-intelligence/service.ts:25:        notes: ['Airport intelligence initialized with premium coordination mode.']
apps/api/src/modules/bookings/dto.ts:105:    initializedAt: string;
apps/api/src/modules/bookings/service.ts:77:        initializedAt: now,
apps/api/src/modules/bookings/service.ts:84:      lvMessenger: lvMessengerService.initializeThread(),
apps/api/src/modules/interim-operations/README.md:74:- integrate with existing auth, maps, and websocket patterns via adapters
apps/api/src/modules/lv-messenger/service.ts:5:  initializeThread(): { threadId: string; messages: LVMessage[]; lastMessageAt: string } {
apps/api/src/modules/persistence/sqlite.persistence.ts:73:export const initializeSqlitePersistence = (): DatabaseSync => {
apps/api/src/modules/persistence/sqlite.persistence.ts:77:  logger.info('SQLite initialized', {
apps/api/src/notifications/notification.architecture.ts:16:    websocketReplay: 'notification.queue.realtime_replay',
apps/api/src/server.ts:10:realtimeOrchestratorService.initialize();
apps/api/src/server.ts:11:initializeSqlitePersistence();
apps/api/src/server.ts:13:const { start, stop } = bootstrapHttpAndWebSocketServer(app);
apps/api/src/server.ts:3:import { bootstrapHttpAndWebSocketServer } from './websocket/socket.server.js';
apps/api/src/server.ts:6:import { initializeSqlitePersistence } from './modules/persistence/sqlite.persistence.js';
apps/api/src/services/booking-lifecycle-realtime.service.ts:49:  initialize(): void {
apps/api/src/services/operational-observability.service.ts:16:  socketId: string;
apps/api/src/services/operational-observability.service.ts:34:    const existing = connectionState.get(event.socketId);
apps/api/src/services/operational-observability.service.ts:36:      connectionState.set(event.socketId, { connectedAt: now, replayRequests: existing?.replayRequests ?? 0 });
apps/api/src/services/operational-observability.service.ts:39:      connectionState.set(event.socketId, {
apps/api/src/services/operational-observability.service.ts:46:      connectionState.set(event.socketId, {
apps/api/src/services/realtime-orchestrator.service.ts:129:const websocketClients = new Set<WebSocket>();
apps/api/src/services/realtime-orchestrator.service.ts:141:type RealtimeSocket = WebSocket & { isAlive?: boolean };
apps/api/src/services/realtime-orchestrator.service.ts:174:  for (const client of websocketClients) if (client.readyState === client.OPEN) client.send(envelope);
apps/api/src/services/realtime-orchestrator.service.ts:295:  initialize(): void {
apps/api/src/services/realtime-orchestrator.service.ts:301:      for (const socket of websocketClients) {
apps/api/src/services/realtime-orchestrator.service.ts:302:        const client = socket as RealtimeSocket;
apps/api/src/services/realtime-orchestrator.service.ts:304:          operationalObservabilityService.trackRealtimeEvent({ type: 'heartbeat_timeout', socketId: String((socket as unknown as { _socket?: { remoteAddress?: string; remotePort?: number } })._socket?.remoteAddress ?? 'unknown') });
apps/api/src/services/realtime-orchestrator.service.ts:305:          socket.terminate();
apps/api/src/services/realtime-orchestrator.service.ts:306:          websocketClients.delete(socket);
apps/api/src/services/realtime-orchestrator.service.ts:310:        socket.ping();
apps/api/src/services/realtime-orchestrator.service.ts:315:  registerClient(socket: WebSocket): void {
apps/api/src/services/realtime-orchestrator.service.ts:316:    const client = socket as RealtimeSocket;
apps/api/src/services/realtime-orchestrator.service.ts:318:    websocketClients.add(socket);
apps/api/src/services/realtime-orchestrator.service.ts:319:    socket.on('pong', () => { client.isAlive = true; });
apps/api/src/services/realtime-orchestrator.service.ts:320:    socket.on('close', () => {
apps/api/src/services/realtime-orchestrator.service.ts:321:      operationalObservabilityService.trackRealtimeEvent({ type: 'disconnect', socketId: String((socket as unknown as { _socket?: { remoteAddress?: string; remotePort?: number } })._socket?.remoteAddress ?? 'unknown') });
apps/api/src/services/realtime-orchestrator.service.ts:322:      websocketClients.delete(socket);
apps/api/src/services/realtime-orchestrator.service.ts:324:    const lastSequence = parseLastSequenceFromUrl((socket as unknown as { url?: string }).url);
apps/api/src/services/realtime-orchestrator.service.ts:325:    operationalObservabilityService.trackRealtimeEvent({ type: lastSequence ? 'reconnect' : 'connect', socketId: String((socket as unknown as { _socket?: { remoteAddress?: string; remotePort?: number } })._socket?.remoteAddress ?? 'unknown'), lastSequence });
apps/api/src/services/realtime-orchestrator.service.ts:328:      operationalObservabilityService.trackRealtimeEvent({ type: 'replay_requested', socketId: String((socket as unknown as { _socket?: { remoteAddress?: string; remotePort?: number } })._socket?.remoteAddress ?? 'unknown'), lastSequence });
apps/api/src/services/realtime-orchestrator.service.ts:329:      for (const replayEvent of eventReplayBuffer) if ((JSON.parse(replayEvent) as { sequence?: number }).sequence! > lastSequence) socket.send(replayEvent);
apps/api/src/services/realtime-orchestrator.service.ts:331:    socket.send(JSON.stringify({ event: 'booking.snapshot', payload: Array.from(bookings.values()), sequence: eventSequence }));
apps/api/src/services/realtime-orchestrator.service.ts:332:    socket.send(JSON.stringify({ event: 'driver.snapshot', payload: Array.from(driverStates.values()), sequence: eventSequence }));
apps/api/src/services/realtime-orchestrator.service.ts:333:    socket.send(JSON.stringify({ event: 'admin.analytics.snapshot', payload: operationalAnalyticsService.getAdminSnapshot(), sequence: eventSequence }));
apps/api/src/services/realtime-orchestrator.service.ts:3:import type { WebSocket } from 'ws';
apps/api/src/services/realtime-orchestrator.service.ts:746:      websocketClients: websocketClients.size,
apps/api/src/services/realtime-orchestrator.service.ts:771:      connectedRealtimeClients: websocketClients.size,
apps/api/src/services/startup-validation.service.ts:73:        id: 'observability.socket-coverage',
apps/api/src/websocket/socket.server.ts:101:      logger.info(`API + WebSocket server listening on port ${env.port}`);
apps/api/src/websocket/socket.server.ts:107:    realtimeOrchestratorService.shutdown?.();
apps/api/src/websocket/socket.server.ts:11:export const bootstrapHttpAndWebSocketServer = (app: Express) => {
apps/api/src/websocket/socket.server.ts:13:  const wss = new WebSocketServer({ server, path: '/ws' });
apps/api/src/websocket/socket.server.ts:23:        logger.warn('WebSocket stale client terminated', { staleMs: Date.now() - lastBeat });
apps/api/src/websocket/socket.server.ts:2:import { WebSocketServer } from 'ws';
apps/api/src/websocket/socketServer.ts:2:import { WebSocketServer } from 'ws';
apps/api/src/websocket/socket.server.ts:52:  wss.on('connection', (socket) => {
apps/api/src/websocket/socket.server.ts:53:    logger.info('WebSocket client connected');
apps/api/src/websocket/socket.server.ts:55:    clientHeartbeats.set(socket, Date.now());
apps/api/src/websocket/socket.server.ts:57:    socket.send(JSON.stringify({
apps/api/src/websocket/socketServer.ts:5:  const wss = new WebSocketServer({ server, path: '/ws' });
apps/api/src/websocket/socket.server.ts:62:    socket.send(JSON.stringify({
apps/api/src/websocket/socket.server.ts:64:      message: 'WebSocket realtime channel ready',
apps/api/src/websocket/socket.server.ts:68:    socket.on('message', (message) => {
apps/api/src/websocket/socket.server.ts:70:      logger.info('WebSocket message received', { message: raw });

## Atlas Classification

Canonical candidates must be selected by Founder OS.

Priority order:
1. Booking canonical contract
2. Dispatch compatibility
3. Payment contract reconciliation
4. Websocket lifecycle

Rule: Atlas maps. Founder OS approves. Nexus fabricates. Forge executes. Auditor validates.
