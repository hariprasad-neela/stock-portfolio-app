import express from 'express';
const router = express.Router();
import { getUnbatchedPairs, createBatch, getBatches, updateBatch, getBatchById } from '../controllers/batchController.js';

router.get('/unbatched', getUnbatchedPairs);
router.post('/create', createBatch);
router.get('/batches', getBatches);
router.put('/:id', updateBatch);
router.get('/batch/:id', getBatchById);

export default router;