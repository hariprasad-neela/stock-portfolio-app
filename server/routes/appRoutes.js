import express from 'express';
import {
    getLivePrices,
    checkZerodhaStatus,
    getActiveTickers,
    getTodaysOrders,
    getHistoricalData
} from '../controllers/marketController.js';
import { 
    getUnbatchedPairs,
    createBatch,
    getBatches,
    updateBatch,
    getBatchById
} from '../controllers/batchController.js';
import {
    getTransactionById, 
    getSyncedExternalIds,
    getLedger,
    updateTransaction,
    deleteTransaction,
    createTransaction,
    getOpenInventory,
    getTransactions,
} from '../controllers/transactionController.js';

const router = express.Router();

// Market Routes
// This makes the full path: /api/market/quotes
router.get('/market/quotes', getLivePrices);
router.get('/market/status', checkZerodhaStatus);
router.get('/market/active-tickers', getActiveTickers);
router.get('/market/todays-orders', getTodaysOrders);
router.get('/market/historical-data', getHistoricalData);

// Batch Routes
router.get('/batches/unbatched', getUnbatchedPairs);
router.post('/batches/create', createBatch);
router.get('/batches/batches', getBatches);
router.put('/batches/batch/:id', updateBatch);
router.get('/batches/batch/:id', getBatchById);

// Transaction Routes
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.get('/transactions/synced-status', getSyncedExternalIds);
router.put('/transactions/:id', updateTransaction); 
router.delete('/transactions/:id', deleteTransaction);
router.get('/transactions/:id', getTransactionById);
router.get('/open-inventory/:ticker', getOpenInventory);

// GET all transactions for the ledger
router.get('/', getLedger);


export default router;
