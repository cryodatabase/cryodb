/*// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export async function query(text: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export default pool;*/

/*
import { Pool } from 'pg';

const HOST = process.env.HOST;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

// Use the new PostgreSQL credentials
const pool = new Pool({
  host: HOST,
  port: 25060,
  database: 'cryodb',
  user: USERNAME,
  password: PASSWORD,
  ssl: { rejectUnauthorized: false }
});

export async function query(text: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export default pool;*/

import { Pool } from 'pg';
import * as schema from './schema';

const HOST = process.env.HOST;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

// Configure the PostgreSQL connection pool
const pool = new Pool({
  host: HOST,
  port: 25060,
  database: 'cryodb',
  user: USERNAME,
  password: PASSWORD,
  ssl: { rejectUnauthorized: false },
});

//export async function query(text: string, params: any[] = []) {
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

// Export the pool and schema for use in the application
export { pool, schema };