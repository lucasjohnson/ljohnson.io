import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");
  const doc = request.nextUrl.searchParams.get("doc");

  if (!jobId || !doc || !["resume", "cover-letter"].includes(doc)) {
    return NextResponse.json({ error: "jobId and doc (resume|cover-letter) required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: application } = await supabase
    .from("applications")
    .select("resume_html_url, cover_letter_html_url")
    .eq("job_id", jobId)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const htmlPath = doc === "resume"
    ? application.resume_html_url
    : application.cover_letter_html_url;

  if (!htmlPath) {
    return NextResponse.json({ error: "HTML preview not available" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("applications")
    .download(htmlPath);

  if (error || !data) {
    return NextResponse.json({ error: "Failed to download preview" }, { status: 500 });
  }

  const html = await data.text();
  return NextResponse.json({ html });
}
