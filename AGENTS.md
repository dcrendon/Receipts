# AGENTS.md

This file defines how AI agents and human contributors should operate in this
repository.

## Project Goal

Build and maintain a Deno CLI that fetches issue activity from GitLab and Jira
and writes JSON output for a selected time range and fetch mode.

## Non-Goals

- Building a hosted service or web UI.
- Persisting data to databases.
- Replacing provider APIs with unofficial scrapers.
- Logging secrets or exposing PATs in output.

## Canonical Commands

- Run CLI: `deno run main.ts`
- Run with watch: `deno task dev`
- Format: `deno task fmt`
- Future test command: `deno test`

When validating changes, run at least `deno task fmt` and a representative CLI
run for the touched provider path.

## Coding Constraints

- Language: TypeScript (Deno runtime).
- Keep changes focused and minimal; avoid broad refactors unless requested.
- Do not log PATs, auth headers, or full secret-bearing config.
- Prefer explicit error handling with actionable messages.
- Keep provider behavior consistent unless a behavior change is required.

## Change Policy

- Keep PRs small and task-scoped.
- Do not modify unrelated files.
- Preserve backwards-compatible CLI behavior unless requested.
- Before merge, validate:
  - Formatting passes (`deno task fmt`).
  - The main flow runs for affected provider(s).
  - Docs are updated for changed flags/env vars/behavior.

## Review Checklist Format

When providing reviews, use this order:

1. Bugs and behavioral regressions.
2. Risks and edge cases.
3. Missing tests or validation gaps.
4. Short summary of change quality and readiness.

