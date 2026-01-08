/*import { CryopreservationComponent, Paper } from "@/lib/database/schema";
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
}*/

import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";




/*
try {
      const paperId = req.params.paperId;
      const paper = await storage.getPaperByPaperId(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to get paper" });
    }
*/

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const { id } = await params;
    const paper = await storage.getPaper(id);
    const experimentsAndFormulations = await storage.getPaperExperimentsAndFormulations(id);

    console.log(paper);
    if (!paper) {
      return NextResponse.json({ message: "Paper not found" }, { status: 404 });
    };

    return NextResponse.json({ paper, experiments_formulations_data: experimentsAndFormulations });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}