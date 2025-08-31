import { NextResponse } from 'next/server';
import { storage } from '@/lib/new/storage'; // Adjust path to where DatabaseStorage is exported
import { Paper } from '@/lib/new/schema'; // Adjust path to schema types

// GET /api/search?query=<search-term>
export async function GET(request: Request) {
  try {
    // Extract query parameter from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    // Use DatabaseStorage to search papers
    const papers: Paper[] = await storage.searchPapers(query);

    /*// Transform papers to a simplified response format
    const results = papers.map((paper) => ({
      id: paper.id,
      title: paper.title,
      paper_id: paper.paper_id,
      experiments: paper.cpa_facts_json?.experiments?.map((exp) => ({
        label: exp.label,
        method: exp.method,
        quote: exp.quote,
        biological_context: exp.biological_context,
      })) || [],
      formulations: paper.cpa_facts_json?.formulations?.map((form) => ({
        label: form.label,
        components: form.components.map((comp) => ({
          label: comp.label,
          role: comp.role,
          amount: comp.amount,
          unit: comp.unit,
        })),
      })) || [],
    }));*/

    // Return results as JSON
    return NextResponse.json({
      success: true,
      data: papers,
      count: papers.length,
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