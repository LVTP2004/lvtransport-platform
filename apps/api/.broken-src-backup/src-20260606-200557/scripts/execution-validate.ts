import { executionGovernanceService } from '../modules/execution-governance/execution-governance.service.js';

const approvalArg = process.argv.find((arg) => arg.startsWith('--approval-id='));
const approvalId = approvalArg?.split('=')[1];

if (!approvalId) {
  console.log(JSON.stringify({ error: 'EXECUTION_VALIDATION_ERROR', code: 'APPROVAL_MISSING', message: 'approval-id is required' }));
  process.exit(1);
}

const result = executionGovernanceService.validateExecution(approvalId);
console.log(JSON.stringify(result));
process.exit('error' in result ? 1 : 0);
