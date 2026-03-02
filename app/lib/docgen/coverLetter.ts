import {
  Document, Packer, Paragraph, TextRun, BorderStyle,
} from "docx";
import { resumeData } from "../resumeData";

const FONT = "Arial";

interface JobInfo {
  title: string;
  company: string;
  location: string;
  tags: string[];
}

export async function generateCoverLetter(job: JobInfo): Promise<Buffer> {
  const topSkills = Object.values(resumeData.skills).flat()
    .filter((s) => `${job.title} ${job.tags.join(" ")}`.toLowerCase().includes(s.toLowerCase()))
    .slice(0, 3);
  if (topSkills.length === 0) topSkills.push("React", "TypeScript", "Next.js");

  const children: Paragraph[] = [];

  // Header
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: resumeData.name, bold: true, size: 36, font: FONT })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: `${resumeData.email}  |  ${resumeData.phone}`, size: 20, color: "555555" })],
  }));

  // Date
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))],
  }));

  // Greeting
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun(`Dear Hiring Team at ${job.company},`)],
  }));

  // Opening
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun(
      `I am writing to express my interest in the ${job.title} position${job.location ? ` based in ${job.location}` : ""}. With nine years of front-end development experience and deep expertise in ${topSkills.join(", ")}, I am confident I can make a meaningful contribution to your team.`
    )],
  }));

  // Why I'm a fit
  children.push(new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: "Why I'm a strong fit:", bold: true })],
  }));

  const fitPoints = [
    `Proven track record building production applications with ${topSkills.slice(0, 2).join(" and ")} \u2014 most recently at Candis where I built UI for their core product with React, TypeScript, and GraphQL.`,
    "Experience working with enterprise clients (Hewlett-Packard, Scotia Bank) and scaling frontend architectures at agencies like Monks.",
    "Strong focus on quality: I bring expertise in component testing (Cypress, Jest), design systems (Storybook), and WCAG AA accessibility standards.",
  ];

  for (const point of fitPoints) {
    children.push(new Paragraph({
      spacing: { after: 80 },
      indent: { left: 360 },
      children: [new TextRun("- "), new TextRun(point)],
    }));
  }

  // Closing
  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun(`I would welcome the opportunity to discuss how my experience can contribute to ${job.company}'s goals. Thank you for considering my application.`)],
  }));
  children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun("Best regards,")] }));
  children.push(new Paragraph({ children: [new TextRun({ text: resumeData.name, bold: true })] }));

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 } } },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
