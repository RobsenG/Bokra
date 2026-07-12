import { NextRequest, NextResponse } from "next/server";
import { generatePropertyDescription } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { title, amenities } = await req.json();
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Invalid title parameter" }, { status: 400 });
    }

    const amenitiesList = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string"
      ? amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
      : [];

    const description = await generatePropertyDescription(title, amenitiesList);

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("AI Generate Description API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
