export type LeoAuditPhase =
  | 'runtime_observation'
  | 'weakness_chain_analysis'
  | 'lifecycle_truth_audit'
  | 'moni_behavioral_audit'
  | 'airport_intelligence_audit'
  | 'payment_coherence_audit'
  | 'operational_calmness'
  | 'ecosystem_alignment'
  | 'matrix_governance'
  | 'founder_executive_reporting';

export type LeoSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RuntimeSignal {
  timestamp: string;
  subsystem:
    | 'lv_ride'
    | 'lv_driver'
    | 'lv_control'
    | 'lv_messenger'
    | 'lv_pay'
    | 'airport_intelligence'
    | 'moni'
    | 'matrix';
  metric:
    | 'websocket_reconnect'
    | 'stale_gps'
    | 'sync_delay'
    | 'eta_drift'
    | 'lte_degraded'
    | 'realtime_failure'
    | 'reconnect_storm'
    | 'state_duplication'
    | 'latency_spike'
    | 'map_instability';
  value: number;
  threshold?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface WeaknessChain {
  chainId: string;
  rootCause: string;
  linkedEvents: string[];
  connectedSubsystems: string[];
  emotionalImpact: 'none' | 'low' | 'medium' | 'high';
  operationalImpact: 'low' | 'medium' | 'high' | 'critical';
  severity: LeoSeverity;
  convergencePriority: number;
  simplificationRecommendation: string;
  ownerSubsystem: string;
  validationStrategy: string;
}

export interface LifecycleAuditRecord {
  bookingId: string;
  state:
    | 'booking_created'
    | 'pending_assignment'
    | 'driver_assigned'
    | 'driver_on_route'
    | 'driver_arrived'
    | 'passenger_onboard'
    | 'ride_active'
    | 'completed'
    | 'cancelled'
    | 'failed_recovery';
  timestamp: string;
  source: 'ride' | 'driver' | 'control' | 'payments';
}

export interface LeoAnomaly {
  id: string;
  phase: LeoAuditPhase;
  severity: LeoSeverity;
  title: string;
  summary: string;
  subsystems: string[];
  recommendations: string[];
  createdAt: string;
}

export interface OperationalScorecard {
  runtimeResilience: number;
  lifecycleTruthIntegrity: number;
  moniDiscipline: number;
  airportMaturity: number;
  paymentReliability: number;
  realtimeSynchronization: number;
  founderVisibility: number;
  operationalCalmness: number;
  ecosystemCoherence: number;
  simplificationOpportunity: number;
  experimentalIsolationDiscipline: number;
}

export interface FounderExecutiveReport {
  generatedAt: string;
  operationalPulse: string;
  activeAnomalies: LeoAnomaly[];
  weaknessChains: WeaknessChain[];
  scorecard: OperationalScorecard;
  answers: {
    unstable: string;
    trustThreat: string;
    overcomplicated: string;
    simplifyNow: string;
    subsystemAttention: string;
    emergingWeaknessChain: string;
    improving: string;
    shouldNotScaleYet: string;
  };
}
