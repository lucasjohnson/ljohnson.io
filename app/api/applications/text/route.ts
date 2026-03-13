import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: application } = await supabase
    .from("applications")
    .select("cover_letter_text")
    .eq("job_id", jobId)
    .maybeSingle();

  if (!application?.cover_letter_text) {
    return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
  }

  return NextResponse.json({ coverLetterText: application.cover_letter_text });
}
