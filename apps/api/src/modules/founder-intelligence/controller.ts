import type { Request, Response } from 'express';
import { founderIntelligenceService } from './service.js';

export const founderIntelligenceController = async (
  _req: Request,
  res: Response,
) => {
  const snapshot =
    await founderIntelligenceService.snapshot();

  res.json(snapshot);
};
