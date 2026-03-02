import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateResume } from "@/lib/docgen/resume";
import { generateCoverLetter } from "@/lib/docgen/coverLetter";

export async function POST(request: NextRequest) {
  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  try {
    // Generate documents
    const resumeBuffer = await generateResume({
      title: job.title,
      tags: job.tags || [],
    });

    const coverLetterBuffer = await generateCoverLetter({
      title: job.title,
      company: job.company,
      location: job.location,
      tags: job.tags || [],
    });

    const company = job.company.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-");
    const date = new Date().toISOString().split("T")[0];
    const prefix = `${company}-${date}`;

    // Upload to Supabase Storage
    const { error: resumeUploadError } = await supabase.storage
      .from("applications")
      .upload(`${prefix}/resume.docx`, resumeBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (resumeUploadError) throw resumeUploadError;

    const { error: coverUploadError } = await supabase.storage
      .from("applications")
      .upload(`${prefix}/cover-letter.docx`, coverLetterBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (coverUploadError) throw coverUploadError;

    // Create application record
    const { error: appError } = await supabase.from("applications").upsert(
      {
        job_id: jobId,
        resume_url: `${prefix}/resume.docx`,
        cover_letter_url: `${prefix}/cover-letter.docx`,
      },
      { onConflict: "job_id" }
    );

    if (appError) throw appError;

    // Update job status
    await supabase.from("jobs").update({ status: "prepared" }).eq("id", jobId);

    return NextResponse.json({
      success: true,
      resume_url: `${prefix}/resume.docx`,
      cover_letter_url: `${prefix}/cover-letter.docx`,
    });
  } catch (err) {
    console.error("Application generation error:", err);
    return NextResponse.json({ error: "Failed to generate application" }, { status: 500 });
  }
}
