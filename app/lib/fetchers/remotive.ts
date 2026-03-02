import { RawJob } from "./types";

const KEYWORDS = ["react", "next.js", "nextjs", "frontend", "front-end"];

function matchesKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
}

export async function fetchRemotive(): Promise<RawJob[]> {
  const results: RawJob[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const term of ["react", "nextjs", "frontend"]) {
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=software-dev&search=${term}`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const job of data.jobs || []) {
        if (!matchesKeywords(`${job.title} ${job.description}`)) continue;
        results.push({
          external_id: `remotive-${job.id}`,
          source: "Remotive",
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location || "Remote",
          remote: true,
          visa_sponsorship: false,
          salary: job.salary || null,
          url: job.url,
          tags: job.tags || [],
          posted_at: job.publication_date?.split("T")[0] || today,
        });
      }
    } catch (err) {
      console.warn(`Remotive error: ${(err as Error).message}`);
    }
  }

  const seen = new Set<string>();
  return results.filter((j) => !seen.has(j.external_id) && seen.add(j.external_id));
}
