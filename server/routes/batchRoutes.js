import express from 'express';
const router = express.Router();
import { getUnbatchedPairs, createBatch } from '../controllers/batchController.js';

router.get('/unbatched', getUnbatchedPairs);
router.post('/create', createBatch);

export default router;