import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";
import { generateResumePdf } from "@/lib/docgen/resumePdf";
import mammoth from "mammoth";

const APPLICATIONS_DIR = "/Users/lucasjohnson/Documents/Work/Applications";

export async function POST(request: NextRequest) {
  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("title, company, tags")
    .eq("id", jobId)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("resume_url, cover_letter_url")
    .eq("job_id", jobId)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: "No application found — generate documents first" }, { status: 404 });
  }

  try {
    // Create output directory: {date}-{company}
    const date = new Date().toISOString().split("T")[0];
    const company = job.company.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-");
    const dirName = `${date}-${company}`;
    const outputDir = path.join(APPLICATIONS_DIR, dirName);
    await mkdir(outputDir, { recursive: true });

    // Generate resume PDF
    const resumePdf = await generateResumePdf({
      title: job.title,
      tags: job.tags || [],
    });
    await writeFile(path.join(outputDir, "resume.pdf"), resumePdf);

    // Download cover letter DOCX from storage and convert to text
    const { data: coverBlob } = await supabase.storage
      .from("applications")
      .download(application.cover_letter_url);

    if (!coverBlob) {
      throw new Error("Failed to download cover letter from storage");
    }

    const coverBuffer = Buffer.from(await coverBlob.arrayBuffer());
    const { value: coverText } = await mammoth.extractRawText({ buffer: coverBuffer });
    await writeFile(path.join(outputDir, "cover-letter.txt"), coverText);

    return NextResponse.json({
      success: true,
      path: outputDir,
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ error: "Failed to download documents" }, { status: 500 });
  }
}
