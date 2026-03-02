import { RawJob } from "./types";

const KEYWORDS = ["react", "next.js", "nextjs", "frontend", "front-end"];
const MAX_PAGES = 5;

function matchesKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
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
        if (!matchesKeywords(`${job.title} ${job.description}`)) continue;
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
