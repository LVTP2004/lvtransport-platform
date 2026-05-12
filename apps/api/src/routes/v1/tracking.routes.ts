import { Router } from 'express';
import { trackingService } from '../../tracking/tracking.service.js';

const trackingRoutes = Router();

trackingRoutes.get('/tracking/:code', (req, res) => {
  const result = trackingService.lookupByCode(req.params.code);
  if (!result) {
    return res.status(404).json({ message: 'Tracking code not found or expired.' });
  }
  return res.json(result);
});

export default trackingRoutes;
