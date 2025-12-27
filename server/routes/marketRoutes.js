import express from 'express';
import { getLivePrices, checkZerodhaStatus, getActiveTickers } from '../controllers/marketController.js';

const router = express.Router();

// This makes the full path: /api/market/quotes
router.get('/quotes', getLivePrices);
router.get('/status', checkZerodhaStatus);
router.get('/active-tickers', getActiveTickers);

export default router;