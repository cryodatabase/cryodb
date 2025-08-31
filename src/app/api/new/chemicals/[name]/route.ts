import { PropertiesView } from "@/lib/new/schema";
import { storage } from "@/lib/new/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params}: { params: Promise<{ name: string }> }) {
  try{
    const { name } = await params;

    /*const [e,p]: [CpaChemical | undefined, PropertiesView[] | undefined] = await Promise.all([
      await storage.getChemicalFromName(name),
      await storage.getChemicalPropertiesFromName(name)
    ]);*/
    
    const properties: PropertiesView[] | undefined = await storage.getChemicalPropertiesFromName(name);

    if (!properties) throw new Error();

    return NextResponse.json({ properties });
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