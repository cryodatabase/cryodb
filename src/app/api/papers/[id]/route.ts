import { CryopreservationComponent, Paper } from "@/lib/database/schema";
import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try{
    const { id } = await params;
    const paper: Paper | undefined = await storage.getPaper(id);
    const experiments_formulations_data: CryopreservationComponent[] | undefined = await storage.getPaperExperimentsAndFormulations(id);

    return NextResponse.json({
      paper,
      experiments_formulations_data
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