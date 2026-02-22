import 'dotenv/config'; // automatically loads .env
import pg from 'pg';

const { Pool } = pg;

// Create a pool with environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

export default pool;