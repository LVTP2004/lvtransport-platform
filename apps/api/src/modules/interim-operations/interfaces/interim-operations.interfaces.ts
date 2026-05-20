import {
  DispatchPriority,
  EmergencyReplacementState,
  InterimWorkerAvailabilityState,
  InterimWorkerLifecycleState,
  StaffingRequestState,
  TemporaryAssignmentState,
} from '../enums/interim-operations.enums';

export interface InterimWorkerProfile {
  workerId: string;
  displayName: string;
  lifecycleState: InterimWorkerLifecycleState;
  availabilityState: InterimWorkerAvailabilityState;
  baseCity: string;
  sectors: string[];
  skills: string[];
  vehicleCapabilities?: string[];
  verificationSnapshotId?: string;
  reputationScore?: number;
}

export interface BusinessStaffingRequest {
  requestId: string;
  businessAccountId: string;
  state: StaffingRequestState;
  priority: DispatchPriority;
  sector: string;
  requiredRoles: string[];
  workerCount: number;
  startAtIso: string;
  endAtIso?: string;
  locationLabel: string;
  notes?: string;
}

export interface EmergencyReplacementCase {
  emergencyCaseId: string;
  businessAccountId: string;
  state: EmergencyReplacementState;
  affectedOperation: string;
  neededRole: string;
  neededCount: number;
  mustStartBeforeIso: string;
}

export interface TemporaryAssignment {
  assignmentId: string;
  requestId: string;
  workerId: string;
  state: TemporaryAssignmentState;
  etaMinutes?: number;
  dispatchIssuedAtIso: string;
  acceptedAtIso?: string;
  completedAtIso?: string;
}

export interface RealtimeOperationsSnapshot {
  activeRequests: number;
  activeAssignments: number;
  emergencyCasesOpen: number;
  workersAvailable: number;
  workersOnAssignment: number;
  generatedAtIso: string;
}
