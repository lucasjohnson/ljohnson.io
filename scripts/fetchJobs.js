/**
 * Job Search Automation Script
 * Fetches jobs from Arbeitnow, LinkedIn, and Remotive
 * Filters for: Remote, Berlin, Next.js/React, Visa Sponsorship, English-only
 * Scores jobs 1–5 based on relevance
 * Output: Supabase `jobs` table
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Config ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

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

// ─── Helpers ───────────────────────────────────────────────────────────────

function isTitleMatch(title = "") {
  const lower = title.toLowerCase();
  const hasMatch = TITLE_PATTERNS.some((p) => lower.includes(p));
  const isGerman = GERMAN_MARKERS.some((g) => lower.includes(g));
  return hasMatch && !isGerman;
}

// ─── Source 1: Arbeitnow (Public API) ──────────────────────────────────────

async function fetchArbeitnow() {
  console.log("🔍 Fetching from Arbeitnow...");
  const results = [];
  const MAX_PAGES = 5;

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
          remote: job.remote,
          visa_sponsorship: job.visa_sponsorship ?? false,
          salary: null,
          url: job.url,
          tags: job.tags || [],
          posted_at: typeof job.created_at === "number"
              ? new Date(job.created_at * 1000).toISOString().split("T")[0]
              : job.created_at?.split?.("T")[0] || TODAY,
          fetched_at: TODAY,
        });
      }
    }
    console.log(`  ✅ Arbeitnow: ${results.length} matching jobs`);
  } catch (err) {
    console.error(`  ❌ Arbeitnow error: ${err.message}`);
  }
  return results;
}

// ─── Source 2: LinkedIn (HTML scraping) ─────────────────────────────────────

async function fetchLinkedIn() {
  console.log("🔍 Fetching from LinkedIn...");
  const results = [];

  const queries = [
    "React developer",
    "Next.js developer",
    "Frontend developer",
  ];

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
            posted_at: TODAY,
            fetched_at: TODAY,
          });
        }
      } catch (err) {
        console.warn(`  ⚠️  LinkedIn query failed: ${err.message}`);
      }
    }
  }

  const seen = new Set();
  const unique = results.filter((j) => !seen.has(j.url) && seen.add(j.url));
  console.log(`  ✅ LinkedIn: ${unique.length} matching jobs`);
  return unique;
}

// ─── Source 3: Remotive (Public API) ────────────────────────────────────────

async function fetchRemotive() {
  console.log("🔍 Fetching from Remotive...");
  const results = [];

  for (const term of ["react", "nextjs", "frontend"]) {
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=software-dev&search=${term}`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const job of data.jobs || []) {
        if (!isTitleMatch(job.title)) continue;
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
          posted_at: job.publication_date?.split("T")[0] || TODAY,
          fetched_at: TODAY,
        });
      }
    } catch (err) {
      console.warn(`  ⚠️  Remotive error: ${err.message}`);
    }
  }

  const seen = new Set();
  const unique = results.filter((j) => !seen.has(j.external_id) && seen.add(j.external_id));
  console.log(`  ✅ Remotive: ${unique.length} matching jobs`);
  return unique;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Job search run — ${TODAY}\n`);

  // Verify Supabase connection
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase env vars. Check .env.local");
    process.exit(1);
  }

  const [arbeitnow, linkedin, remotive] = await Promise.all([
    fetchArbeitnow(),
    fetchLinkedIn(),
    fetchRemotive(),
  ]);

  const allFetched = [...arbeitnow, ...linkedin, ...remotive];

  // Deduplicate within the current batch
  const seenIds = new Set();
  const uniqueFetched = allFetched.filter((j) => !seenIds.has(j.external_id) && seenIds.add(j.external_id));

  // Filter out non-remote jobs outside Berlin
  const filtered = uniqueFetched.filter((j) => {
    if (j.remote) return true;
    return (j.location || "").toLowerCase().includes("berlin");
  });

  // Upsert into Supabase (ignoreDuplicates skips existing external_ids)
  let inserted = 0;
  let skipped = 0;

  for (const job of filtered) {
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
        status: "new",
        posted_at: job.posted_at,
        fetched_at: job.fetched_at,
      },
      { onConflict: "external_id", ignoreDuplicates: true }
    );

    if (error) {
      console.warn(`  ⚠️  Upsert failed for ${job.external_id}: ${error.message}`);
      skipped++;
    } else {
      inserted++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total fetched  : ${allFetched.length}`);
  console.log(`   After dedup    : ${uniqueFetched.length}`);
  console.log(`   After filter   : ${filtered.length}`);
  console.log(`   Upserted to DB : ${inserted}`);
  if (skipped > 0) console.log(`   Skipped/errors : ${skipped}`);

  if (filtered.length === 0) {
    console.log("\nℹ️  No new jobs found today.");
  } else {
    console.log("\n🆕 Jobs processed:");
    filtered
      .slice(0, 20)
      .forEach((j) => console.log(`   [${j.source}] ${j.title} @ ${j.company}`));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
