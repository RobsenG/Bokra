import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("YOUR_")) return null;
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-2.0-flash" });
}

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith("gsk_stub")) return null;
  return new Groq({ apiKey });
}

// ─── 1. AI Review Summary ──────────────────────────────────────────────────────

export async function generateReviewSummary(
  propertyTitle: string,
  reviews: Array<{ rating: number; comment: string | null; renter: { name: string | null } }>
) {
  if (reviews.length === 0) {
    return "No guest reviews yet. The AI summary will appear once guests post feedback.";
  }

  const prompt = `You are an expert AI host assistant for Bokra Stay, a short-term rental platform in Ethiopia.
Analyze the following reviews for the property "${propertyTitle}" and write a concise, professional 2-3 sentence summary highlighting the guests' experience, key positives, and any common criticisms.

Reviews:
${reviews.map((r, i) => `Review #${i + 1}: Rating: ${r.rating}/5, Comment: "${r.comment || "No comment"}"`).join("\n")}`;

  // Try Gemini first
  const gemini = getGemini();
  if (gemini) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (e) {
      console.error("Gemini review summary error:", e);
    }
  }

  // Fallback: Groq
  const groq = getGroq();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 150,
      });
      return res.choices[0]?.message?.content?.trim() || mockReviewSummary(reviews);
    } catch (e) {
      console.error("Groq review summary error:", e);
    }
  }

  return mockReviewSummary(reviews);
}

function mockReviewSummary(reviews: Array<{ rating: number; comment: string | null }>) {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const comments = reviews.map((r) => r.comment).filter(Boolean).slice(0, 2);
  return `✨ AI Summary (${reviews.length} reviews, ${avg}/5.0 average): Guests generally rate this stay very highly, with ${positiveCount} reviews scoring 4+ stars. Highlighted remarks mention: "${comments.join('", "') || "Excellent hosting and neat rooms."}"`;
}

// ─── 2. AI Chatbot ─────────────────────────────────────────────────────────────

export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  propertiesContext: string
) {
  const systemInstruction = `You are the friendly, helpful Bokra Stay AI Assistant. Bokra Stay is a short-term rental platform in Ethiopia (like Airbnb).
You help renters find properties, recommend listings, and answer questions about the platform (such as payment via Chapa).
Here is the current list of verified properties available:
${propertiesContext}
Format answers with clean Markdown. Be concise, professional, and friendly.`;

  const userMessages = messages.filter((m) => m.role !== "system");
  const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";

  // Try Gemini first
  const gemini = getGemini();
  if (gemini) {
    try {
      // Build Gemini chat history (all messages except the last)
      const history = userMessages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction,
      }).startChat({ history });

      const result = await chat.sendMessage(lastUserMsg);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (e) {
      console.error("Gemini chat error:", e);
    }
  }

  // Fallback: Groq
  const groq = getGroq();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemInstruction }, ...userMessages] as any,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
      });
      return res.choices[0]?.message?.content?.trim() || mockChatResponse(lastUserMsg);
    } catch (e) {
      console.error("Groq chat error:", e);
    }
  }

  return mockChatResponse(lastUserMsg);
}

function mockChatResponse(query: string) {
  const lower = query.toLowerCase();
  if (lower.includes("hawassa")) return "✨ AI Assistant: I found some wonderful lakeside properties in Hawassa! We have options like 'Lake Breeze Villa' and 'Lakeside Studio' with beautiful sunset views. Would you like to explore booking one?";
  if (lower.includes("addis") || lower.includes("bole")) return "✨ AI Assistant: Addis Ababa has premium choices, especially in the Bole area! Our 'Luxury Condo in Bole' is close to cafes and the airport — great for business or leisure.";
  if (lower.includes("hossana") || lower.includes("university")) return "✨ AI Assistant: In Hossana, we have a Cozy Villa in Menaheria and a Modern Apartment near Wachemo University. Let me know if you'd like booking details!";
  if (lower.includes("payment") || lower.includes("chapa") || lower.includes("pay")) return "✨ AI Assistant: Payments on Bokra Stay are processed securely via the Chapa payment gateway. You can pay with credit/debit cards or mobile money. Select your dates and click Reserve to proceed.";
  return "✨ AI Assistant: Hello! I'm your Bokra Stay helper. I can recommend listings in Addis Ababa, Hawassa, or Hossana, and answer questions about bookings and payments. What are you looking for today?";
}

// ─── 3. Natural Language Search ─────────────────────────────────────────────────

