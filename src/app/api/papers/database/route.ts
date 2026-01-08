// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { storage } from '@/lib/database/storage';
import { Paper } from '@/lib/database/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "36");
    
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Invalid page or limit parameters" },
        { status: 400 }
      );
    }

    const papers: Paper[] = await storage.getAllPapers();

    const skip = (page - 1) * limit;
    const paginatedResult = papers.slice(skip, skip + limit);
    
    // Calculate total pages
    const totalItems = papers.length;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: paginatedResult,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}