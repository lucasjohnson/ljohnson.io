import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { resumeData } from "@/lib/resumeData";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { jobId, recipientEmail } = await request.json();

  if (!jobId || !recipientEmail) {
    return NextResponse.json({ error: "jobId and recipientEmail are required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  const { data: application } = await supabase.from("applications").select("cover_letter_text").eq("job_id", jobId).single();

  if (!job || !application?.cover_letter_text) {
    return NextResponse.json({ error: "Job or cover letter not found. Generate cover letter first." }, { status: 404 });
  }

  try {
    const coverLetterHtml = application.cover_letter_text
      .split("\n\n")
      .map((p: string) => `<p>${p}</p>`)
      .join("");

    const resumePath = path.join(process.cwd(), "public", "Lucas-Johnson-Frontend-Engineer-Resume.pdf");
    const resumeBuffer = await readFile(resumePath);

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: `${resumeData.name} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: [recipientEmail],
      subject: job.apply_subject || `Application: ${job.title} — ${resumeData.name}`,
      html: coverLetterHtml,
      attachments: [
        {
          filename: `Resume-${resumeData.name.replace(/\s/g, "_")}.pdf`,
          content: resumeBuffer,
        },
      ],
    });

    if (emailError) throw emailError;

    await supabase.from("jobs").update({
      status: "sent",
      applied_at: new Date().toISOString(),
    }).eq("id", jobId);

    await supabase.from("applications").update({
      email_sent_at: new Date().toISOString(),
      recipient_email: recipientEmail,
    }).eq("job_id", jobId);

    return NextResponse.json({ success: true, emailId: emailResult?.id });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
