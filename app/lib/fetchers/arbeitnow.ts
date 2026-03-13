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
const MAX_PAGES = 5;

function isTitleMatch(title: string): boolean {
  const lower = title.toLowerCase();
  const hasMatch = TITLE_PATTERNS.some((p) => lower.includes(p));
  const isGerman = GERMAN_MARKERS.some((g) => lower.includes(g));
  return hasMatch && !isGerman;
}

export async function fetchArbeitnow(): Promise<RawJob[]> {
  const results: RawJob[] = [];
  const today = new Date().toISOString().split("T")[0];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?remote=1&page=${page}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const jobs = data.data || [];
      if (jobs.length === 0) break;

      for (const job of jobs) {
        if (!isTitleMatch(job.title)) continue;
        results.push({
          external_id: `arbeitnow-${job.slug}`,
          source: "Arbeitnow",
          title: job.title,
          company: job.company_name,
          location: job.location,
          remote: !!job.remote,
          visa_sponsorship: !!job.visa_sponsorship,
          salary: null,
          url: job.url,
          tags: job.tags || [],
          posted_at: typeof job.created_at === "number"
            ? new Date(job.created_at * 1000).toISOString().split("T")[0]
            : job.created_at?.split?.("T")[0] || today,
        });
      }
    }
  } catch (err) {
    console.error(`Arbeitnow error: ${(err as Error).message}`);
  }
  return results;
}
