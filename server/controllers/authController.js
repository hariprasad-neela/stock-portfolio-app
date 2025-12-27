import { kite } from '../services/zerodhaService.js';
import pool from '../db.js';

export const getZerodhaLoginUrl = (req, res) => {
    try {
        const url = kite.getLoginURL();
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate login URL" });
    }
};

export const handleZerodhaCallback = async (req, res) => {
    const { request_token } = req.query;

    try {
        const response = await kite.generateSession(request_token, process.env.ZERODHA_API_SECRET);
        const accessToken = response.access_token;

        // 1. Set in memory for immediate use
        kite.setAccessToken(accessToken);

        // 2. Persist to DB
        await pool.query(
            `INSERT INTO app_config (key, value, updated_at) 
             VALUES ('zerodha_access_token', $1, CURRENT_TIMESTAMP)
             ON CONFLICT (key) 
             DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
            [accessToken]
        );

        res.send(`
            <script>
                if (window.opener) {
                    window.opener.location.reload();
                    window.close();
                } else {
                    document.body.innerHTML = "<h1>Connected!</h1><p>You can close this tab.</p>";
                }
            </script>
        `);
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).send("Authentication failed");
    }
};