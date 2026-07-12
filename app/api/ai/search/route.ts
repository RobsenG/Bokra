import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageSearch } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query parameter" }, { status: 400 });
    }

    const filters = await parseNaturalLanguageSearch(query);

    return NextResponse.json({ filters });
  } catch (error: any) {
    console.error("AI Search Parse API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
