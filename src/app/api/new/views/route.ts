// app/api/active-users/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

// todo: purge

export async function GET() {
  try {
    //const rows = await query('SELECT * FROM v_cpa_properties');

    const rows = await query('SELECT * FROM v_cpa_properties');
    

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching view data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch view data' },
      { status: 500 }
    );
  }
}