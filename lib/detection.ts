import { callGemini, parseGeminiJson } from "./gemini";
import { DetectionResult } from "./types";

const DETECTION_PROMPT = (input: string) => `Is "${input}" a company/startup/corporation or a financial institution (investment bank, PE firm, VC fund, hedge fund, asset manager)?
Return JSON only:
{
  "type": "company" or "institution",
  "name": "cleaned official name",
  "sector": "detected sector",
  "geography": "detected primary geography",
  "isPublic": true or false,
  "exchange": "NYSE/NASDAQ/LSE/other/unknown",
  "confidence": "high" or "low"
}`;

export async function detectCompanyType(input: string): Promise<DetectionResult> {
  try {
    const raw = await callGemini(DETECTION_PROMPT(input), 15000);
    const result = parseGeminiJson<DetectionResult>(raw);

    // Validate required fields
    if (!result.type || !result.name) throw new Error("Invalid detection response");
    return result;
  } catch (err) {
    console.error("[Detection] Gemini failed, using fallback:", err);
    // Fallback detection — treat as company with low confidence
    return {
      type: "company",
      name: input.trim(),
      sector: "Unknown",
      geography: "Unknown",
      isPublic: false,
      exchange: "unknown",
      confidence: "low",
    };
  }
}
