import { PropertiesView } from "@/lib/database/schema";
import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params}: { params: Promise<{ name: string }> }) {
  try{
    const { name } = await params;

    const properties: PropertiesView[] | undefined = await storage.getChemicalProperties(name);

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