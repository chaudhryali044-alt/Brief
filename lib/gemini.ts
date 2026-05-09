const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

/**
 * Call Gemini 2.0 Flash with a text prompt.
 * Returns the raw text response.
 * Retries once after 5 s if rate limited (429).
 */
export async function callGemini(prompt: string, timeoutMs = 30000): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  };

  async function attempt(): Promise<Response> {
    return fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  }

  let res = await attempt();

  // Rate limit — retry once after 5 s
  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    res = await attempt();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

/** Parse a JSON string returned by Gemini, stripping markdown code fences if present. */
export function parseGeminiJson<T>(raw: string): T {
  // Strip ```json … ``` or ``` … ``` wrappers Gemini sometimes adds
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
