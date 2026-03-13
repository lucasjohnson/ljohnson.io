import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/docgen/coverLetter";

export async function POST(request: NextRequest) {
  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  try {
    const coverLetterText = await generateCoverLetter({
      title: job.title,
      company: job.company,
      location: job.location,
      tags: job.tags || [],
    });

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .maybeSingle();

    const appPayload = {
      job_id: jobId,
      cover_letter_text: coverLetterText,
    };

    const { error: appError } = existing
      ? await supabase.from("applications").update(appPayload).eq("id", existing.id)
      : await supabase.from("applications").insert(appPayload);

    if (appError) throw appError;

    await supabase.from("jobs").update({ status: "prepared" }).eq("id", jobId);

    return NextResponse.json({ success: true, coverLetterText });
  } catch (err) {
    console.error("Application generation error:", err);
    return NextResponse.json({ error: "Failed to generate application" }, { status: 500 });
  }
}
