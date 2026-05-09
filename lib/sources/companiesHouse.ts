import { CompaniesHouseData } from "../types";
import { b64 } from "../utils";

const CH_BASE = "https://api.company-information.service.gov.uk";

function chHeaders(): HeadersInit {
  const key = process.env.COMPANIES_HOUSE_API_KEY || "";
  return {
    Authorization: `Basic ${b64(key + ":")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchCompaniesHouse(
  name: string,
  geography: string
): Promise<CompaniesHouseData | null> {
  const isUK = /uk|united kingdom|england|scotland|wales|britain/i.test(geography);
  if (!isUK) return null;
  if (!process.env.COMPANIES_HOUSE_API_KEY) return null;

  try {
    const companyNumber = await searchCompany(name);
    if (!companyNumber) return null;

    const [profile, officers] = await Promise.allSettled([
      fetchProfile(companyNumber),
      fetchOfficers(companyNumber),
    ]);

    if (profile.status === "rejected" || !profile.value) return null;

    return {
      ...profile.value,
      officers:
        officers.status === "fulfilled" ? officers.value : [],
    };
  } catch (err) {
    console.error("[Companies House] failed:", err);
    return null;
  }
}

async function searchCompany(name: string): Promise<string | null> {
  const url = `${CH_BASE}/search/companies?q=${encodeURIComponent(name)}&items_per_page=5`;
  const res = await fetch(url, {
    headers: chHeaders(),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const items: Record<string, unknown>[] = data.items ?? [];
  if (!items.length) return null;

  // Prefer exact name match
  const exact = items.find(
    (i) => String(i.title || "").toLowerCase() === name.toLowerCase()
  );
  const match = exact ?? items[0];
  return (match.company_number as string) || null;
}

async function fetchProfile(
  companyNumber: string
): Promise<Omit<CompaniesHouseData, "officers"> | null> {
  const res = await fetch(`${CH_BASE}/company/${companyNumber}`, {
    headers: chHeaders(),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;

  const d = await res.json();
  const addr = d.registered_office_address ?? {};
  const addressParts = [
    addr.address_line_1,
    addr.address_line_2,
    addr.locality,
    addr.postal_code,
    addr.country,
  ].filter(Boolean);

  return {
    companyNumber,
    name: (d.company_name as string) || "",
    type: (d.type as string) || "",
    dateOfCreation: (d.date_of_creation as string) || "",
    registeredOffice: addressParts.join(", "),
    sicCodes: (d.sic_codes as string[]) || [],
    status: (d.company_status as string) || "",
    profileUrl: `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}`,
  };
}

async function fetchOfficers(
  companyNumber: string
): Promise<CompaniesHouseData["officers"]> {
  const res = await fetch(`${CH_BASE}/company/${companyNumber}/officers?items_per_page=20`, {
    headers: chHeaders(),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];

  const data = await res.json();
  const items: Record<string, unknown>[] = data.items ?? [];

  return items
    .filter((i) => i.resigned_on == null)
    .map((i) => ({
      name: (i.name as string) || "",
      role: (i.officer_role as string) || "",
      appointedOn: (i.appointed_on as string) || "",
    }))
    .slice(0, 8);
}

/** Format Companies House data for the Gemini prompt. */
export function formatCHForPrompt(data: CompaniesHouseData): string {
  const officers = data.officers
    .map((o) => `${o.name} (${o.role}, appointed ${o.appointedOn})`)
    .join("; ");

  return `Companies House Data:
Company: ${data.name} (#${data.companyNumber})
Status: ${data.status} | Type: ${data.type}
Incorporated: ${data.dateOfCreation}
Registered Office: ${data.registeredOffice}
SIC Codes: ${data.sicCodes.join(", ")}
Officers: ${officers || "N/A"}
Profile: ${data.profileUrl}`;
}
