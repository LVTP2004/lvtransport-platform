import {
  DispatchPriority,
  EmergencyReplacementState,
  InterimWorkerAvailabilityState,
  InterimWorkerLifecycleState,
  StaffingRequestState,
  TemporaryAssignmentState,
} from '../enums/interim-operations.enums';
import {
  BusinessStaffingRequest,
  EmergencyReplacementCase,
  InterimWorkerProfile,
  RealtimeOperationsSnapshot,
  TemporaryAssignment,
} from '../interfaces/interim-operations.interfaces';
import {
  CreateEmergencyReplacementDto,
  CreateStaffingRequestDto,
  PrepareDispatchBatchDto,
  UpsertWorkerAvailabilityDto,
} from '../dto/interim-operations.dto';

/**
 * Concept-only architecture service.
 * This class intentionally provides mock orchestration responses and avoids production side-effects.
 */
export class InterimOperationsArchitectureService {
  private workers = new Map<string, InterimWorkerProfile>();
  private requests = new Map<string, BusinessStaffingRequest>();
  private emergencyCases = new Map<string, EmergencyReplacementCase>();
  private assignments = new Map<string, TemporaryAssignment>();

  upsertWorkerAvailability(dto: UpsertWorkerAvailabilityDto) {
    const worker = this.workers.get(dto.workerId) ?? {
      workerId: dto.workerId,
      displayName: `Worker ${dto.workerId}`,
      lifecycleState: InterimWorkerLifecycleState.ACTIVE_POOL,
      availabilityState: InterimWorkerAvailabilityState.OFFLINE,
      baseCity: 'Brussels',
      sectors: ['transport', 'logistics'],
      skills: ['replacement-driver', 'dispatch-support'],
    };

    worker.availabilityState = dto.availabilityState;
    this.workers.set(worker.workerId, worker);

    return { updated: true, workerId: worker.workerId, availabilityState: worker.availabilityState };
  }

  createStaffingRequest(dto: CreateStaffingRequestDto): BusinessStaffingRequest {
    const request: BusinessStaffingRequest = {
      requestId: `staff_req_${Date.now()}`,
      businessAccountId: dto.businessAccountId,
      state: StaffingRequestState.OPEN,
      priority: dto.priority,
      sector: dto.sector,
      requiredRoles: dto.requiredRoles,
      workerCount: dto.workerCount,
      startAtIso: dto.startAtIso,
      locationLabel: dto.locationLabel,
      notes: dto.notes,
    };

    this.requests.set(request.requestId, request);
    return request;
  }

  createEmergencyReplacement(dto: CreateEmergencyReplacementDto): EmergencyReplacementCase {
    const emergencyCase: EmergencyReplacementCase = {
      emergencyCaseId: `emergency_${Date.now()}`,
      businessAccountId: dto.businessAccountId,
      state: EmergencyReplacementState.TRIAGED,
      affectedOperation: dto.affectedOperation,
      neededRole: dto.neededRole,
      neededCount: dto.neededCount,
      mustStartBeforeIso: dto.mustStartBeforeIso,
    };

    this.emergencyCases.set(emergencyCase.emergencyCaseId, emergencyCase);
    return emergencyCase;
  }

  prepareDispatchBatch(dto: PrepareDispatchBatchDto) {
    const request = this.requests.get(dto.requestId);
    if (!request) return { ready: false, reason: 'request_not_found', candidates: [] as InterimWorkerProfile[] };

    request.state = StaffingRequestState.MATCHING;

    const candidates = [...this.workers.values()]
      .filter((worker) => worker.availabilityState === InterimWorkerAvailabilityState.AVAILABLE)
      .filter((worker) => !dto.requireVerificationReady || worker.lifecycleState === InterimWorkerLifecycleState.VERIFIED_READY)
      .slice(0, dto.maxCandidates);

    return {
      ready: true,
      requestId: request.requestId,
      priority: request.priority,
      dispatchPolicy: request.priority === DispatchPriority.CRITICAL ? 'blast' : 'ranked',
      candidates,
    };
  }

  createConceptAssignment(requestId: string, workerId: string): TemporaryAssignment {
    const assignment: TemporaryAssignment = {
      assignmentId: `assign_${Date.now()}`,
      requestId,
      workerId,
      state: TemporaryAssignmentState.OFFERED,
      dispatchIssuedAtIso: new Date().toISOString(),
      etaMinutes: 20,
    };
    this.assignments.set(assignment.assignmentId, assignment);
    return assignment;
  }

  realtimeSnapshot(): RealtimeOperationsSnapshot {
    const workers = [...this.workers.values()];
    const assignments = [...this.assignments.values()];

    return {
      activeRequests: [...this.requests.values()].filter((r) => r.state !== StaffingRequestState.CANCELLED).length,
      activeAssignments: assignments.filter((a) => a.state !== TemporaryAssignmentState.COMPLETED).length,
      emergencyCasesOpen: [...this.emergencyCases.values()].filter((e) => e.state !== EmergencyReplacementState.CLOSED).length,
      workersAvailable: workers.filter((w) => w.availabilityState === InterimWorkerAvailabilityState.AVAILABLE).length,
      workersOnAssignment: workers.filter((w) => w.availabilityState === InterimWorkerAvailabilityState.ON_ASSIGNMENT).length,
      generatedAtIso: new Date().toISOString(),
    };
  }
}
