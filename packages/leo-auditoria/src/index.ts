export * from './types.js';
export * from './engine.js';

export const LEO_IA_AUDITORIA_BOUNDARY = {
  permissions: ['observe', 'analyze', 'correlate', 'classify', 'score', 'recommend'],
  denied: [
    'deploy_changes',
    'override_production',
    'modify_lifecycle_truth',
    'alter_payments',
    'manipulate_bookings',
    'auto_control_moni',
    'rewrite_runtime_logic',
    'bypass_founder_approval'
  ]
} as const;
