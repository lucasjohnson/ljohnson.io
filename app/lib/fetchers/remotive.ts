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

export async function fetchRemotive(): Promise<RawJob[]> {
  const results: RawJob[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const term of ["react", "nextjs", "frontend"]) {
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=software-dev&search=${term}`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const job of data.jobs || []) {
        if (!isTitleMatch(job.title)) continue;

        // Extract mailto: email from job description HTML
        const mailtoMatch = (job.description || "").match(/mailto:([^\s"'<>]+)/i);
        const applyEmail = mailtoMatch ? mailtoMatch[1] : undefined;

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
          apply_email: applyEmail,
          apply_subject: applyEmail ? `Application: ${job.title} — Lucas Johnson` : undefined,
        });
      }
    } catch (err) {
      console.warn(`Remotive error: ${(err as Error).message}`);
    }
  }

  const seen = new Set<string>();
  return results.filter((j) => !seen.has(j.external_id) && seen.add(j.external_id));
}
