import { NextRequest, NextResponse } from "next/server";
import { getSmartPricingSuggestion } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, propertyType, bedrooms, amenities, currentPrice } = body;

    if (!city || typeof city !== "string" || city.trim() === "") {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }
    if (!bedrooms && bedrooms !== 0) {
      return NextResponse.json({ error: "Bedrooms count is required" }, { status: 400 });
    }

    const amenitiesList: string[] = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string"
      ? amenities
          .split(",")
          .map((a: string) => a.trim())
          .filter(Boolean)
      : [];

    const numBedrooms = Math.max(1, parseInt(String(bedrooms), 10) || 1);
    const numCurrentPrice = parseFloat(String(currentPrice)) || 0;
    const resolvedPropertyType = typeof propertyType === "string" && propertyType.trim() ? propertyType.trim() : "Apartment";

    const suggestion = await getSmartPricingSuggestion(
      city.trim(),
      resolvedPropertyType,
      numBedrooms,
      amenitiesList,
      numCurrentPrice
    );

    return NextResponse.json(suggestion);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("AI Price Suggestion API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
