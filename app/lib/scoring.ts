/**
 * Job relevance scoring — ported from fetchJobs.js
 * Scores a job 1–5 based on weighted criteria.
 */

const TITLE_BONUS = ["senior", "lead", "staff", "principal", "next.js", "nextjs"];
const STACK_TAGS = ["typescript", "tailwind", "graphql", "node", "vercel", "aws", "docker"];

export interface JobData {
  title: string;
  tags: string[];
  visa_sponsorship: boolean;
  location: string;
  salary: string | null;
}

export function scoreJob(job: JobData): number {
  let raw = 0;
  const titleLower = (job.title || "").toLowerCase();
  const tagsLower = (job.tags || []).join(" ").toLowerCase();

  // Title match (0–2)
  const titleHits = TITLE_BONUS.filter((kw) => titleLower.includes(kw)).length;
  raw += Math.min(titleHits, 2);

  // Visa sponsorship (0–1)
  if (job.visa_sponsorship) raw += 1;

  // Location quality (0–1)
  const loc = (job.location || "").toLowerCase();
  if (loc.includes("berlin") || loc.includes("worldwide") || loc.includes("anywhere") || loc.includes("europe")) {
    raw += 1;
  }

  // Salary transparency (0–0.5)
  if (job.salary) raw += 0.5;

  // Stack tags (0–0.5)
  const tagHits = STACK_TAGS.filter((t) => tagsLower.includes(t)).length;
  if (tagHits > 0) raw += 0.5;

  return Math.max(1, Math.min(5, Math.round(raw)));
}
