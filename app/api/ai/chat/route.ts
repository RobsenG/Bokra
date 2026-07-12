import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateChatResponse } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Fetch verified properties as context for LLaMA recommendations
    let properties: any[] = [];
    try {
      properties = await prisma.property.findMany({
        where: { isVerified: true, isAvailable: true },
        select: {
          title: true,
          city: true,
          pricePerNight: true,
          bedrooms: true,
          bathrooms: true,
          amenities: true,
        },
        take: 10,
      });
    } catch (dbErr) {
      console.error("Failed to load properties for AI chat context:", dbErr);
    }

    const propertiesContext =
      properties.length > 0
        ? properties
            .map(
              (p) =>
                `- "${p.title}" in ${p.city}: ${p.bedrooms} BR / ${p.bathrooms} BA, Price: ${p.pricePerNight} ETB/night. Amenities: ${p.amenities.join(", ")}`
            )
            .join("\n")
        : "No properties currently available on Bokra Stay.";

    const reply = await generateChatResponse(messages, propertiesContext);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
