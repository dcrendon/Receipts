import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  buildReportSummary,
  buildRunReport,
  normalizeProviderIssues,
} from "../../reporting/reporting.ts";

Deno.test("normalizeProviderIssues normalizes all providers", () => {
  const gitlab = normalizeProviderIssues("gitlab", [{
    id: 1,
    iid: 10,
    title: "GL issue",
    state: "opened",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-02T00:00:00Z",
    author: { username: "gl-user" },
    assignees: [{ username: "gl-assignee" }],
    labels: ["bug"],
    notes: [{ id: 1 }],
  }]);

  const jira = normalizeProviderIssues("jira", [{
    id: "20",
    key: "J-1",
    fields: {
      summary: "Jira issue",
      status: { name: "Done" },
      created: "2026-02-01T00:00:00Z",
      updated: "2026-02-03T00:00:00Z",
      reporter: { displayName: "jira-user" },
      assignee: { displayName: "jira-assignee" },
      labels: ["ops"],
    },
    notes: [{ id: "n1" }, { id: "n2" }],
  }]);

  const github = normalizeProviderIssues("github", [{
    id: 3,
    number: 99,
    title: "GH issue",
    state: "open",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-04T00:00:00Z",
    user: { login: "gh-user" },
    assignees: [{ login: "gh-assignee" }],
    labels: [{ name: "enhancement" }],
    comments: 3,
  }]);

  assertEquals(gitlab[0].provider, "gitlab");
  assertEquals(jira[0].provider, "jira");
  assertEquals(github[0].provider, "github");
  assertEquals(github[0].commentCount, 3);
});

Deno.test("buildReportSummary aggregates counts and labels", () => {
  const summary = buildReportSummary([
    {
      id: "a",
      provider: "gitlab",
      sourceId: "1",
      key: "GL-1",
      title: "A",
      state: "open",
      createdAt: "2026-02-01T00:00:00Z",
      updatedAt: "2026-02-01T00:00:00Z",
      assignees: [],
      labels: ["bug"],
      commentCount: 0,
    },
    {
      id: "b",
      provider: "github",
      sourceId: "2",
      key: "GH-2",
      title: "B",
      state: "closed",
      createdAt: "2026-02-01T00:00:00Z",
      updatedAt: "2026-02-03T00:00:00Z",
      assignees: [],
      labels: ["bug", "ops"],
      commentCount: 0,
    },
  ]);

  assertEquals(summary.totalIssues, 2);
  assertEquals(summary.byProvider.gitlab, 1);
  assertEquals(summary.byProvider.github, 1);
  assertEquals(summary.byState.open, 1);
  assertEquals(summary.topLabels[0].label, "bug");
  assertEquals(summary.latestUpdated[0].key, "GH-2");
});

Deno.test("buildRunReport creates markdown with provider sections", () => {
  const report = buildRunReport(
    {
      github: [{
        id: 3,
        number: 99,
        title: "GH issue",
        state: "open",
        created_at: "2026-02-01T00:00:00Z",
        updated_at: "2026-02-04T00:00:00Z",
        user: { login: "gh-user" },
      }],
    },
    {
      startDate: "2026-02-01T00:00:00Z",
      endDate: "2026-02-16T23:59:59Z",
      fetchMode: "all_contributions",
    },
  );

  assertEquals(report.normalizedIssues.length, 1);
  assertStringIncludes(report.markdown, "## By Provider");
  assertStringIncludes(report.markdown, "GitHub");
});
