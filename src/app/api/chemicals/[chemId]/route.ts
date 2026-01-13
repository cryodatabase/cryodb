import { PropertiesView } from "@/lib/database/schema";
import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ chemId: string }> }) {
  try{
    const { chemId } = await params;

    const [
      properties,
      synonyms,
      papersAndExperiments,
    ] = await Promise.all([
      storage.getChemicalProperties(chemId),
      storage.getChemicalNames(chemId),
      storage.getChemicalPapersAndExperiments(chemId),
    ]);

    if (!properties) throw new Error();

    return NextResponse.json({ properties, synonyms, papersAndExperiments });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to fetch chemical"
      },
      { status: 500 }
    );
  }
}