import { storage } from "@/lib/database/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const filters = await request.json();
    console.log(filters);
    
    if (!filters || !Array.isArray(filters)) {
      return NextResponse.json(
        { message: "Filters array is required" },
        { status: 400 }
      );
    };

    const chemicals = await storage.filterChemicalsByProperties(filters);
    return NextResponse.json(
      chemicals,
      { status: 400 }
    );
  } catch (err) {
    console.error("Filter chemicals error:", err);

    return NextResponse.json({
      message: "Failed to filter chemicals",
    }, { status: 500 });
  };
};
