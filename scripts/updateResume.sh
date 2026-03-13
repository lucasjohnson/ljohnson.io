#!/usr/bin/env bash
# Updates resumeData.ts and coverLetter.ts from the resume PDF.
# Usage: pnpm run update-resume [path-to-pdf]

set -euo pipefail

PDF="${1:-public/Lucas-Johnson-Frontend-Engineer-Resume.pdf}"

if [ ! -f "$PDF" ]; then
  echo "Error: Resume PDF not found at $PDF"
  exit 1
fi

echo "Updating resume data and cover letter from: $PDF"

claude --print -p "
Read the resume PDF at $(pwd)/$PDF and update the following files to match it exactly:

1. app/lib/resumeData.ts — Update all fields (name, email, phone, summary, skills, experience, education) to reflect the CV content. Write for professionalism and impact. Use concise, results-oriented bullet points. Keep the existing TypeScript structure and types intact.

2. app/lib/docgen/coverLetter.ts — Update the fitPoints array and opening paragraph to reflect the updated resume. Reference specific achievements, enterprise clients, and technical skills from the CV. Write for professionalism and impact.

Rules:
- Match job titles, dates, company names, and skills exactly as listed in the CV.
- Preserve the existing code structure, imports, and types.
- Do not add comments, docstrings, or type annotations that aren't already there.
- Do not create new files.
"
