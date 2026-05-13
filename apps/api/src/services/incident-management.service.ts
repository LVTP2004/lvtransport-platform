import { randomUUID } from 'node:crypto';

export const INCIDENT_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'] as const;
export const INCIDENT_CATEGORIES = ['driver', 'customer', 'dispatch', 'realtime', 'payment', 'airport', 'SLA', 'safety'] as const;
export const INCIDENT_STATES = ['open', 'acknowledged', 'resolved'] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];
export type IncidentState = (typeof INCIDENT_STATES)[number];

export type IncidentTimelineEntry = {
  at: string;
  actor: string;
  action: string;
  note?: string;
  metadata?: Record<string, unknown>;
};

export type IncidentRecord = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  state: IncidentState;
  owner: string;
  bookingId?: string;
  driverId?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  escalationLevel: number;
  escalationTarget?: string;
  recoveryDeadlineAt?: string;
  outcome?: 'success' | 'degraded' | 'manual_override' | 'failed';
  timeline: IncidentTimelineEntry[];
};

const incidents = new Map<string, IncidentRecord>();

const rank: Record<IncidentSeverity, number> = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };

const pushTimeline = (incident: IncidentRecord, entry: IncidentTimelineEntry): void => {
  incident.timeline.push(entry);
};

export const incidentManagementService = {
  openIncident(input: { title: string; severity: IncidentSeverity; category: IncidentCategory; owner: string; actor: string; bookingId?: string; driverId?: string; recoveryTimeoutMs?: number; escalationTarget?: string; note?: string }) {
    const now = new Date().toISOString();
    const incident: IncidentRecord = {
      id: randomUUID(),
      title: input.title,
      severity: input.severity,
      category: input.category,
      state: 'open',
      owner: input.owner,
      bookingId: input.bookingId,
      driverId: input.driverId,
      createdAt: now,
      escalationLevel: 0,
      escalationTarget: input.escalationTarget,
      recoveryDeadlineAt: input.recoveryTimeoutMs ? new Date(Date.now() + input.recoveryTimeoutMs).toISOString() : undefined,
      timeline: []
    };
    pushTimeline(incident, { at: now, actor: input.actor, action: 'incident.opened', note: input.note });
    incidents.set(incident.id, incident);
    return incident;
  },
  acknowledgeIncident(id: string, actor: string, note?: string) {
    const incident = incidents.get(id);
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');
    if (incident.state === 'resolved') throw new Error('INCIDENT_ALREADY_RESOLVED');
    incident.state = 'acknowledged';
    incident.acknowledgedAt = new Date().toISOString();
    pushTimeline(incident, { at: incident.acknowledgedAt, actor, action: 'incident.acknowledged', note });
    return incident;
  },
  resolveIncident(id: string, actor: string, outcome: IncidentRecord['outcome'] = 'success', note?: string) {
    const incident = incidents.get(id);
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');
    incident.state = 'resolved';
    incident.outcome = outcome;
    incident.resolvedAt = new Date().toISOString();
    pushTimeline(incident, { at: incident.resolvedAt, actor, action: 'incident.resolved', note, metadata: { outcome } });
    return incident;
  },
  logRecoveryAction(id: string, actor: string, action: string, note?: string, metadata?: Record<string, unknown>) {
    const incident = incidents.get(id);
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');
    pushTimeline(incident, { at: new Date().toISOString(), actor, action: `recovery.${action}`, note, metadata });
    return incident;
  },
  applyManualOverride(id: string, actor: string, authorityRole: string, note: string) {
    return this.logRecoveryAction(id, actor, 'manual_override', note, { authorityRole });
  },
  escalateIncident(id: string, actor: string, target: string, note?: string) {
    const incident = incidents.get(id);
    if (!incident) throw new Error('INCIDENT_NOT_FOUND');
    incident.escalationLevel += 1;
    incident.escalationTarget = target;
    pushTimeline(incident, { at: new Date().toISOString(), actor, action: 'incident.escalated', note, metadata: { escalationLevel: incident.escalationLevel, target } });
    return incident;
  },
  listIncidents() { return Array.from(incidents.values()).sort((a, b) => rank[b.severity] - rank[a.severity] || Date.parse(b.createdAt) - Date.parse(a.createdAt)); },
  listUnresolved() { return this.listIncidents().filter((i) => i.state !== 'resolved'); },
  getIncident(id: string) { return incidents.get(id); },
  detectTimeoutRisks() {
    const now = Date.now();
    return this.listUnresolved().filter((incident) => incident.recoveryDeadlineAt && Date.parse(incident.recoveryDeadlineAt) < now);
  }
};
