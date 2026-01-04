import express from 'express';
const router = express.Router();
import { getUnbatchedPairs, createBatch, getBatches } from '../controllers/batchController.js';

router.get('/unbatched', getUnbatchedPairs);
router.post('/create', createBatch);
router.get('/batches', getBatches);

export default router;