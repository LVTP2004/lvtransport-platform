import { logger } from './logger.js';

export type OperationalSeverity = 'info' | 'warning' | 'critical';

export type OperationalDomain =
  | 'realtime'
  | 'lifecycle'
  | 'dispatch'
  | 'telemetry'
  | 'reconnect'
  | 'api'
  | 'payment'
  | 'pricing'
  | 'sync';

export type OperationalIncident = {
  code: string;
  severity: OperationalSeverity;
  domain: OperationalDomain;
  message: string;
  at: string;
  context?: Record<string, unknown>;
};

const MAX_INCIDENTS = 400;
const incidents: OperationalIncident[] = [];

const pushIncident = (incident: OperationalIncident) => {
  incidents.push(incident);
  if (incidents.length > MAX_INCIDENTS) incidents.splice(0, incidents.length - MAX_INCIDENTS);
};

export const recordOperationalIncident = (input: Omit<OperationalIncident, 'at'> & { at?: string }) => {
  const incident: OperationalIncident = { ...input, at: input.at ?? new Date().toISOString() };
  pushIncident(incident);
  const logMeta = { incidentCode: incident.code, domain: incident.domain, severity: incident.severity, at: incident.at, ...incident.context };
  if (incident.severity === 'critical') logger.error(incident.message, logMeta);
  else if (incident.severity === 'warning') logger.warn(incident.message, logMeta);
  else logger.info(incident.message, logMeta);
  return incident;
};

export const listOperationalIncidents = () => [...incidents];

export const summarizeOperationalIncidents = () => {
  const activeAlerts = incidents.filter((incident) => incident.severity !== 'info').length;
  const byDomain = incidents.reduce<Record<string, number>>((acc, incident) => {
    acc[incident.domain] = (acc[incident.domain] ?? 0) + 1;
    return acc;
  }, {});
  return {
    total: incidents.length,
    activeAlerts,
    byDomain,
    lastIncidentAt: incidents.at(-1)?.at ?? null,
  };
};
