import { Router } from 'express';
import { founderIntelligenceController } from '../../modules/founder-intelligence/controller.js';

export const founderRoutes = Router();

founderRoutes.get(
  '/founder/intelligence',
  founderIntelligenceController,
);
