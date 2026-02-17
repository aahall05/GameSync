// test-db.js
import 'dotenv/config'; // automatically loads .env
import pg from 'pg';

const { Pool } = pg;

// Create a pool with your environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect to the database...');
    const res = await pool.query('SELECT NOW()'); // simple test query
    console.log('✅ Database connected successfully!');
    console.log('Current time in DB:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error(err.message);
  } finally {
    await pool.end(); // close connection
    console.log('🔒 Connection closed');
  }
}

// Run the async function
testConnection();