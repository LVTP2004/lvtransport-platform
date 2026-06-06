import { executionGovernanceService } from '../modules/execution-governance/execution-governance.service.js';

const entityArg = process.argv.find((arg) => arg.startsWith('--entity='));
const idArg = process.argv.find((arg) => arg.startsWith('--id='));
const entity = entityArg?.split('=')[1];
const id = idArg?.split('=')[1];

if (!entity || !id) {
  console.log(JSON.stringify({ error: 'EXECUTION_VALIDATION_ERROR', code: 'APPROVAL_INCOMPLETE', message: 'entity and id are required' }));
  process.exit(1);
}

const history = executionGovernanceService.listExecutionHistory(entity, id);
console.log(JSON.stringify({ history }));
