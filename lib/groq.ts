import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { PLATFORM_FEE_PERCENT } from "@/lib/platform";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("YOUR_")) return null;
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-1.5-flash" });
}

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith("gsk_stub")) return null;
  return new Groq({ apiKey });
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PricingSuggestion {
  suggestedPrice: number;
  minRange: number;
  maxRange: number;
  reasoning: string;
}

// ─── Ethiopian Market Pricing Context ─────────────────────────────────────────

const ETHIOPIAN_PRICING_CONTEXT = `
ETHIOPIAN RENTAL MARKET PRICING GUIDE:

Addis Ababa:
- Studio/1 bedroom (basic): 800 - 1,500 ETB/night
- Studio/1 bedroom (with WiFi, AC): 1,500 - 3,000 ETB/night
- 2-3 bedroom apartment (basic): 1,500 - 2,500 ETB/night
- 2-3 bedroom apartment (premium amenities): 2,500 - 5,000 ETB/night
- House (3+ bedrooms, full amenities): 3,000 - 8,000 ETB/night
- Bole, Kazanchis, Sarbet areas: higher end of range
- Piassa, Mercato, Akaki areas: lower end of range

Major Regional Cities (Hawassa, Dire Dawa, Bahir Dar, Jimma, Adama):
- Studio/1 bedroom: 400 - 800 ETB/night
- 2 bedroom apartment: 600 - 1,200 ETB/night
- 3+ bedroom house: 800 - 1,500 ETB/night
- With premium amenities (AC, WiFi, Hot Water): add 200-400 ETB

University Towns (Hossana, Wachemo area, Ambo, Wolkite, Sodo):
- Studio/1 bedroom (basic): 200 - 500 ETB/night
- 2 bedroom: 400 - 700 ETB/night
- 3+ bedroom: 500 - 900 ETB/night
- Near university campus: slightly higher demand

Small Towns and Rural Areas:
- Studio/1 bedroom: 150 - 400 ETB/night
- 2+ bedroom: 300 - 600 ETB/night
- Basic amenities expected at these prices

Amenity Price Adjustments:
- WiFi: +100-200 ETB depending on city
- AC: +200-400 ETB depending on city
- Parking: +50-100 ETB
- Kitchen: +100-150 ETB
- Hot Water: +50-100 ETB
- Generator/Power backup: +150-200 ETB

IMPORTANT RULES:
- Never suggest below 100 ETB/night (platform minimum)
- Never suggest above 50,000 ETB/night (platform maximum)
- For Hossana and similar university towns: most properties should be 200-800 ETB/night
- For Addis Ababa: range is wider but be realistic
- Always consider the number of bedrooms as main factor
- Round suggestions to nearest 50 ETB for cleanliness
`;

// ─── 1. Smart Pricing Suggestion ─────────────────────────────────────────────

function getMockPricingSuggestion(
  city: string,
  propertyType: string,
  bedrooms: number,
  amenities: string[]
): PricingSuggestion {
  const cityLower = (city || "").toLowerCase();

  let basePrice = 300;

  if (cityLower.includes("addis") || cityLower.includes("addis ababa")) {
    basePrice = 1500;
  } else if (
    cityLower.includes("hawassa") ||
    cityLower.includes("dire dawa") ||
    cityLower.includes("bahir dar") ||
    cityLower.includes("jimma") ||
    cityLower.includes("adama") ||
    cityLower.includes("mekelle")
  ) {
    basePrice = 700;
  } else if (
    cityLower.includes("hossana") ||
    cityLower.includes("wachemo") ||
    cityLower.includes("sodo") ||
    cityLower.includes("wolkite") ||
    cityLower.includes("ambo")
  ) {
    basePrice = 400;
  }

  const bedroomMultiplier = bedrooms <= 1 ? 1 : bedrooms <= 2 ? 1.4 : 1.8;
  const amenityBonus = amenities.length * 50;
  const raw = basePrice * bedroomMultiplier + amenityBonus;
  const suggestedPrice = Math.max(100, Math.min(50000, Math.round(raw / 50) * 50));
  const minRange = Math.max(100, Math.round((suggestedPrice * 0.8) / 50) * 50);
  const maxRange = Math.min(50000, Math.round((suggestedPrice * 1.2) / 50) * 50);

  return {
    suggestedPrice,
    minRange,
    maxRange,
    reasoning: `Based on ${city} market rates for a ${bedrooms}-bedroom ${propertyType} with ${
      amenities.length > 0 ? amenities.slice(0, 2).join(" and ") : "basic amenities"
    }.`,
  };
}

