import { Router } from 'express';
import { executionGovernanceService } from '../../modules/execution-governance/execution-governance.service.js';

const router = Router();

router.post('/execution/request', (req, res) => {
  const approvalId = typeof req.body?.approval_id === 'string' ? req.body.approval_id : '';
  if (!approvalId) {
    return res.status(400).json({
      error: 'EXECUTION_VALIDATION_ERROR',
      code: 'APPROVAL_MISSING',
      message: 'approval_id is required'
    });
  }

  const result = executionGovernanceService.requestExecution(approvalId);
  if ('error' in result) return res.status(409).json(result);
  return res.status(202).json(result);
});

router.get('/execution/history/:entity/:id', (req, res) => {
  const history = executionGovernanceService.listExecutionHistory(req.params.entity, req.params.id);
  return res.json({ history });
});

export default router;
