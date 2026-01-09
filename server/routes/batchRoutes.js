import express from 'express';
const router = express.Router();
import { getUnbatchedPairs, createBatch, getBatches, updateBatch } from '../controllers/batchController.js';

router.get('/unbatched', getUnbatchedPairs);
router.post('/create', createBatch);
router.get('/batches', getBatches);
router.put('/batches/:id', updateBatch);

export default router;