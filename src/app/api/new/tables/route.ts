// app/api/tables/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

// todo: purge

export async function GET() {
  try {
    const tables = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);
    return NextResponse.json(tables.map((row: { table_name: string }) => row.table_name), { status: 200 });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table names' },
      { status: 500 }
    );
  }
}