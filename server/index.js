// server/index.js
import express from 'express';
import cors from 'cors';
//require('dotenv').config();
import pool from './db.js';
import transactionRoutes from './transactionRoutes.js'; // <-- 1. Import the router
import strategyRoutes from './strategyRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { kite } from './services/zerodhaService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://stock-portfolio-app-kappa.vercel.app', // REMOVED THE TRAILING SLASH HERE
  'http://localhost:5173',                        // Vite default local port
  'http://localhost:3000'                         // Common alternative local port
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// -----------------------------------------------------------------
// 2. Use the Transaction Router
app.use('/api/transactions', transactionRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/market', marketRoutes);
// app.use('/api/data', dataRoutes);


// Mount the auth routes
// If you mount it like this, the full URL will be /api/auth/...
app.use('/api/auth', authRoutes);

// For debugging: Add a test route directly in index.js
app.get('/api/test', (req, res) => res.json({ message: "Backend is reachable!" }));

// -----------------------------------------------------------------

// Root Route
app.get('/', (req, res) => {
  res.send('Stock Portfolio Backend is Running!');
});

// Test Route (Keep this for debugging)
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

import { kite } from './services/zerodhaService.js';
import pool from './db.js';

const restoreZerodhaSession = async () => {
  try {
    const result = await pool.query("SELECT value FROM app_config WHERE key = 'zerodha_access_token'");

    if (result.rows.length > 0) {
      const token = result.rows[0].value;
      kite.setAccessToken(token);
      console.log("🚀 Zerodha session restored from Database");

      // Optional: Test if the token is still valid
      await kite.getProfile();
    } else {
      console.log("ℹ️ No Zerodha session found in DB. Manual login required.");
    }
  } catch (err) {
    console.error("⚠️ Failed to restore Zerodha session:", err.message);
    // We don't crash the server, just wait for manual login
  }
};

// Execute restoration
restoreZerodhaSession();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});