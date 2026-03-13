import Anthropic from "@anthropic-ai/sdk";
import { resumeData } from "../resumeData";

interface JobInfo {
  title: string;
  company: string;
  location: string;
  tags: string[];
}

export async function generateCoverLetter(job: JobInfo): Promise<string> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Write a professional cover letter for the following job application. Return ONLY the cover letter text — no markdown, no subject line, no extra formatting.

Applicant:
- Name: ${resumeData.name}
- Email: ${resumeData.email}
- Phone: ${resumeData.phone}
- Summary: ${resumeData.summary}
- Key skills: ${Object.values(resumeData.skills).flat().join(", ")}
- Most recent role: ${resumeData.experience[0].title} at ${resumeData.experience[0].company} (${resumeData.experience[0].startDate} – ${resumeData.experience[0].endDate})
- Recent highlights: ${resumeData.experience[0].highlights.join("; ")}
- Previous role: ${resumeData.experience[1].title} at ${resumeData.experience[1].company} — ${resumeData.experience[1].highlights.join("; ")}

Job:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || "Remote"}
- Tags: ${job.tags.join(", ") || "N/A"}

Guidelines:
- Write 3–4 concise paragraphs
- Open with genuine interest in the role, not "I am writing to express my interest"
- Highlight 2–3 specific achievements from the applicant's experience that are most relevant to this role
- Reference the company by name and connect skills to their likely needs
- Close with a confident, professional sign-off
- Tone: professional, direct, and personable — no filler, no clichés
- Do NOT use placeholder brackets or template language`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response from Claude");
  return block.text;
}
