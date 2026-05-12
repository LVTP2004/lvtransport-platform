/**
 * LVTP conceptual hierarchy alignment (non-runtime).
 *
 * This module intentionally adds architecture boundaries without altering
 * existing booking, realtime, API, or dispatch execution paths.
 */

export const LVTP_HIERARCHY = {
  ceoFounder: 'Leonardo Daniel Vargas Hinojosa',
  leoIA: {
    role: 'orchestration_supervision',
    layers: [
      'executive_intelligence_layer',
      'lv_control_tower',
      'technical_infrastructure',
      'ai_operations_layer',
      'customer_layer',
      'driver_layer',
      'future_ecosystem'
    ] as const
  }
} as const;

export type LeoIALayer = (typeof LVTP_HIERARCHY.leoIA.layers)[number];

export interface LeoIAOrchestrationBoundary {
  supervisor: 'Leo IA';
  operationalAuthority: 'LV Control Tower';
  bookingSourceOfTruth: 'Booking Engine';
  aiOperationsModule: 'Moni Assistant';
}

export const LEO_IA_BOUNDARY: LeoIAOrchestrationBoundary = {
  supervisor: 'Leo IA',
  operationalAuthority: 'LV Control Tower',
  bookingSourceOfTruth: 'Booking Engine',
  aiOperationsModule: 'Moni Assistant'
};
