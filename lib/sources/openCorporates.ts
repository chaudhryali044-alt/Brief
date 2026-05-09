import { OpenCorporatesData } from "../types";

const OC_BASE = "https://api.opencorporates.com/v0.4";

export async function fetchOpenCorporates(name: string): Promise<OpenCorporatesData | null> {
  const token = process.env.OPENCORPORATES_API_KEY;
  if (!token) return null;

  try {
    const url = `${OC_BASE}/companies/search?q=${encodeURIComponent(name)}&api_token=${token}&per_page=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const data = await res.json();
    const companies: Record<string, unknown>[] =
      data?.results?.companies ?? [];
    if (!companies.length) return null;

    // Prefer exact name match
    const match = companies.find(
      (c) =>
        String((c.company as Record<string, unknown>)?.name ?? "").toLowerCase() ===
        name.toLowerCase()
    ) ?? companies[0];

    const company = match.company as Record<string, unknown>;

    return {
      jurisdictionCode: (company.jurisdiction_code as string) || "",
      incorporationDate: (company.incorporation_date as string) || null,
      registeredAddress: extractAddress(company),
      status: (company.current_status as string) || null,
      registryUrl:
        (company.opencorporates_url as string) ||
        `https://opencorporates.com/companies/${company.jurisdiction_code}/${company.company_number}`,
    };
  } catch (err) {
    console.error("[OpenCorporates] failed:", err);
    return null;
  }
}

function extractAddress(company: Record<string, unknown>): string | null {
  const addr = company.registered_address as Record<string, unknown> | null;
  if (!addr) return null;
  return [addr.street_address, addr.locality, addr.country]
    .filter(Boolean)
    .join(", ");
}
