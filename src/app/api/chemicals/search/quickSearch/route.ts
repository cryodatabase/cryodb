import { NextResponse } from 'next/server';
import { storage } from '@/lib/database/storage'; 

// GET /api/search?query=<search-term>
export async function GET(request: Request) {
  try {
    // Extract query parameter from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    const chemicalResults = await storage.searchChemicals(query);


    const response = chemicalResults.slice(0, 6).map((chemical) => ({
      preferred_name: chemical.preferred_name,
      chemical_id: chemical.id
    }));

    // Return results as JSON
    return NextResponse.json({
      response
    }, { status: 200 });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}