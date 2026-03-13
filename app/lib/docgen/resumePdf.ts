import PDFDocument from "pdfkit";
import { resumeData } from "../resumeData";

interface JobInfo {
  title: string;
  tags: string[];
}

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) => {
    if (!d || d === "Present") return "Present";
    const [y, m] = d.split("-");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function matchSkills(jobTitle: string, jobTags: string[]): string[] {
  const jobText = `${jobTitle} ${jobTags.join(" ")}`.toLowerCase();
  const allSkills = Object.values(resumeData.skills).flat();
  return allSkills
    .map((skill) => ({ skill, score: jobText.includes(skill.toLowerCase()) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.skill);
}

function sortExperience(jobTitle: string) {
  const jobText = jobTitle.toLowerCase();
  return [...resumeData.experience].sort((a, b) => {
    const scoreA = a.highlights.filter((h) => jobText.split(" ").some((w) => h.toLowerCase().includes(w))).length;
    const scoreB = b.highlights.filter((h) => jobText.split(" ").some((w) => h.toLowerCase().includes(w))).length;
    return scoreB - scoreA;
  });
}

const BULLET_SIZE = 3.5;
const BULLET_INDENT = 24;
const TEXT_INDENT = 40;

function drawBullet(doc: InstanceType<typeof PDFDocument>, x: number, y: number) {
  doc.save();
  doc.rect(x, y + 4, BULLET_SIZE, BULLET_SIZE).fill("#333333");
  doc.restore();
}

function bulletItem(doc: InstanceType<typeof PDFDocument>, text: string, pageWidth: number, margins: { left: number; right: number }) {
  const textX = margins.left + TEXT_INDENT;
  const maxWidth = pageWidth - margins.left - margins.right - TEXT_INDENT;
  const bulletX = margins.left + BULLET_INDENT - BULLET_SIZE - 4;

  drawBullet(doc, bulletX, doc.y);
  doc.font("Times-Roman").fontSize(11).text(text, textX, doc.y, { width: maxWidth });
  doc.moveDown(0.15);
}

export async function generateResumePdf(job: JobInfo): Promise<Buffer> {
  const skills = matchSkills(job.title, job.tags);
  const experience = sortExperience(job.title);
  const topSkills = skills.slice(0, 3).join(", ") || "React, TypeScript, and Next.js";

  const LEFT = 60;
  const RIGHT = 60;
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: LEFT, right: RIGHT },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pageWidth = doc.page.width;
  const margins = { left: LEFT, right: RIGHT };

  // --- Header ---
  doc.font("Times-Bold").fontSize(24).fillColor("#333333").text(resumeData.name);
  doc.moveDown(0.1);
  doc.font("Times-Roman").fontSize(11).text(resumeData.email);
  doc.font("Times-Roman").fontSize(11).text(resumeData.phone);
  doc.moveDown(0.8);

  // --- Summary (no heading) ---
  doc.font("Times-Roman").fontSize(11).fillColor("#333333")
    .text(`I am a Front-end Web Developer with nine years of professional experience specializing in ${topSkills}. I am a team player who is at home in agile environments, has a keen eye for detail, strong communication skills, and who is able to adjust to the needs of any project.`, {
      lineGap: 2,
    });
  doc.moveDown(0.8);

  // --- Education ---
  doc.font("Times-Bold").fontSize(16).text("Education");
  doc.moveDown(0.4);
  for (const edu of resumeData.education) {
    bulletItem(doc, `${edu.degree}, ${edu.institution} (${edu.year})`, pageWidth, margins);
  }
  doc.moveDown(0.6);

  // --- Technology Stack ---
  doc.font("Times-Bold").fontSize(16).text("Technology Stack");
  doc.moveDown(0.4);
  const categories = [
    { label: "Languages", items: resumeData.skills.languages },
    { label: "Frameworks", items: resumeData.skills.frameworks },
    { label: "Queries", items: resumeData.skills.queries },
    { label: "Testing and visual regression", items: resumeData.skills.testing },
    { label: "Accessibility", items: resumeData.skills.accessibility },
    { label: "Headless CMS", items: resumeData.skills.cms },
    { label: "Hosting", items: resumeData.skills.hosting },
  ];
  for (const cat of categories) {
    bulletItem(doc, `${cat.label}: ${cat.items.join(", ")}`, pageWidth, margins);
  }
  doc.moveDown(0.6);

  // --- Professional Experience ---
  doc.font("Times-Bold").fontSize(16).text("Professional Experience");
  doc.moveDown(0.5);

  for (const exp of experience) {
    // Title bold, comma, then company underlined
    doc.font("Times-Bold").fontSize(11).text(`${exp.title}, `, { continued: true });
    doc.font("Times-Bold").text(exp.company, { underline: true, continued: false });

    // Date range in italics
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    doc.font("Times-Italic").fontSize(11).text(dateStr);
    doc.moveDown(0.25);

    for (const h of exp.highlights) {
      bulletItem(doc, h, pageWidth, margins);
    }
    doc.moveDown(0.5);
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
