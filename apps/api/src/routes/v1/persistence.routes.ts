import { Router } from 'express';
import { emptyPersistenceRepository } from '../../modules/persistence/in-memory-empty.repository.js';

const router = Router();

router.get('/bookings/:id', async (req, res) => {
  const ride = await emptyPersistenceRepository.getRideById(req.params.id);
  if (!ride) return res.status(404).json({ message: 'booking_not_found', persistence: 'contract_prepared_no_records' });
  return res.json({ ride });
});

router.get('/admin/payments/history', async (_req, res) => res.json({ payments: await emptyPersistenceRepository.listPayments() }));
router.post('/admin/payments/:id/status', async (req, res) => {
  const status = typeof req.body?.status === 'string' ? req.body.status : '';
  const payment = await emptyPersistenceRepository.updatePaymentStatus(req.params.id, status as never);
  if (!payment) return res.status(404).json({ message: 'payment_not_found_or_not_persisted' });
  return res.json({ payment });
});

router.get('/admin/history/audit', async (_req, res) => res.json({ events: await emptyPersistenceRepository.listAuditEvents() }));
router.get('/admin/history/rides', async (_req, res) => res.json({ rides: [] }));
router.get('/driver/history', async (_req, res) => res.json({ rides: [] }));

router.post('/messages/events', async (req, res) => {
  const event = await emptyPersistenceRepository.createMessageEvent(req.body);
  return res.status(202).json({ event, persistence: 'contract_prepared_event_not_stored' });
});
router.get('/admin/messages/events', async (_req, res) => res.json({ events: await emptyPersistenceRepository.listMessageEvents() }));

router.get('/admin/notifications/failed', async (_req, res) => res.json({ notifications: await emptyPersistenceRepository.listFailedNotifications() }));
router.post('/admin/notifications/:id/retry', async (req, res) => {
  const attempt = await emptyPersistenceRepository.updateNotificationStatus(req.params.id, 'retry_pending', req.body?.reason);
  if (!attempt) return res.status(404).json({ message: 'notification_not_found_or_not_persisted' });
  return res.json({ attempt });
});

router.get('/operations/recovery/events', async (_req, res) => {
  const events = await emptyPersistenceRepository.listRecoveryEvents();
  return res.json({ events });
});

export default router;
