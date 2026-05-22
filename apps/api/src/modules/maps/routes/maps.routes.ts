import { Router } from 'express';
import { mapsProxyService } from '../services/maps-proxy.service.js';

const router = Router();

router.get('/autocomplete', async (req, res) => {
  const input = String(req.query.input ?? '');
  const items = await mapsProxyService.autocomplete(input);
  res.json({ items, provider: 'google-maps', proxied: false });
});

router.get('/place-details', async (req, res) => {
  const placeId = String(req.query.placeId ?? '');
  const description = String(req.query.description ?? '');
  if (!placeId || !description) {
    res.status(400).json({ message: 'placeId and description are required' });
    return;
  }
  const details = await mapsProxyService.placeDetails(placeId, description);
  res.json(details);
});

router.post('/route-estimate', async (req, res) => {
  const { pickup, destination } = req.body ?? {};
  if (!pickup || !destination) {
    res.status(400).json({ message: 'pickup and destination are required' });
    return;
  }
  const routeSummary = await mapsProxyService.estimateRoute(pickup, destination);
  res.json({ routeSummary });
});

export default router;
