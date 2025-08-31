import { NextResponse } from "next/server";
import { storage } from "@/lib/new/storage";

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

    // Calculate skip value
    const skip = (page - 1) * limit;

    const chemicals = await storage.getAllChemicals();
    
    // Apply pagination
    const paginatedResult = chemicals.slice(skip, skip + limit);
    
    // Calculate total pages
    const totalItems = chemicals.length;
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
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { 
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}