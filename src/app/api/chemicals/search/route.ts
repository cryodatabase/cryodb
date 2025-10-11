import { NextResponse } from 'next/server';
import { storage } from '@/lib/database/storage';
import { CpaChemical } from '@/lib/database/schema';
import autoComplete, { AutoCompleteResult } from './autocomplete';

// GET /api/search?query=<search-term>
export async function GET(request: Request) {
  try {
    // Extract query parameter from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    const [chemicalResults, autoCompleteRes]: [CpaChemical[] | undefined, AutoCompleteResult] = await Promise.all([
      storage.searchChemicals(query),
      autoComplete(query)
    ]);

    const secondarySearch = chemicalResults.length === 0 && autoCompleteRes.closest_match
      ? await storage.searchChemicals(autoCompleteRes.closest_match) 
      : undefined;

    const results = secondarySearch || chemicalResults;

    // Return results as JSON
    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      autoComplete: {
        did_you_mean: autoCompleteRes.autocomplete,
        did_you_mean_href: encodeURIComponent(autoCompleteRes.autocomplete)
      }
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