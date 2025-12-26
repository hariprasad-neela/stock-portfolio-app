import express from 'express';
import { createSelectiveBatch } from '../controllers/batchController.js';

const router = express.Router();

router.post('/create-selective', createSelectiveBatch);

export default router;