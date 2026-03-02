import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, TabStopType,
  TabStopPosition, LevelFormat,
} from "docx";
import fs from "fs";

// ─── Resume Data ─────────────────────────────────────────────────────────────

const resume = {
  name: "Lucas Johnson",
  email: "contact@lucasjohnson.co.nz",
  phone: "+49 174 9242825",
  location: "Berlin, Germany",
  nationality: "New Zealand",
  summary:
    "Front-end Web Developer with nine years of professional experience building performant, accessible web applications. Specializing in React, Next.js, and TypeScript with a strong focus on design systems, testing, and WCAG compliance. Team player at home in agile environments with a keen eye for detail and strong communication skills.",
  skills: [
    { label: "Languages", items: "JavaScript, TypeScript" },
    { label: "Frameworks", items: "React, Next.js, Redux, Gatsby" },
    { label: "Data & APIs", items: "GraphQL, Prisma, REST" },
    { label: "Testing & QA", items: "Cypress, Jest, Storybook, Visual Regression" },
    { label: "Accessibility", items: "WCAG 2.0 AA, Cross-browser (IE11+)" },
    { label: "CMS", items: "Prismic, Netlify CMS, Adobe Experience Manager" },
    { label: "DevOps & Hosting", items: "Vercel, Netlify, AWS, Docker, CI/CD" },
    { label: "Design Tools", items: "Sketch, Zeplin, Figma" },
  ],
  experience: [
    {
      title: "Front-end Developer",
      company: "Candis",
      location: "Berlin, Germany",
      dates: "Apr 2022 \u2013 Sep 2024",
      highlights: [
        "Built UI for the production application with React, TypeScript, and GraphQL",
        "Developed and maintained the internal design system used across all product and marketing surfaces",
        "Collaborated closely with design to brainstorm, prototype, and test new UI components",
        "Authored component and E2E tests with Cypress; used Storybook for visual regression testing",
      ],
    },
    {
      title: "Senior Front-end Developer",
      company: "Monks (formerly MediaMonks)",
      location: "Remote",
      dates: "Sep 2019 \u2013 May 2022",
      highlights: [
        "Built enterprise websites with TypeScript and Adobe Experience Manager for Hewlett-Packard and Scotia Bank",
        "Created analytics data layers for Adobe Tag Manager (Cineplex)",
        "Ensured WCAG 2.0 AA compliance and cross-browser support to IE11",
        "Deployed production builds to AWS",
      ],
    },
    {
      title: "Freelance Front-end Developer & Designer",
      company: "Self-employed",
      location: "Toronto, Canada",
      dates: "Feb 2019 \u2013 Aug 2019",
      highlights: [
        "Delivered React/Redux web applications for Telus and Longos",
        "Created UX/UI designs with Sketch and Zeplin",
        "Built Gatsby sites with Netlify CMS and GraphQL integration",
      ],
    },
    {
      title: "Front-end Web Developer",
      company: "Thinkingbox",
      location: "Toronto, Canada",
      dates: "Feb 2017 \u2013 Oct 2018",
      highlights: [
        "Built React/Redux websites for Paramount Films and Alberta Health Services",
        "Managed CMS integrations (WordPress, Prismic) and Shopify templates",
        "Deployed to AWS and Digital Ocean",
      ],
    },
    {
      title: "Front-end Web Developer",
      company: "Nurun (now Publicis Sapient)",
      location: "Toronto, Canada",
      dates: "Oct 2015 \u2013 Jan 2017",
      highlights: [
        "Converted Photoshop design comps to responsive HTML/JS templates",
        "Wrote mobile-first layouts with CSS, Bootstrap, Gulp, and Grunt",
        "Integrated builds into WordPress and Kentico CMS backends",
      ],
    },
  ],
  education: [
    {
      degree: "Full Stack Web Development",
      institution: "Bitmaker Labs, Toronto, Canada",
      year: "2015",
    },
    {
      degree: "BFA with Distinction, Photography & Media Studies",
      institution: "OCAD University, Toronto, Canada",
      year: "2015",
    },
  ],
  languages: [
    { lang: "English", level: "Native" },
    { lang: "German", level: "Basic (A2)" },
  ],
};

// ─── Style Constants ─────────────────────────────────────────────────────────

const FONT = "Arial";
const ACCENT = "2E5090"; // Professional dark blue
const LIGHT_BG = "F2F6FA"; // Very light blue-gray for sidebar
const TEXT_COLOR = "333333";
const SUBTLE = "666666";

const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// A4 dimensions
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN_TOP = 720;
const MARGIN_BOTTOM = 720;
const MARGIN_LEFT = 900;
const MARGIN_RIGHT = 900;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // ~10106

// Two-column layout: left sidebar (personal info) + right main content
const LEFT_COL = 2800;
const RIGHT_COL = CONTENT_WIDTH - LEFT_COL; // ~7306

// ─── Helper Functions ────────────────────────────────────────────────────────

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 4 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: FONT, color: ACCENT }),
    ],
  });
}

function labelValue(label, value) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 18, font: FONT, color: SUBTLE }),
      new TextRun({ text: value, size: 18, font: FONT, color: TEXT_COLOR }),
    ],
  });
}

