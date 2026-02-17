# GitLab, Jira & GitHub Issue Fetcher

A Deno terminal app that fetches issues from GitLab, Jira, and GitHub and
produces JSON + report artifacts.

## What changed

- Runtime config is now `.env + TUI` only.
- CLI flags and subcommands were removed.
- App entrypoint is always:

```bash
deno run main.ts
```

- In interactive terminals, the TUI wizard runs.
- In non-interactive environments (CI/scripts), the app runs headless from
  `.env` values only.

## Provider readiness

A provider is runnable only when all required credentials are available.

- GitLab: `GITLAB_PAT` + `GITLAB_URL`
- Jira: `JIRA_PAT` + `JIRA_URL` + `JIRA_USERNAME`
- GitHub: `GITHUB_PAT` + `GITHUB_URL` + `GITHUB_USERNAME`

If a provider is missing required fields, it is skipped. The run fails only when
no selected provider is runnable.

## Setup

```bash
git clone git@github.com:dcrendon/gitlab-issues.git
cd gitlab-issues
cp .env.example .env
```

Edit `.env` with provider credentials and optional runtime settings.

## Usage

```bash
# Interactive (TTY): launches TUI wizard
deno run main.ts

# Headless (non-TTY): reads .env only
# example:
cat /dev/null | deno run main.ts
```

## TUI behavior

The wizard lets you configure:

- provider scope (`gitlab`, `jira`, `github`, `all`)
- time range and fetch mode
- report profile/format/AI narrative mode
- missing provider credentials (optional prompt to enter now)

After prompts, the wizard prints provider readiness and runs only ready
providers.

## Outputs

- Provider JSON files in `output/` (`gitlab_issues.json`, `jira_issues.json`,
  `github_issues.json`, depending on runnable providers)
- Report artifacts in `output/reports/`

## Exit codes

- `0`: all runnable providers succeeded
- `1`: no runnable providers, or all runnable providers failed
- `2`: partial success across runnable providers

## Development commands

```bash
deno task dev
deno task fmt
deno task test
```

## Security notes

- Never commit `.env` or tokens.
- Keep credentials in local `.env`.
