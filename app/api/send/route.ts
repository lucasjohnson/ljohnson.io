import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { resumeData } from "@/lib/resumeData";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { jobId, recipientEmail } = await request.json();

  if (!jobId || !recipientEmail) {
    return NextResponse.json({ error: "jobId and recipientEmail are required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch job + application
  const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  const { data: application } = await supabase.from("applications").select("*").eq("job_id", jobId).single();

  if (!job || !application) {
    return NextResponse.json({ error: "Job or application not found. Generate documents first." }, { status: 404 });
  }

  try {
    // Download docs from Supabase Storage
    const { data: resumeData_ } = await supabase.storage
      .from("applications")
      .download(application.resume_url);

    const { data: coverData } = await supabase.storage
      .from("applications")
      .download(application.cover_letter_url);

    if (!resumeData_ || !coverData) {
      return NextResponse.json({ error: "Failed to download documents" }, { status: 500 });
    }

    const resumeBuffer = Buffer.from(await resumeData_.arrayBuffer());
    const coverBuffer = Buffer.from(await coverData.arrayBuffer());

    // Send email via Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: `${resumeData.name} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: [recipientEmail],
      subject: `Application: ${job.title} — ${resumeData.name}`,
      html: `
        <p>Dear Hiring Team,</p>
        <p>Please find attached my application for the <strong>${job.title}</strong> position at <strong>${job.company}</strong>.</p>
        <p>I have included my resume and cover letter for your review. I would welcome the opportunity to discuss how my experience can contribute to your team.</p>
        <p>Best regards,<br/>${resumeData.name}<br/>${resumeData.email}<br/>${resumeData.phone}</p>
      `,
      attachments: [
        {
          filename: `Resume-${resumeData.name.replace(/\s/g, "_")}.docx`,
          content: resumeBuffer,
        },
        {
          filename: `Cover-Letter-${job.company.replace(/\s/g, "_")}.docx`,
          content: coverBuffer,
        },
      ],
    });

    if (emailError) throw emailError;

    // Update job status
    await supabase.from("jobs").update({
      status: "sent",
      applied_at: new Date().toISOString(),
    }).eq("id", jobId);

    // Update application
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
