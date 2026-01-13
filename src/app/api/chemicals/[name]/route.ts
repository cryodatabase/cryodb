import { PropertiesView } from "@/lib/database/schema";
import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try{
    const { name: id } = await params;

    /*const properties = await storage.getChemicalProperties(id);
    const synonyms = await storage.getChemicalNames(id);
    const papersAndExperiments = await storage.getChemicalPapersAndExperiments(id);
    const formulations = await storage.getChemicalFormulations(id);*/

    const [
  properties,
  synonyms,
  papersAndExperiments,
  formulations,
] = await Promise.all([
  storage.getChemicalProperties(id),
  storage.getChemicalNames(id),
  storage.getChemicalPapersAndExperiments(id),
  storage.getChemicalFormulations(id),
]);

    if (!properties) throw new Error();

    return NextResponse.json({ properties, synonyms, papersAndExperiments, formulations });
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