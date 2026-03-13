import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/docgen/coverLetter";
import mammoth from "mammoth";

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
    // Ensure storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "applications")) {
      await supabase.storage.createBucket("applications", { public: false });
    }

    // Generate cover letter
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
    const { error: coverUploadError } = await supabase.storage
      .from("applications")
      .upload(`${prefix}/cover-letter.docx`, coverLetterBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (coverUploadError) throw coverUploadError;

    // Convert DOCX to HTML for inline preview
    const coverLetterHtmlResult = await mammoth.convertToHtml({ buffer: coverLetterBuffer });

    // Upload HTML preview
    const { error: coverHtmlError } = await supabase.storage
      .from("applications")
      .upload(`${prefix}/cover-letter.html`, Buffer.from(coverLetterHtmlResult.value), {
        contentType: "text/html",
        upsert: true,
      });

    if (coverHtmlError) throw coverHtmlError;

    // Create or update application record
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .maybeSingle();

    const appPayload = {
      job_id: jobId,
      cover_letter_url: `${prefix}/cover-letter.docx`,
      cover_letter_html_url: `${prefix}/cover-letter.html`,
    };

    const { error: appError } = existing
      ? await supabase.from("applications").update(appPayload).eq("id", existing.id)
      : await supabase.from("applications").insert(appPayload);

    if (appError) throw appError;

    // Update job status
    await supabase.from("jobs").update({ status: "prepared" }).eq("id", jobId);

    return NextResponse.json({
      success: true,
      cover_letter_url: `${prefix}/cover-letter.docx`,
    });
  } catch (err) {
    console.error("Application generation error:", err);
    return NextResponse.json({ error: "Failed to generate application" }, { status: 500 });
  }
}
