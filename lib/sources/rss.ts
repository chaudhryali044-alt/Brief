import { RssFeedItem } from "../types";

const RSS_FEEDS = [
  { url: "https://feeds.reuters.com/reuters/businessNews", source: "Reuters" },
  { url: "https://www.businesswire.com/rss/home/?rss=g7", source: "BusinessWire" },
  { url: "https://www.prnewswire.com/rss/news-releases-list.rss", source: "PRNewswire" },
];

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export async function fetchRssFeeds(name: string): Promise<RssFeedItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => parseFeed(feed.url, feed.source, name))
  );

  const items: RssFeedItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  // Sort by date descending, limit to 10 total
  return items
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 10);
}

async function parseFeed(
  url: string,
  source: string,
  name: string
): Promise<RssFeedItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Brief-Intelligence/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = extractItems(xml, source);

    const nameLower = name.toLowerCase();
    const cutoff = Date.now() - NINETY_DAYS_MS;

    return items
      .filter((item) => {
        const matchesName =
          item.title.toLowerCase().includes(nameLower) ||
          item.description.toLowerCase().includes(nameLower);
        const withinWindow =
          !item.pubDate || new Date(item.pubDate).getTime() > cutoff;
        return matchesName && withinWindow;
      })
      .slice(0, 10);
  } catch (err) {
    console.error(`[RSS] failed for ${url}:`, err);
    return [];
  }
}

function extractItems(xml: string, source: string): RssFeedItem[] {
  const items: RssFeedItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link") || extractTag(block, "guid");
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");

    if (title && link) {
      items.push({
        title: stripCdata(title),
        url: stripCdata(link).trim(),
        pubDate: pubDate ? stripCdata(pubDate) : "",
        source,
        description: stripCdata(description || "").slice(0, 300),
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1] : "";
}

function stripCdata(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}
