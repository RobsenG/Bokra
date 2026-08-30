import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/groq";

const MAX_MESSAGE_LENGTH = 500;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` },
        { status: 400 }
      );
    }

    const history: Array<{ role: "user" | "assistant"; content: string }> = Array.isArray(
      conversationHistory
    )
      ? conversationHistory.filter(
          (m) =>
            m &&
            typeof m.role === "string" &&
            typeof m.content === "string" &&
            (m.role === "user" || m.role === "assistant")
        )
      : [];

    const response = await getChatbotResponse(message.trim(), history);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("AI Chatbot API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
