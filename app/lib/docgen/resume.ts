import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle, HeadingLevel,
  TabStopType, TabStopPosition,
} from "docx";
import { resumeData } from "../resumeData";

interface JobInfo {
  title: string;
  tags: string[];
}

const FONT = "Arial";

const docStyles = {
  default: { document: { run: { font: FONT, size: 22 } } },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: FONT },
      paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 0 },
    },
  ],
};

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) => {
    if (!d || d === "Present") return "Present";
    const [y, m] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
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

export async function generateResume(job: JobInfo): Promise<Buffer> {
  const skills = matchSkills(job.title, job.tags);
  const experience = sortExperience(job.title);
  const topSkills = skills.slice(0, 3).join(", ") || "React, TypeScript, and Next.js";

  const children: Paragraph[] = [];

  // Header
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: resumeData.name, bold: true, size: 36, font: FONT })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: `${resumeData.email}  |  ${resumeData.phone}  |  ${resumeData.location}`, size: 20, color: "555555" })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "333333", space: 1 } },
    children: [],
  }));

  // Summary
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Summary")] }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: `Front-end Web Developer with nine years of professional experience specializing in ${topSkills}. Team player at home in agile environments with a keen eye for detail, strong communication skills, and the ability to adapt to any project's needs.`,
    })],
  }));

  // Skills
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Technology Stack")] }));
  const categories = [
    { label: "Languages", items: resumeData.skills.languages },
    { label: "Frameworks", items: resumeData.skills.frameworks },
    { label: "Queries", items: resumeData.skills.queries },
    { label: "Testing", items: resumeData.skills.testing },
    { label: "Accessibility", items: resumeData.skills.accessibility },
    { label: "CMS", items: resumeData.skills.cms },
    { label: "Hosting", items: resumeData.skills.hosting },
  ];
  for (const cat of categories) {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${cat.label}: `, bold: true }),
        new TextRun(cat.items.join(", ")),
      ],
    }));
  }

  // Experience
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300 }, children: [new TextRun("Professional Experience")] }));
  for (const exp of experience) {
    children.push(new Paragraph({
      spacing: { before: 200, after: 40 },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: `${exp.title}, `, bold: true }),
        new TextRun({ text: exp.company, bold: true }),
        new TextRun({ text: `\t${formatDateRange(exp.startDate, exp.endDate)}`, size: 20, color: "555555" }),
      ],
    }));
    for (const h of exp.highlights) {
      children.push(new Paragraph({
        spacing: { after: 40 },
        indent: { left: 360 },
        children: [new TextRun("- "), new TextRun(h)],
      }));
    }
  }

  // Education
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300 }, children: [new TextRun("Education")] }));
  for (const edu of resumeData.education) {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: edu.degree, bold: true }),
        new TextRun(`, ${edu.institution} (${edu.year})`),
      ],
    }));
  }

  const doc = new Document({
    styles: docStyles,
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 } } },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
