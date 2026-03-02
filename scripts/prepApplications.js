/**
 * Application Prep Script
 * Reads high-scored "new" jobs from Supabase, and generates:
 *   - Tailored resume (.docx) emphasizing relevant skills
 *   - Cover letter draft (.docx) customized per job
 * Uploads docs to Supabase Storage and updates job status → "prepared"
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, HeadingLevel, TabStopType,
  TabStopPosition,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESUME_DATA_PATH = path.join(__dirname, "../templates/resume-base.json");
const APPS_DIR = path.join(__dirname, "../applications");

const MIN_SCORE = 3;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Load Data ──────────────────────────────────────────────────────────────

function loadResume() {
  return JSON.parse(fs.readFileSync(RESUME_DATA_PATH, "utf-8"));
}

// ─── Skill Matching ─────────────────────────────────────────────────────────

function matchSkills(resume, jobTitle, jobTags) {
  const jobText = `${jobTitle} ${Array.isArray(jobTags) ? jobTags.join(" ") : (jobTags || "")}`.toLowerCase();

  // All skills flattened
  const allSkills = Object.values(resume.skills).flat();

  // Score each skill by relevance to this job
  const scored = allSkills.map((skill) => {
    const lower = skill.toLowerCase();
    const inTitle = jobText.includes(lower) ? 2 : 0;
    const inTags = jobText.includes(lower) ? 1 : 0;
    return { skill, score: inTitle + inTags };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    primary: scored.filter((s) => s.score > 0).map((s) => s.skill),
    secondary: scored.filter((s) => s.score === 0).map((s) => s.skill),
  };
}

function matchExperience(resume, jobTitle, jobTags) {
  const jobText = `${jobTitle} ${Array.isArray(jobTags) ? jobTags.join(" ") : (jobTags || "")}`.toLowerCase();

  return resume.experience
    .map((exp) => {
      const expText = `${exp.title} ${exp.highlights.join(" ")}`.toLowerCase();
      let score = 0;
      if (expText.includes("react")) score += 2;
      if (expText.includes("next")) score += 2;
      if (expText.includes("typescript")) score += 1;
      if (expText.includes("graphql")) score += 1;
      if (jobText.includes("senior") && exp.title.toLowerCase().includes("senior")) score += 2;
      return { ...exp, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ─── Document Styles ────────────────────────────────────────────────────────

const FONT = "Arial";
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const docStyles = {
  default: { document: { run: { font: FONT, size: 22 } } },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: FONT },
      paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, bold: true, font: FONT },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 1 },
    },
  ],
};

const pageProps = {
  page: {
    size: { width: 11906, height: 16838 }, // A4
    margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 },
  },
};

// ─── Resume Generator ───────────────────────────────────────────────────────

function generateResume(resume, job) {
  const skills = matchSkills(resume, job.title, job.tags);
  const experience = matchExperience(resume, job.title, job.tags);

  const children = [];

  // Header — Name
  children.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 40 },
    children: [new TextRun({ text: resume.name, bold: true, size: 36, font: FONT })],
  }));

  // Contact line
  const contactParts = [resume.email, resume.phone, resume.location].filter(Boolean);
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: contactParts.join("  |  "), size: 20, color: "555555", font: FONT })],
  }));

  // Divider
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "333333", space: 1 } },
    children: [],
  }));

  // Summary — tailored to job
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun("Summary")],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: `Front-end Web Developer with nine years of professional experience specializing in ${skills.primary.slice(0, 3).join(", ") || "React, TypeScript, and Next.js"}. Team player at home in agile environments with a keen eye for detail, strong communication skills, and the ability to adapt to any project's needs.`,
      size: 22,
    })],
  }));

  // Skills — relevant first
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun("Technology Stack")],
  }));

  const skillCategories = [
    { label: "Languages", items: resume.skills.languages },
    { label: "Frameworks", items: resume.skills.frameworks },
    { label: "Queries", items: resume.skills.queries },
    { label: "Testing", items: resume.skills.testing },
    { label: "Accessibility", items: resume.skills.accessibility },
    { label: "CMS", items: resume.skills.cms },
    { label: "Hosting", items: resume.skills.hosting },
  ];

  for (const cat of skillCategories) {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${cat.label}: `, bold: true, size: 22 }),
        new TextRun({ text: cat.items.join(", "), size: 22 }),
      ],
    }));
  }

  // Experience — sorted by relevance to this job
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300 },
    children: [new TextRun("Professional Experience")],
  }));

  for (const exp of experience) {
    children.push(new Paragraph({
      spacing: { before: 200, after: 40 },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: `${exp.title}, `, bold: true, size: 22 }),
        new TextRun({ text: exp.company, bold: true, size: 22 }),
        new TextRun({ text: `\t${formatDateRange(exp.startDate, exp.endDate)}`, size: 20, color: "555555" }),
      ],
    }));

    for (const h of exp.highlights) {
      children.push(new Paragraph({
        spacing: { after: 40 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: "- ", size: 22 }),
          new TextRun({ text: h, size: 22 }),
        ],
      }));
    }
  }

  // Education
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300 },
    children: [new TextRun("Education")],
  }));

  for (const edu of resume.education) {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${edu.degree}`, bold: true, size: 22 }),
        new TextRun({ text: `, ${edu.institution} (${edu.year})`, size: 22 }),
      ],
    }));
  }

  return new Document({
    styles: docStyles,
    sections: [{ properties: pageProps, children }],
  });
}

function formatDateRange(start, end) {
  const fmt = (d) => {
    if (!d || d === "Present") return "Present";
    const [y, m] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

// ─── Cover Letter Generator ─────────────────────────────────────────────────

function generateCoverLetter(resume, job) {
  const skills = matchSkills(resume, job.title, job.tags);
  const topSkills = skills.primary.length > 0 ? skills.primary.slice(0, 5) : ["React", "TypeScript", "Next.js"];

  const children = [];

  // Header
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: resume.name, bold: true, size: 36, font: FONT })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: `${resume.email}  |  ${resume.phone}`, size: 20, color: "555555" })],
  }));

  // Date
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), size: 22 })],
  }));

  // Greeting
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: `Dear Hiring Team at ${job.company},`, size: 22 })],
  }));

  // Opening
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: `I am writing to express my interest in the ${job.title} position${job.location ? ` based in ${job.location}` : ""}. With nine years of front-end development experience and deep expertise in ${topSkills.slice(0, 3).join(", ")}, I am confident I can make a meaningful contribution to your team.`,
      size: 22,
    })],
  }));

  // Why I'm a fit
  children.push(new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: "Why I'm a strong fit:", bold: true, size: 22 })],
  }));

  const fitPoints = [
    `Proven track record building production applications with ${topSkills.slice(0, 2).join(" and ")} — most recently at Candis where I built UI for their core product with React, TypeScript, and GraphQL.`,
    `Experience working with enterprise clients (Hewlett-Packard, Scotia Bank) and scaling frontend architectures at agencies like Monks.`,
    `Strong focus on quality: I bring expertise in component testing (Cypress, Jest), design systems (Storybook), and WCAG AA accessibility standards.`,
  ];

  for (const point of fitPoints) {
    children.push(new Paragraph({
      spacing: { after: 80 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: "- ", size: 22 }),
        new TextRun({ text: point, size: 22 }),
      ],
    }));
  }

  // Closing
  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({
      text: `I would welcome the opportunity to discuss how my experience can contribute to ${job.company}'s goals. Thank you for considering my application.`,
      size: 22,
    })],
  }));

  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: "Best regards,", size: 22 })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: resume.name, bold: true, size: 22 })],
  }));

  return new Document({
    styles: docStyles,
    sections: [{ properties: pageProps, children }],
  });
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n📝 Application Prep — starting\n");

  // Verify Supabase connection
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase env vars. Check .env.local");
    process.exit(1);
  }

  const resume = loadResume();

  // Query Supabase for eligible jobs: status = 'new' and score >= MIN_SCORE
  const { data: eligible, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "new")
    .gte("score", MIN_SCORE)
    .order("score", { ascending: false });

  if (error) {
    console.error("❌ Supabase query error:", error.message);
    process.exit(1);
  }

  if (!eligible || eligible.length === 0) {
    console.log("ℹ️  No new high-scored jobs to prepare applications for.");
    return;
  }

  console.log(`📋 Found ${eligible.length} jobs with Score >= ${MIN_SCORE} and Status = "new"\n`);

  let prepared = 0;

  for (const job of eligible) {
    const company = (job.company || "unknown").replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-");
    const date = new Date().toISOString().split("T")[0];
    const dirName = `${company}-${date}`;
    const localDir = path.join(APPS_DIR, dirName);
    fs.mkdirSync(localDir, { recursive: true });

    try {
      // Generate tailored resume
      const resumeDoc = generateResume(resume, job);
      const resumeBuf = await Packer.toBuffer(resumeDoc);
      const resumeFileName = `${dirName}/resume.docx`;

      // Generate cover letter
      const coverDoc = generateCoverLetter(resume, job);
      const coverBuf = await Packer.toBuffer(coverDoc);
      const coverFileName = `${dirName}/cover-letter.docx`;

      // Save locally
      fs.writeFileSync(path.join(localDir, "resume.docx"), resumeBuf);
      fs.writeFileSync(path.join(localDir, "cover-letter.docx"), coverBuf);

      // Upload to Supabase Storage
      const { error: resumeUploadErr } = await supabase.storage
        .from("applications")
        .upload(resumeFileName, resumeBuf, {
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          upsert: true,
        });

      if (resumeUploadErr) {
        console.warn(`  ⚠️  Resume upload failed for ${job.company}: ${resumeUploadErr.message}`);
      }

      const { error: coverUploadErr } = await supabase.storage
        .from("applications")
        .upload(coverFileName, coverBuf, {
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          upsert: true,
        });

      if (coverUploadErr) {
        console.warn(`  ⚠️  Cover letter upload failed for ${job.company}: ${coverUploadErr.message}`);
      }

      // Create application record in Supabase
      const { error: appErr } = await supabase.from("applications").insert({
        job_id: job.id,
        resume_url: resumeFileName,
        cover_letter_url: coverFileName,
      });

      if (appErr) {
        console.warn(`  ⚠️  Application record failed for ${job.company}: ${appErr.message}`);
      }

      // Update job status to "prepared"
      const { error: updateErr } = await supabase
        .from("jobs")
        .update({ status: "prepared", notes: `Docs: ${dirName}/` })
        .eq("id", job.id);

      if (updateErr) {
        console.warn(`  ⚠️  Status update failed for ${job.company}: ${updateErr.message}`);
      }

      console.log(`  ✅ ${job.title} @ ${job.company} → ${localDir}`);
      prepared++;
    } catch (err) {
      console.error(`  ❌ Failed: ${job.title} @ ${job.company}: ${err.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Eligible jobs  : ${eligible.length}`);
  console.log(`   Prepared       : ${prepared}`);
  console.log(`   Local output   : applications/`);
  console.log(`   Storage bucket : applications/\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
