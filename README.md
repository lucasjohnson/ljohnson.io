# 🔍 Job Search Automation

Automated job scraper that runs every weekday and updates `jobs/jobs.json` with fresh **remote, Berlin-based, React/Next.js** roles — filtered for **English-only** listings and **visa sponsorship** where available.

## Sources

| Platform | Method | Visa Filter | Salary |
|---|---|---|---|
| [Arbeitnow](https://www.arbeitnow.com) | Public API ✅ | ✅ Yes | ❌ |
| [Wellfound](https://wellfound.com) | HTML scrape | Partial | ✅ Yes |
| [EnglishJobs.de](https://www.englishjobs.de) | HTML scrape | ❌ | ❌ |
| [LinkedIn](https://linkedin.com/jobs) | RSS feed | ❌ | ❌ |

## Setup

### 1. Fork / clone this repo to your GitHub account

### 2. Enable GitHub Actions
Go to your repo → **Actions** tab → Enable workflows.

### 3. No secrets needed!
All sources are scraped publicly. No API keys required.

### 4. Run manually anytime
Go to **Actions → 🔍 Daily Job Search → Run workflow**.

## Schedule

Runs **Monday–Friday at 9:00 AM Berlin time** (8:00 UTC).

## Output

All jobs are saved to `jobs/jobs.json` with this structure:

```json
[
  {
    "id": "arbeitnow-senior-react-developer-berlin",
    "source": "Arbeitnow",
    "title": "Senior React Developer",
    "company": "Acme GmbH",
    "location": "Berlin (Remote)",
    "remote": true,
    "visa_sponsorship": true,
    "salary": null,
    "url": "https://...",
    "tags": ["react", "typescript", "remote"],
    "posted_at": "2025-03-01",
    "fetched_at": "2025-03-02"
  }
]
```

## Run locally

```bash
npm run fetch
```

## Filters applied

- Keywords: `react`, `next.js`, `nextjs`, `frontend`, `front-end`
- Location: Berlin / Remote
- Deduplication: Jobs are never added twice (tracked by `id`)
- History: Keeps up to 500 most recent listings