export async function getSmartPricingSuggestion(
  city: string,
  propertyType: string,
  bedrooms: number,
  amenities: string[],
  currentPrice: number
): Promise<PricingSuggestion> {
  const prompt = `You are a real estate pricing expert for Bokra Stay, an Ethiopian short-term rental platform.

A host wants to price their property. Based on the Ethiopian rental market context below, suggest a fair nightly rate.

Property Details:
City: ${city}
Property Type: ${propertyType}
Bedrooms: ${bedrooms}
Amenities: ${amenities.join(", ") || "Basic (no special amenities)"}
Host's current price: ${currentPrice} ETB/night

Ethiopian Market Context:
${ETHIOPIAN_PRICING_CONTEXT}

Respond in this exact JSON format only, no extra text:
{
  "suggestedPrice": 650,
  "minRange": 500,
  "maxRange": 800,
  "reasoning": "Brief 1-2 sentence explanation based on city and amenities"
}

Rules:
- suggestedPrice must be rounded to nearest 50 ETB
- reasoning must mention the city and key factors
- Keep reasoning under 30 words
- Be realistic for Ethiopian market`;

  const gemini = getGemini();
  if (gemini) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      if (parsed.suggestedPrice) {
        const sPrice = Math.max(100, Math.min(50000, Math.round(parsed.suggestedPrice / 50) * 50));
        return {
          suggestedPrice: sPrice,
          minRange: parsed.minRange ? Math.max(100, Math.round(parsed.minRange / 50) * 50) : Math.round((sPrice * 0.8) / 50) * 50,
          maxRange: parsed.maxRange ? Math.min(50000, Math.round(parsed.maxRange / 50) * 50) : Math.round((sPrice * 1.2) / 50) * 50,
          reasoning: parsed.reasoning || `Suggested rate for ${city} based on current market trends.`,
        };
      }
    } catch (e) {
      console.error("Gemini pricing error:", e);
    }
  }

  const groq = getGroq();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
      if (parsed.suggestedPrice) {
        const sPrice = Math.max(100, Math.min(50000, Math.round(parsed.suggestedPrice / 50) * 50));
        return {
          suggestedPrice: sPrice,
          minRange: parsed.minRange ? Math.max(100, Math.round(parsed.minRange / 50) * 50) : Math.round((sPrice * 0.8) / 50) * 50,
          maxRange: parsed.maxRange ? Math.min(50000, Math.round(parsed.maxRange / 50) * 50) : Math.round((sPrice * 1.2) / 50) * 50,
          reasoning: parsed.reasoning || `Suggested rate for ${city} based on current market trends.`,
        };
      }
    } catch (e) {
      console.error("Groq pricing error:", e);
    }
  }

  return getMockPricingSuggestion(city, propertyType, bedrooms, amenities);
}

export async function suggestPropertyPrice(
  city: string,
  bedrooms: number,
  bathrooms: number,
  amenities: string[]
) {
  const suggestion = await getSmartPricingSuggestion(city, "Apartment", bedrooms, amenities, 0);
  return {
    suggestedPrice: suggestion.suggestedPrice,
    rangeMin: suggestion.minRange,
    rangeMax: suggestion.maxRange,
    rationale: suggestion.reasoning,
    minRange: suggestion.minRange,
    maxRange: suggestion.maxRange,
    reasoning: suggestion.reasoning,
  };
}

// ─── 2. AI Chatbot ─────────────────────────────────────────────────────────────

