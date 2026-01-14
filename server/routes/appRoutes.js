import express from 'express';
import {
    getLivePrices,
    checkZerodhaStatus,
    getActiveTickers,
    getTodaysOrders
} from '../controllers/marketController.js';

const router = express.Router();

// This makes the full path: /api/market/quotes
router.get('/market/quotes', getLivePrices);
router.get('/market/status', checkZerodhaStatus);
router.get('/market/active-tickers', getActiveTickers);
router.get('/market/todays-orders', getTodaysOrders);

export default router;