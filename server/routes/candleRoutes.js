import express from 'express';
const router = express.Router();
import { getCandles } from '../controllers/candleController.js';

router.get('/candles', getCandles);

export default router;
