import express from 'express';
import { getLivePrices, checkZerodhaStatus } from '../controllers/marketController.js';

const router = express.Router();

// This makes the full path: /api/market/quotes
router.get('/quotes', getLivePrices);
router.get('/status', checkZerodhaStatus);

export default router;