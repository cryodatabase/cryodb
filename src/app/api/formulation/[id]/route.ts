import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const detail = await storage.getFormulationDetail(id);
    return NextResponse.json(detail);
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