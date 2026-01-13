import { storage } from "@/lib/database/storage";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const numericString = z.string().regex(/^-?\d+(\.\d+)?$/);

export async function GET(req: NextRequest, { params }: { params: Promise<{ chemicalId: string }>}) {
    try {
        const { searchParams } = new URL(req.url);
        const { chemicalId } = await params;
        const passedPage = searchParams.get("page");
        const passedLimit = searchParams.get("limit");

        const parsedChemicalId = z.string().safeParse(chemicalId)
        const parsedPage = numericString.safeParse(passedPage);
        const parsedLimit = numericString.safeParse(passedLimit);

        if (!parsedChemicalId.success || !parsedPage.success || !parsedLimit.success) {
            return NextResponse.json(
                { error: "Invalid page or limit" },
                { status: 400 }
            );
        }

        const page = Number(parsedPage.data);
        const limit = Math.min(Number(parsedLimit.data), 36);

        const data = await storage.getChemicalFormulations(parsedChemicalId.data, page, limit);
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}