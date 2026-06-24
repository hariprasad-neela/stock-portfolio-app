import express from 'express';
const router = express.Router();
import { getCandles } from '../controllers/candleController.js';

router.get('/candles/:ticker', getCandles);

export default router;
