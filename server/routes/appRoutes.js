import express from 'express';
import {
    getLivePrices,
    checkZerodhaStatus,
    getActiveTickers,
    getTodaysOrders
} from '../controllers/marketController.js';
import { 
    getUnbatchedPairs,
    createBatch,
    getBatches,
    updateBatch,
    getBatchById
} from '../controllers/batchController.js';

const router = express.Router();

// Market Routes
// This makes the full path: /api/market/quotes
router.get('/market/quotes', getLivePrices);
router.get('/market/status', checkZerodhaStatus);
router.get('/market/active-tickers', getActiveTickers);
router.get('/market/todays-orders', getTodaysOrders);

// Batch Routes
router.get('/batches/unbatched', getUnbatchedPairs);
router.post('/batches/create', createBatch);
router.get('/batches/batches', getBatches);
router.put('/batches/:id', updateBatch);
router.get('/batches/:id', getBatchById);
export default router;