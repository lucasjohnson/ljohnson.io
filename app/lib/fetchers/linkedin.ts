import { RawJob } from "./types";

const TITLE_PATTERNS = [
  "frontend", "front-end", "front end",
  "web developer", "web engineer",
  "react", "next.js", "nextjs",
];
const GERMAN_MARKERS = [
  "entwickler", "softwareentwickler", "webentwickler",
  "(m/w/d)", "(m/w)", "(f/m/d)", "(w/m/d)", "(gn)",
  "und", "für", "gesucht",
];

function isTitleMatch(title: string): boolean {
  const lower = title.toLowerCase();
  const hasMatch = TITLE_PATTERNS.some((p) => lower.includes(p));
  const isGerman = GERMAN_MARKERS.some((g) => lower.includes(g));
  return hasMatch && !isGerman;
}

export async function fetchLinkedIn(): Promise<RawJob[]> {
  const results: RawJob[] = [];
  const today = new Date().toISOString().split("T")[0];

  const queries = ["React developer", "Next.js developer", "Frontend developer"];

  for (const query of queries) {
    for (const start of [0, 25]) {
      try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=Berlin&f_WT=2&start=${start}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
        });
        if (!res.ok) continue;
        const html = await res.text();
        const cards = html.split(/<li\b/i).filter((c) => c.includes("base-search-card"));

        for (const card of cards) {
          const titleMatch = /base-search-card__title[^>]*>([\s\S]*?)<\//i.exec(card);
          const linkMatch = /href="(https:\/\/[a-z]+\.linkedin\.com\/jobs\/view\/[^"?]+)/i.exec(card);
          if (!titleMatch || !linkMatch) continue;

          const title = titleMatch[1].trim();
          if (!isTitleMatch(title)) continue;

          const companyMatch = /base-search-card__subtitle[\s\S]*?<a[^>]*>([\s\S]*?)<\//i.exec(card);
          const locationMatch = /job-search-card__location[^>]*>([\s\S]*?)<\//i.exec(card);
          results.push({
            external_id: `linkedin-${linkMatch[1].split("/").pop()}`,
            source: "LinkedIn",
            title,
            company: companyMatch ? companyMatch[1].trim() : "Unknown",
            location: locationMatch ? locationMatch[1].trim() : "Berlin",
            remote: true,
            visa_sponsorship: false,
            salary: null,
            url: linkMatch[1],
            tags: [],
            posted_at: today,
          });
        }
      } catch (err) {
        console.warn(`LinkedIn query failed: ${(err as Error).message}`);
      }
    }
  }

  const seen = new Set<string>();
  return results.filter((j) => !seen.has(j.url) && seen.add(j.url));
}
