# Receipts

A Deno CLI that aggregates your issue activity across GitLab, Jira, and GitHub,
then generates a self-contained HTML report with an AI narrative — so your
standup actually reflects everything you shipped.

## Quick start

1. Install [Deno 2](https://deno.com/)
2. Get a free [Gemini API key](https://aistudio.google.com/apikey)
3. Copy the example env file and fill it in:

   ```sh
   cp .env.example .env
   ```

4. Open `.env` and set `GEMINI_API_KEY` and credentials for at least one
   provider (see [Configuration](#configuration))
5. Run:

   ```sh
   deno task start
   ```

6. Open the `.html` file written to `output/`

If any credentials are missing when you run, an interactive prompt will ask for
them before the run starts. Values entered there apply to that run only — they
are not saved back to `.env`.

## How it works

1. Fetches issues and comments from one or more providers over a configurable
   time range
2. Normalizes them into a unified format with attribution (authored, assigned,
   commented)
3. Calls the Gemini API to generate a narrative — themes, accomplishments, and a
   standup-ready summary
4. Writes a self-contained HTML report and a normalized JSON file to `output/`

**`GEMINI_API_KEY` is required.** The tool will not run without it.

## Requirements

- [Deno 2](https://deno.com/)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key
  (`GEMINI_API_KEY`)
- Credentials for at least one provider

## Setup

```sh
cp .env.example .env
# Edit .env with your credentials, then:
deno task start

# If your Jira or GitLab instance uses a self-signed certificate:
deno task unsafe
```

## Configuration

All configuration is via `.env`. Copy `.env.example` to get started — comments
in that file explain each field.

| Variable          | Required                 | Description                                                      |
| ----------------- | ------------------------ | ---------------------------------------------------------------- |
| `GEMINI_API_KEY`  | Yes                      | Google AI Studio API key                                         |
| `PROVIDER`        | No                       | `gitlab`, `jira`, `github`, or `all` (default: `all`)            |
| `TIME_RANGE`      | No                       | `week`, `month`, `year`, or `custom` (default: `week`)           |
| `START_DATE`      | When `TIME_RANGE=custom` | Start date — `MM-DD-YYYY`                                        |
| `END_DATE`        | When `TIME_RANGE=custom` | End date — `MM-DD-YYYY`                                          |
| `GITLAB_PAT`      | GitLab                   | Personal access token — requires `read_api` scope                |
| `GITLAB_URL`      | GitLab                   | Instance URL (e.g. `https://gitlab.com`)                         |
| `JIRA_PAT`        | Jira                     | Personal access token — inherits your user's project permissions |
| `JIRA_URL`        | Jira                     | Instance URL (e.g. `https://jira.example.com`)                   |
| `JIRA_USERNAME`   | Jira                     | Your Jira username, used to filter issues you were involved in   |
| `GITHUB_PAT`      | GitHub                   | Personal access token — requires `repo` scope                    |
| `GITHUB_URL`      | GitHub                   | API URL (default: `https://api.github.com`)                      |
| `GITHUB_USERNAME` | GitHub                   | Your GitHub username, used to filter issues you were involved in |

**Provider selection:** when `PROVIDER=all`, a provider runs only if all its
required fields are present. Providers with missing credentials are skipped
automatically — you don't need to remove them from `.env`.

## Output

Files are written to `output/` and named by date range and provider:

- `<start>_to_<end>_<providers>-summary.html` — open in any browser
- `<start>_to_<end>_<providers>-normalized.json` — normalized issue data

Each run replaces the previous output files.

## Report sections

1. **Header** — date range, provider badges, generated timestamp
2. **AI Narrative** — themes, accomplishments, and standup summary from Gemini
3. **KPI Cards** — total issues by state (completed / active / blocked) and by
   provider
4. **Activity Timeline** — comment activity grouped by date, sorted newest first
5. **Issues by Project** — cards grouped by project with state badge, labels,
   assignees, and description excerpt

## Troubleshooting

**A provider is being skipped** The interactive prompt shows a provider
readiness table before running. If a provider shows `skipping`, check that all
its required fields are set in `.env` (see [Configuration](#configuration)).

**The report is empty or missing issues** Issues are filtered to ones you were
directly involved in (author, assignee, or commenter). If the time range doesn't
overlap with your activity, the report will be sparse. Try a wider range:
`TIME_RANGE=month`.

**SSL / certificate errors on internal instances** Use `deno task unsafe`
instead of `deno task start`. This disables certificate verification and is
intended for self-hosted Jira or GitLab instances with self-signed certificates.

**Exit codes**

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| 0    | All runnable providers succeeded                                 |
| 1    | No runnable providers, config error, or missing `GEMINI_API_KEY` |
| 2    | Partial success — some providers failed                          |