const CHATBOT_SYSTEM_PROMPT = `You are the Bokra Stay AI Assistant — a friendly, helpful, and precise assistant for the Bokra Stay short-term rental platform in Ethiopia.

YOUR PERSONALITY:
- Natural and conversational — like a knowledgeable friend
- Precise — answer exactly what was asked, nothing more
- Warm but professional
- Ethiopian context aware

CRITICAL RULES:
1. Never give the same response twice in a conversation
2. Read the user message carefully and answer ONLY what was asked
3. Keep responses between 2-4 sentences maximum
4. Be conversational and natural, not robotic
5. Never start with "Great question" or "Certainly" or "Of course"
6. If the question is unclear, ask one specific clarifying question
7. Always stay within Bokra Stay topics only

ABOUT BOKRA STAY:
Bokra Stay is an AI-powered short-term home rental platform built for Ethiopia. It connects verified property hosts with renters including students, tourists, business travelers, and families. The platform was built by Information Systems students at Wachemo University, Hossana.

USER ROLES:
- Renter: Can search properties, make bookings, pay via Chapa, leave reviews
- Host: Can list properties, upload documents, manage bookings, withdraw earnings
- Admin: Verifies properties and manages the platform

REGISTRATION & LOGIN:
- Anyone can register as a Renter or Host
- Email and password required
- Must accept Terms & Conditions during registration
- After registration, go to login page to sign in

PROPERTY LISTING (for Hosts):
- Host must complete identity verification before listing (Government ID & live selfie)
- Must upload proof of property ownership for each listing
- Every property goes through admin verification before going live (reviews within 48 hours)

BOOKING (for Renters):
- Must be signed in to book
- Select check-in and check-out dates
- No double bookings — dates are locked after confirmed payment
- Cancellation allowed up to 48 hours before check-in for full refund

PAYMENTS:
- All payments processed through Chapa payment gateway (Telebirr, CBE Birr, cards, bank transfers)
- Payment in Ethiopian Birr (ETB)
- ${PLATFORM_FEE_PERCENT}% platform service fee applies
- Hosts can withdraw earnings anytime (minimum 100 ETB)

PRICING IN ETHIOPIA:
- Addis Ababa: 800 - 5,000 ETB/night
- Regional cities (Hawassa, Bahir Dar): 400 - 1,500 ETB/night
- University towns (Hossana): 200 - 800 ETB/night
- Platform range: 100 - 50,000 ETB/night`;

function getMockChatbotResponse(message: string): string {
  const msg = message.toLowerCase().trim();

  // Booking related
  if (msg.includes("book") || msg.includes("reserv") || msg.includes("stay")) {
    return "To book a property, find one you like on the properties page, pick your dates, and click Reserve. You will be taken to Chapa to complete payment. Once paid, your booking is confirmed instantly.";
  }

  // Cancellation
  if (msg.includes("cancel") || msg.includes("refund")) {
    return "You can cancel a booking up to 48 hours before check-in and get a full refund. Just go to My Bookings and click Cancel. Cancellations within 48 hours of check-in are not refundable.";
  }

  // Payment
  if (msg.includes("pay") || msg.includes("chapa") || msg.includes("payment") || msg.includes("fee")) {
    return "Bokra Stay uses Chapa for secure payments. You can pay with Telebirr, bank card, or bank transfer. A 3% platform fee applies — hosts receive 97% of the booking amount.";
  }

  // Listing a property
  if (
    msg.includes("list") ||
    msg.includes("host") ||
    msg.includes("add property") ||
    msg.includes("my property") ||
    msg.includes("become a host")
  ) {
    return "To list your property, register as a Host, complete identity verification with your ID and a live selfie, then add your property with photos and ownership documents. Admin will verify and approve it within 48 hours.";
  }

  // Withdrawal
  if (msg.includes("withdraw") || msg.includes("earnings") || msg.includes("revenue")) {
    return "Hosts can withdraw their available balance anytime from the Revenue page in the dashboard. Withdrawals are processed automatically. Minimum withdrawal amount is 100 ETB.";
  }

  // Reviews
  if (msg.includes("review") || msg.includes("rating") || msg.includes("feedback")) {
    return "You can leave a review after completing a stay. Go to My Bookings, find the completed booking, and submit your rating and comment. Each stay allows one review.";
  }

  // Verification / documents
  if (
    msg.includes("verify") ||
    msg.includes("document") ||
    msg.includes("id") ||
    msg.includes("passport") ||
    msg.includes("identity")
  ) {
    return "Identity verification requires a valid government ID such as a Kebele ID, Passport, or Driver's License, plus a live selfie. Go to the Verification page in your host dashboard to complete this step.";
  }

  // Pricing
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much") ||
    msg.includes("birr") ||
    msg.includes("etb")
  ) {
    return "Prices depend on the city and property type. In Hossana, expect around 200 to 800 ETB per night. In Addis Ababa, prices typically range from 800 to 5,000 ETB per night.";
  }

  // Registration
  if (
    msg.includes("register") ||
    msg.includes("sign up") ||
    msg.includes("create account") ||
    msg.includes("join")
  ) {
    return "To register, go to the Sign Up page, enter your name, email, and password, choose your role as Renter or Host, and accept the Terms and Conditions. After that, sign in with your credentials.";
  }

  // Search
  if (msg.includes("search") || msg.includes("find") || msg.includes("look for")) {
    return "You can search properties by city, price range, and bedrooms using the filters on the Properties page. You can also use AI search by typing a natural description like quiet studio near university with WiFi.";
  }

  // About Bokra Stay
  if (
    msg.includes("about") ||
    msg.includes("what is bokra") ||
    msg.includes("bokra stay") ||
    msg.includes("platform")
  ) {
    return "Bokra Stay is an AI-powered short-term rental platform built for Ethiopia. It connects verified hosts with renters including students, tourists, and business travelers. Built by Information Systems students at Wachemo University.";
  }

  // Greetings
  if (
    msg.includes("hello") ||
    msg.includes("hi") ||
    msg.includes("hey") ||
    msg.includes("good")
  ) {
    return "Hi there! I am your Bokra Stay assistant. I can help with bookings, property listings, payments, and anything about the platform. What would you like to know?";
  }

  // Safety / trust
  if (msg.includes("safe") || msg.includes("trust") || msg.includes("scam") || msg.includes("fake")) {
    return "Every property on Bokra Stay is verified by our admin team before going live. Hosts must provide identity documents and proof of property ownership. Payments go through Chapa, so your money is always secure.";
  }

  // Admin / support
  if (msg.includes("admin") || msg.includes("support") || msg.includes("contact") || msg.includes("help")) {
    return "For disputes or technical issues, you can contact our support through the platform. Admins review all listings and handle any booking disputes between renters and hosts.";
  }

  // Default — varied responses based on message length
  const defaults = [
    "I can help you with bookings, property listings, payments, and Bokra Stay policies. Could you give me a bit more detail about what you need?",
    "That is a great area to explore on Bokra Stay. Could you tell me more specifically what you are looking for so I can point you in the right direction?",
    "I am here to help with anything related to Bokra Stay. Try asking about booking a property, listing your home, payment methods, or verification steps.",
  ];

  // Pick default based on message length to add variety
  const index = msg.length % defaults.length;
  return defaults[index];
}