function experienceBlock(exp) {
  const rows = [];

  // Title + dates row
  rows.push(new Paragraph({
    spacing: { before: 200, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun({ text: exp.title, bold: true, size: 21, font: FONT, color: TEXT_COLOR }),
      new TextRun({ text: `\t${exp.dates}`, size: 18, font: FONT, color: SUBTLE }),
    ],
  }));

  // Company + location
  rows.push(new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${exp.company}`, size: 19, font: FONT, color: ACCENT }),
      new TextRun({ text: ` | ${exp.location}`, size: 18, font: FONT, color: SUBTLE }),
    ],
  }));

  // Highlights
  for (const h of exp.highlights) {
    rows.push(new Paragraph({
      spacing: { after: 40 },
      numbering: { reference: "bullets", level: 0 },
      children: [new TextRun({ text: h, size: 19, font: FONT, color: TEXT_COLOR })],
    }));
  }

  return rows;
}

// ─── Build Document ──────────────────────────────────────────────────────────

async function main() {
  const children = [];

  // ===== HEADER: Name + Title =====
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: resume.name, bold: true, size: 44, font: FONT, color: ACCENT }),
    ],
  }));

  children.push(new Paragraph({
    spacing: { after: 20 },
    children: [
      new TextRun({ text: "Senior Front-end Web Developer", size: 24, font: FONT, color: SUBTLE }),
    ],
  }));

  // Contact info line
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: `${resume.email}  \u2022  ${resume.phone}  \u2022  ${resume.location}`, size: 18, font: FONT, color: SUBTLE }),
    ],
  }));

  // Divider
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 1 } },
    children: [],
  }));

  // ===== PERSONAL DETAILS (German-style) =====
  children.push(sectionHeading("Personal Details"));

  const detailsTable = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [2400, CONTENT_WIDTH - 2400],
    rows: [
      ["Full Name", resume.name],
      ["Email", resume.email],
      ["Phone", resume.phone],
      ["Location", resume.location],
      ["Nationality", resume.nationality],
    ].map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 2400, type: WidthType.DXA },
            margins: { top: 40, bottom: 40, left: 0, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: 19, font: FONT, color: SUBTLE })],
            })],
          }),
          new TableCell({
            borders: noBorders,
            width: { size: CONTENT_WIDTH - 2400, type: WidthType.DXA },
            margins: { top: 40, bottom: 40, left: 0, right: 0 },
            children: [new Paragraph({
              children: [new TextRun({ text: value, size: 19, font: FONT, color: TEXT_COLOR })],
            })],
          }),
        ],
      })
    ),
  });
  children.push(detailsTable);

  // ===== PROFILE / SUMMARY =====
  children.push(sectionHeading("Profile"));
  children.push(new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: resume.summary, size: 20, font: FONT, color: TEXT_COLOR })],
  }));

  // ===== TECHNOLOGY STACK =====
  children.push(sectionHeading("Technology Stack"));

  const skillsTable = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [2400, CONTENT_WIDTH - 2400],
    rows: resume.skills.map((s) =>
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 2400, type: WidthType.DXA },
            margins: { top: 30, bottom: 30, left: 0, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: s.label, bold: true, size: 19, font: FONT, color: SUBTLE })],
            })],
          }),
          new TableCell({
            borders: noBorders,
            width: { size: CONTENT_WIDTH - 2400, type: WidthType.DXA },
            margins: { top: 30, bottom: 30, left: 0, right: 0 },
            children: [new Paragraph({
              children: [new TextRun({ text: s.items, size: 19, font: FONT, color: TEXT_COLOR })],
            })],
          }),
        ],
      })
    ),
  });
  children.push(skillsTable);

  // ===== PROFESSIONAL EXPERIENCE =====
  children.push(sectionHeading("Professional Experience"));

  for (const exp of resume.experience) {
    children.push(...experienceBlock(exp));
  }

  // ===== EDUCATION =====
  children.push(sectionHeading("Education"));

  for (const edu of resume.education) {
    children.push(new Paragraph({
      spacing: { before: 80, after: 20 },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: edu.degree, bold: true, size: 20, font: FONT, color: TEXT_COLOR }),
        new TextRun({ text: `\t${edu.year}`, size: 18, font: FONT, color: SUBTLE }),
      ],
    }));
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: edu.institution, size: 19, font: FONT, color: SUBTLE })],
    }));
  }

  // ===== LANGUAGES =====
  children.push(sectionHeading("Languages"));

  const langTable = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [2400, CONTENT_WIDTH - 2400],
    rows: resume.languages.map((l) =>
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 2400, type: WidthType.DXA },
            margins: { top: 30, bottom: 30, left: 0, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: l.lang, bold: true, size: 19, font: FONT, color: TEXT_COLOR })],
            })],
          }),
          new TableCell({
            borders: noBorders,
            width: { size: CONTENT_WIDTH - 2400, type: WidthType.DXA },
            margins: { top: 30, bottom: 30, left: 0, right: 0 },
            children: [new Paragraph({
              children: [new TextRun({ text: l.level, size: 19, font: FONT, color: SUBTLE })],
            })],
          }),
        ],
      })
    ),
  });
  children.push(langTable);

  // ===== BUILD DOCUMENT =====
  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 20 } } },
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 420, hanging: 260 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/sessions/focused-pensive-wozniak/mnt/Jobs/Lucas_Johnson_CV_German_Format.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`CV written to: ${outputPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
