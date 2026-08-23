import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const suggestSchema = z.object({
  description: z.string().min(5, "Please describe your problem in at least 5 characters").max(500),
});

// Simple in-memory rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (record.count >= 10) return false;
  record.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limit check
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = suggestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { description } = validation.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback: keyword matching without AI
      return NextResponse.json(suggestFromKeywords(description));
    }

    // Fetch active categories from DB
    const supabase = await createClient();
    const { data: categories } = await supabase
      .from("categories")
      .select("name")
      .eq("active", true);

    const categoryList = categories?.map((c) => c.name).join(", ") || "Plumbing, Electrical, Cleaning, Appliances, Painting, Carpentry";

    const prompt = `You are a home services triage assistant for "Fix Mate", an Indian home services marketplace.

Available service categories: ${categoryList}

A customer describes their problem: "${description}"

Return a JSON response with exactly this structure:
{
  "category": "<best matching category name>",
  "confidence": <number between 0 and 1>,
  "suggestion": "<1 sentence suggestion for the customer>"
}

Rules:
- Pick the SINGLE best matching category
- If no category matches well, set confidence below 0.3
- Keep suggestion under 50 words
- Return ONLY valid JSON, no markdown`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      // Fallback to keyword matching
      return NextResponse.json(suggestFromKeywords(description));
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (may have markdown wrapper)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(suggestFromKeywords(description));
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      category: parsed.category || "General",
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      suggestion: parsed.suggestion || "We'll help you find the right professional.",
      source: "ai",
    });
  } catch {
    // Fallback to keyword matching on any error
    const body = await request.clone().json().catch(() => ({ description: "" }));
    return NextResponse.json(suggestFromKeywords(body.description || ""));
  }
}

// Fallback keyword matcher when Gemini is unavailable
function suggestFromKeywords(description: string) {
  const desc = description.toLowerCase();

  const rules: Array<{ keywords: string[]; category: string; suggestion: string }> = [
    { keywords: ["tap", "faucet", "leak", "pipe", "plumb", "drain", "sink", "toilet", "flush", "valve", "water"], category: "Plumbing", suggestion: "A plumber can fix leaks, clogged drains, and pipe issues." },
    { keywords: ["fan", "wire", "electric", "switch", "socket", "light", "wiring", "circuit", "breaker", "power", "inverter"], category: "Electrical", suggestion: "An electrician can handle wiring, switchboard, and power issues." },
    { keywords: ["clean", "dust", "sweep", "mop", "sanitize", "deep clean", "sofa", "carpet", "shampoo", "wash"], category: "Cleaning", suggestion: "Our cleaning pros handle deep cleaning, sofa shampooing, and more." },
    { keywords: ["ac", "refrigerator", "fridge", "washing machine", "appliance", "microwave", "geyser", "cooler", "tv"], category: "Appliances", suggestion: "An appliance technician can repair ACs, fridges, and more." },
    { keywords: ["paint", "wall", "colour", "color", "shade", "interior", "exterior"], category: "Painting", suggestion: "Professional painters can transform your walls with quality finishes." },
    { keywords: ["wood", "furniture", "door", "window", "hinge", "shelf", "table", "chair", "carpent"], category: "Carpentry", suggestion: "A carpenter can fix furniture, doors, and wooden fixtures." },
  ];

  let bestMatch = { category: "General", confidence: 0.1, suggestion: "Describe your issue and we'll match you with the right professional." };

  for (const rule of rules) {
    const matchCount = rule.keywords.filter((kw) => desc.includes(kw)).length;
    if (matchCount > 0) {
      const confidence = Math.min(0.95, 0.4 + matchCount * 0.15);
      if (confidence > bestMatch.confidence) {
        bestMatch = { category: rule.category, confidence, suggestion: rule.suggestion };
      }
    }
  }

  return { ...bestMatch, source: "keyword" };
}