export async function getChatbotResponse(
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  if (!message || message.trim().length === 0) {
    return "Please enter a question about Bokra Stay.";
  }

  const userMsg = message.trim();

  const gemini = getGemini();
  if (gemini) {
    try {
      const chat = gemini.startChat({
        systemInstruction: CHATBOT_SYSTEM_PROMPT,
      });
      const result = await chat.sendMessage(userMsg);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (e) {
      console.error("Gemini chatbot error:", e);
    }
  }

  const groq = getGroq();
  if (groq) {
    try {
      const formattedHistory = conversationHistory.map((h) => ({
        role: h.role,
        content: h.content,
      }));
      const res = await groq.chat.completions.create({
        messages: [
          { role: "system", content: CHATBOT_SYSTEM_PROMPT },
          ...formattedHistory,
          { role: "user", content: userMsg },
        ] as any,
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 250,
      });
      const responseContent = res.choices[0]?.message?.content?.trim();
      if (responseContent) return responseContent;
    } catch (e) {
      console.error("Groq chatbot error:", e);
    }
  }

  return getMockChatbotResponse(userMsg);
}

export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  _propertiesContext?: string
) {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
  const history = messages
    .filter((m) => m.role !== "system" && m.content !== lastUserMsg)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return await getChatbotResponse(lastUserMsg, history);
}

// ─── 3. AI Review Summary ──────────────────────────────────────────────────────

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

// ─── 4. Natural Language Search ─────────────────────────────────────────────────

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

// ─── 5. Description Generator ───────────────────────────────────────────────────

export async function generatePropertyDescription(title: string, amenities: string[]) {
  const prompt = `You are a professional listing copywriter for Bokra Stay in Ethiopia.
Write an engaging, high-converting property description (3-4 sentences) for a listing titled: "${title}" with amenities: ${amenities.join(", ") || "comfortable furnishings"}.
Make it sound premium, cozy, and inviting for travelers. Return only the description text, no extra formatting.`;

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