export async function parseNaturalLanguageSearch(query: string) {
  const prompt = `You are a search intent parser for Bokra Stay, a short-term rental app in Ethiopia.
Read the user query and extract search parameters. Only respond with a valid JSON object with this exact structure:
{
  "city": string | null,
  "maxPrice": number | null,
  "bedrooms": number | null,
  "amenities": string[]
}
Allowed cities: "Addis Ababa", "Hawassa", "Hossana".
Map amenities to: "WiFi", "Kitchen", "Free Parking", "Hot Water", "Gym", "Pool", "TV", "Workspace".
Return ONLY the JSON object, no markdown, no explanation.

User query: "${query}"`;

  // Try Gemini
  const gemini = getGemini();
  if (gemini) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json|```/g, "").trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini search parse error:", e);
    }
  }

  // Fallback: Groq
  const groq = getGroq();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });
      return JSON.parse(res.choices[0]?.message?.content || "{}");
    } catch (e) {
      console.error("Groq search parse error:", e);
    }
  }

  return mockSearchParse(query);
}

function mockSearchParse(query: string) {
  const lower = query.toLowerCase();
  let city = null;
  if (lower.includes("addis")) city = "Addis Ababa";
  else if (lower.includes("hawassa")) city = "Hawassa";
  else if (lower.includes("hossana")) city = "Hossana";

  let maxPrice = null;
  const priceMatch = lower.match(/(?:under|below|max|budget of)\s*(\d+)/) || lower.match(/(\d+)\s*etb/);
  if (priceMatch) maxPrice = parseFloat(priceMatch[1]);

  let bedrooms = null;
  const bedMatch = lower.match(/(\d+)\s*bedroom/);
  if (bedMatch) bedrooms = parseInt(bedMatch[1], 10);

  const amenities: string[] = [];
  if (lower.includes("wifi") || lower.includes("internet")) amenities.push("WiFi");
  if (lower.includes("kitchen")) amenities.push("Kitchen");
  if (lower.includes("parking")) amenities.push("Free Parking");
  if (lower.includes("hot water")) amenities.push("Hot Water");

  return { city, maxPrice, bedrooms, amenities };
}

// ─── 4. Description Generator ───────────────────────────────────────────────────

export async function generatePropertyDescription(title: string, amenities: string[]) {
  const prompt = `You are a professional listing copywriter for Bokra Stay in Ethiopia.
Write an engaging, high-converting property description (3-4 sentences) for a listing titled: "${title}" with amenities: ${amenities.join(", ") || "comfortable furnishings"}.
Make it sound premium, cozy, and inviting for travelers. Return only the description text, no extra formatting.`;

  // Try Gemini
  const gemini = getGemini();
  if (gemini) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (e) {
      console.error("Gemini description error:", e);
    }
  }

  // Fallback: Groq
  const groq = getGroq();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 200,
      });
      return res.choices[0]?.message?.content?.trim() || mockDescription(title, amenities);
    } catch (e) {
      console.error("Groq description error:", e);
    }
  }

  return mockDescription(title, amenities);
}

function mockDescription(title: string, amenities: string[]) {
  return `Welcome to ${title}! Located in a pleasant neighbourhood, this premium space offers superb comfort and is fully equipped for your short or long-term stay. Guests can enjoy wonderful amenities including: ${amenities.join(", ") || "comfortable furnishings and a high-quality setup"}. Whether you're travelling for business or leisure, our space provides the perfect home-away-from-home experience in Ethiopia.`;
}

// ─── 5. Smart Pricing ──────────────────────────────────────────────────────────

export async function suggestPropertyPrice(
  city: string,
  bedrooms: number,
  bathrooms: number,
  amenities: string[]
) {
  const prompt = `You are a real estate valuation assistant for Bokra Stay in Ethiopia.
Provide a recommended price in Ethiopian Birr (ETB) per night for this property:
- City: ${city}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Amenities: ${amenities.join(", ")}

Respond ONLY with a JSON object (no markdown):
{
  "suggestedPrice": number,
  "rangeMin": number,
  "rangeMax": number,
  "rationale": "1-2 sentences explaining the pricing based on city averages and specs"
}`;

  // Try Gemini
  const gemini = getGemini();
  if (gemini) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json|```/g, "").trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini price error:", e);
    }
  }

  // Fallback: Groq
  const groq = getGroq();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        response_format: { type: "json_object" },
      });
      return JSON.parse(res.choices[0]?.message?.content || "{}");
    } catch (e) {
      console.error("Groq price error:", e);
    }
  }

  return mockPrice(city, bedrooms, amenities);
}

function mockPrice(city: string, bedrooms: number, amenities: string[]) {
  let base = city.toLowerCase().includes("addis") ? 2500 : city.toLowerCase().includes("hawassa") ? 1800 : 1200;
  const suggestedPrice = base + bedrooms * 800 + amenities.length * 100;
  return {
    suggestedPrice,
    rangeMin: Math.round(suggestedPrice * 0.9),
    rangeMax: Math.round(suggestedPrice * 1.1),
    rationale: `Based on location (${city}) and property size (${bedrooms} bedrooms), market rates typically range from ${Math.round(suggestedPrice * 0.9)} to ${Math.round(suggestedPrice * 1.1)} ETB/night.`,
  };
}
