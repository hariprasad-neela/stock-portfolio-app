// server/db.js
import pkg from 'pg';
const { Pool } = pkg;
//require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Render connections
    },
    // ⬇️ ADD THIS LINE TO FORCE IPV4
    family: 4
});

export default pool;