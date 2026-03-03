# Issue Tracker Report

A Deno CLI that fetches issues from GitLab, Jira, and GitHub and generates an
HTML summary report.

## What it does

1. Fetches all issues you contributed to across configured providers.
2. Normalizes issues into a common format with attribution and impact scoring.
3. Generates a single-page HTML report with:
   - **KPI summary** — completed, active, and blocked issue counts with provider
     breakdown.
   - **Full issue table** — every issue listed with title, description, status,
     and a link back to the source system.
4. Optionally rewrites the executive headline using OpenAI (when
   `OPENAI_API_KEY` is set). Falls back gracefully when the key is missing.

## Setup

```bash
git clone git@github.com:dcrendon/gitlab-issues.git
cd gitlab-issues
cp .env.example .env
```

Edit `.env` with your provider credentials.

## Provider credentials

A provider runs only when **all** required fields are present:

| Provider | Required fields                               |
| -------- | --------------------------------------------- |
| GitLab   | `GITLAB_PAT`, `GITLAB_URL`                    |
| Jira     | `JIRA_PAT`, `JIRA_URL`, `JIRA_USERNAME`       |
| GitHub   | `GITHUB_PAT`, `GITHUB_URL`, `GITHUB_USERNAME` |

Missing providers are skipped. The run fails only when no selected provider is
runnable.

## Usage

```bash
# Interactive (TTY) — launches a short config wizard
deno run main.ts

# Headless (non-TTY) — reads .env only
cat /dev/null | deno run main.ts
```

The wizard lets you pick:

- Time range (week / month / year / custom)
- AI model (only when `OPENAI_API_KEY` is set)

## Outputs

- `output/<provider>_issues.json` — raw fetched issues per provider.
- `output/reports/<date-range>_<providers>-summary.html` — the HTML report.
- `output/reports/<date-range>_<providers>-normalized.json` — normalized issues.

## Exit codes

| Code | Meaning                                        |
| ---- | ---------------------------------------------- |
| 0    | All runnable providers succeeded               |
| 1    | No runnable providers, or all providers failed |
| 2    | Partial success (some providers failed)        |

## Development

```bash
deno task dev    # watch mode
deno task fmt    # format
deno task test   # run tests
```

## Security

- Never commit `.env` or tokens.
- Keep credentials in your local `.env` file.
