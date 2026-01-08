
import { Pool } from 'pg';
import * as schema from './schema';

const HOST = process.env.DB_HOST;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;

const pool = new Pool({
  host: HOST,
  port: 25060,
  database: 'cryodb',
  user: USERNAME,
  password: PASSWORD,
  ssl: { rejectUnauthorized: false },
});

export async function query(text: string) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, []);
    return res.rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export { pool, schema };