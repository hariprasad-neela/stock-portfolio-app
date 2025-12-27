import express from 'express';
import { kite, setKiteAccessToken } from '../services/zerodhaService.js';
import { getZerodhaLoginUrl, handleZerodhaCallback } from '../controllers/authController.js';

const router = express.Router();

// This becomes: GET /api/auth/zerodha-url
router.get('/zerodha-url', getZerodhaLoginUrl);

// Route 1: Trigger Login
router.get('/zerodha-login', (req, res) => {
    const url = kite.getLoginURL();
    res.json({ url }); // Send URL to frontend
});

// This becomes: GET /api/auth/callback
router.get('/callback', handleZerodhaCallback);

export default router;