import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import ContactEmail from "@/emails/ContactEmail";
import ContactConfirmEmail from "@/emails/ContactConfirmEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromAddress = `Lucas Johnson <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`;

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    const [notification, confirmation] = await Promise.all([
      resend.emails.send({
        from: fromAddress,
        to: ["hello@ljohnson.io"],
        replyTo: email,
        subject: `Contact from ${name}`,
        react: ContactEmail({ name, email, message }),
      }),
      resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: "Thanks for reaching out",
        react: ContactConfirmEmail({ name, message }),
      }),
    ]);

    if (notification.error) {
      return NextResponse.json({ error: notification.error.message }, { status: 500 });
    }
    if (confirmation.error) {
      console.error("Confirmation email failed:", confirmation.error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
