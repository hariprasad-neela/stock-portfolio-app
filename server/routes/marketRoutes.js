import express from 'express';
import { getLivePrices } from '../controllers/marketController.js';

const router = express.Router();

// This makes the full path: /api/market/quotes
router.get('/quotes', getLivePrices);

export default router;