import { DispatchPriority, InterimWorkerAvailabilityState } from '../enums/interim-operations.enums';

export interface UpsertWorkerAvailabilityDto {
  workerId: string;
  availabilityState: InterimWorkerAvailabilityState;
  locationLabel?: string;
  effectiveAtIso: string;
}

export interface CreateStaffingRequestDto {
  businessAccountId: string;
  sector: string;
  requiredRoles: string[];
  workerCount: number;
  priority: DispatchPriority;
  startAtIso: string;
  locationLabel: string;
  notes?: string;
}

export interface CreateEmergencyReplacementDto {
  businessAccountId: string;
  affectedOperation: string;
  neededRole: string;
  neededCount: number;
  mustStartBeforeIso: string;
}

export interface PrepareDispatchBatchDto {
  requestId: string;
  maxCandidates: number;
  requireVerificationReady: boolean;
}
