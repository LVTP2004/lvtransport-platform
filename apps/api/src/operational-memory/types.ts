export type OperationCategory =
  | 'ride'
  | 'incident'
  | 'recovery'
  | 'replay'
  | 'migration'
  | 'request'
  | 'system'
  | 'unknown';

export interface MemoryRecord {
  id: string;
  timestamp: string;
  source: string;
  category: OperationCategory;
  message: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  requestId?: string;
  incidentId?: string;
  replayId?: string;
  migrationId?: string;
  lineage?: string[];
  metadata?: Record<string, unknown>;
}

export interface TimelineEntry {
  timestamp: string;
  source: string;
  category: OperationCategory;
  entityType: string | null;
  entityId: string | null;
  correlationId: string | null;
  requestId: string | null;
  lineage: string[];
  description: string;
  recordId: string;
}

export interface ContinuitySummary {
  mode: 'ride' | 'recovery' | 'incident' | 'migration' | 'correlation';
  key: Record<string, string>;
  status: 'complete' | 'partial' | 'missing';
  summary: string;
  missingData: string[];
  events: TimelineEntry[];
  lineage: string[];
  nextInspectionSteps: string[];
}
