import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { scoreJob } from "@/lib/scoring";
import { fetchArbeitnow } from "@/lib/fetchers/arbeitnow";
import { fetchLinkedIn } from "@/lib/fetchers/linkedin";
import { fetchRemotive } from "@/lib/fetchers/remotive";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const today = new Date().toISOString().split("T")[0];

  console.log(`Job fetch started — ${today}`);

  // Fetch from all sources in parallel
  const [arbeitnow, linkedin, remotive] = await Promise.all([
    fetchArbeitnow(),
    fetchLinkedIn(),
    fetchRemotive(),
  ]);

  const allFetched = [...arbeitnow, ...linkedin, ...remotive];

  // Deduplicate within batch
  const seenIds = new Set<string>();
  const unique = allFetched.filter((j) => !seenIds.has(j.external_id) && seenIds.add(j.external_id));

  // Filter: remote or Berlin-based
  const filtered = unique.filter((j) => {
    if (j.remote) return true;
    return j.location.toLowerCase().includes("berlin");
  });

  // Upsert into Supabase
  let inserted = 0;
  for (const job of filtered) {
    const score = scoreJob({
      title: job.title,
      tags: job.tags,
      visa_sponsorship: job.visa_sponsorship,
      location: job.location,
      salary: job.salary,
    });

    const { error } = await supabase.from("jobs").upsert(
      {
        external_id: job.external_id,
        source: job.source,
        title: job.title,
        company: job.company,
        location: job.location,
        remote: job.remote,
        visa_sponsorship: job.visa_sponsorship,
        salary: job.salary,
        tags: job.tags,
        url: job.url,
        score,
        posted_at: job.posted_at,
        fetched_at: today,
        ...(job.apply_email && { apply_email: job.apply_email }),
        ...(job.apply_subject && { apply_subject: job.apply_subject }),
      },
      { onConflict: "external_id", ignoreDuplicates: true }
    );

    if (!error) inserted++;
  }

  const summary = {
    date: today,
    fetched: allFetched.length,
    unique: unique.length,
    filtered: filtered.length,
    inserted,
  };

  console.log("Job fetch summary:", summary);
  return NextResponse.json(summary);
}
