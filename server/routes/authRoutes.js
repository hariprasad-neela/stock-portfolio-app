import express from 'express';
import { kite, setKiteAccessToken } from '../services/zerodhaService.js';

const router = express.Router();

// This becomes: GET /api/auth/zerodha-url
router.get('/zerodha-url', getZerodhaLoginUrl);

// Route 1: Trigger Login
router.get('/zerodha-login', (req, res) => {
    const url = kite.getLoginURL();
    res.json({ url }); // Send URL to frontend
});

// Route 2: The Callback (Zerodha redirects here)
router.get('/zerodha/callback', async (req, res) => {
    const { request_token } = req.query;

    try {
        const response = await kite.generateSession(request_token, process.env.ZERODHA_API_SECRET);
        const accessToken = response.access_token;
        
        setKiteAccessToken(accessToken);
        
        // In a real app, you might save this to your 'portfolios' table 
        // to avoid re-logging in if the server restarts during the day.
        
        res.send(`
            <html>
                <body style="font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
                    <h1>Authenticated!</h1>
                    <p>Zerodha connection is active for the next 24 hours.</p>
                    <button onclick="window.close()">Close this window</button>
                </body>
            </html>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send("Authentication failed");
    }
});

export default router;