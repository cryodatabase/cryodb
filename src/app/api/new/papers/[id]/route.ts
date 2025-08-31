import { Paper } from "@/lib/new/schema";
import { storage } from "@/lib/new/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try{
    const { id } = await params;
    console.log(id);
    const paper: Paper | undefined = await storage.getPaperById(id);
    console.log(paper);

    return NextResponse.json({
      paper
    });

  } catch (err) {

    console.log(err);
    return NextResponse.json(
      { 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}