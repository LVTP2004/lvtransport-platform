import { Router } from 'express';
import { auditedOperationalExecutionService, type AuditedExecutionRequest } from '../../modules/operations-execution/service.js';

const router = Router();

const parseRequest = (body: unknown): AuditedExecutionRequest => body as AuditedExecutionRequest;

router.post('/operations/execution/replay', (req, res) => {
  const record = auditedOperationalExecutionService.execute('replay', parseRequest(req.body));
  const statusCode = record.status === 'rejected' ? 422 : 200;
  res.status(statusCode).json({ execution: record });
});

router.post('/operations/execution/notification-retry', (req, res) => {
  const record = auditedOperationalExecutionService.execute('notification-retry', parseRequest(req.body));
  const statusCode = record.status === 'rejected' ? 422 : 200;
  res.status(statusCode).json({ execution: record });
});

router.get('/operations/execution/history', (_req, res) => {
  res.json({ history: auditedOperationalExecutionService.listHistory() });
});

export default router;
