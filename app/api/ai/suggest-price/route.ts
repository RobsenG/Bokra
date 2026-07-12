import { NextRequest, NextResponse } from "next/server";
import { suggestPropertyPrice } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { city, bedrooms, bathrooms, amenities } = await req.json();
    if (!city || typeof city !== "string") {
      return NextResponse.json({ error: "Invalid city parameter" }, { status: 400 });
    }

    const amenitiesList = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string"
      ? amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
      : [];

    const numBedrooms = parseInt(bedrooms, 10) || 1;
    const numBathrooms = parseInt(bathrooms, 10) || 1;

    const priceSuggestion = await suggestPropertyPrice(city, numBedrooms, numBathrooms, amenitiesList);

    return NextResponse.json(priceSuggestion);
  } catch (error: any) {
    console.error("AI Price Suggestion API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
