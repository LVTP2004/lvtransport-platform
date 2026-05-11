import { Router } from 'express';
import { mapsService } from '../../modules/maps/maps.service.js';

const router = Router();

router.get('/maps/places/autocomplete', async (req, res, next) => {
  try {
    const input = String(req.query.input ?? '').trim();
    if (!input) return res.status(400).json({ error: 'input query param is required' });
    const suggestions = await mapsService.autocomplete(input);
    return res.json({ suggestions });
  } catch (error) {
    return next(error);
  }
});

router.get('/maps/places/:placeId', async (req, res, next) => {
  try {
    const details = await mapsService.placeDetails(req.params.placeId);
    if (!details) return res.status(404).json({ error: 'place details unavailable' });
    return res.json({ place: details });
  } catch (error) {
    return next(error);
  }
});

router.post('/maps/route-estimate', (req, res) => {
  const pickup = req.body?.pickup;
  const destination = req.body?.destination;

  const hasCoords = (value: unknown) => {
    const candidate = value as { lat?: number; lng?: number };
    return typeof candidate?.lat === 'number' && typeof candidate?.lng === 'number';
  };

  if (!hasCoords(pickup) || !hasCoords(destination)) {
    return res.status(400).json({ error: 'pickup and destination coordinates are required' });
  }

  const route = mapsService.estimateRoute({ pickup, destination });
  return res.json({ route });
});

export default router;
