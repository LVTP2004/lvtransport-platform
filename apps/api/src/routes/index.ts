import { Router } from 'express';
import { API_VERSION } from '../constants/index.js';
import v1Routes from './v1/index.js';

const router = Router();

router.use(`/${API_VERSION}`, v1Routes);

export default router;
