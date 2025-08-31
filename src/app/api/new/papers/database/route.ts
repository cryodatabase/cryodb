// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { storage } from '@/lib/new/storage';
import { Paper } from '@/lib/new/schema';

export async function GET() {
  try {
    //const users = await query('SELECT * FROM papers');
    //return NextResponse.json(users, { status: 200 });
    const papers: Paper[] = await storage.getAllPapers();
    return NextResponse.json(papers, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}