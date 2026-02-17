import { assertEquals } from "@std/assert";
import { Config } from "../../shared/types.ts";
import { GitHubAdapter } from "../../providers/github_adapter.ts";
import { GitLabAdapter } from "../../providers/gitlab_adapter.ts";
import { JiraAdapter } from "../../providers/jira_adapter.ts";

const baseConfig = (overrides: Partial<Config> = {}): Config => {
  return {
    provider: "gitlab",
    outFile: "issues.json",
    timeRange: "week",
    fetchMode: "all_contributions",
    ...overrides,
  };
};

Deno.test("GitLabAdapter canRun/getOutFile follow provider selection", () => {
  const adapter = new GitLabAdapter();
  assertEquals(adapter.canRun(baseConfig({ provider: "gitlab" })), true);
  assertEquals(adapter.canRun(baseConfig({ provider: "all" })), true);
  assertEquals(adapter.canRun(baseConfig({ provider: "jira" })), false);
  assertEquals(
    adapter.getOutFile(baseConfig({ provider: "all", outFile: "custom.json" })),
    "output/gitlab_issues.json",
  );
});

Deno.test("JiraAdapter canRun/getOutFile follow provider selection", () => {
  const adapter = new JiraAdapter();
  assertEquals(adapter.canRun(baseConfig({ provider: "jira" })), true);
  assertEquals(adapter.canRun(baseConfig({ provider: "all" })), true);
  assertEquals(adapter.canRun(baseConfig({ provider: "gitlab" })), false);
  assertEquals(
    adapter.getOutFile(baseConfig({ provider: "all", outFile: "custom.json" })),
    "output/jira_issues.json",
  );
});

Deno.test("GitHubAdapter canRun/getOutFile follow provider selection", () => {
  const adapter = new GitHubAdapter();
  assertEquals(adapter.canRun(baseConfig({ provider: "github" })), true);
  assertEquals(adapter.canRun(baseConfig({ provider: "all" })), true);
  assertEquals(adapter.canRun(baseConfig({ provider: "jira" })), false);
  assertEquals(
    adapter.getOutFile(baseConfig({ provider: "all", outFile: "custom.json" })),
    "output/github_issues.json",
  );
});

Deno.test("GitLabAdapter uses live fetch", async () => {
  let usedLive = false;
  const adapter = new GitLabAdapter({
    fetchLive: async () => {
      usedLive = true;
      return [];
    },
  });

  const data = await adapter.fetchIssues(
    baseConfig({
      provider: "gitlab",
      gitlabURL: "https://gitlab.com",
      gitlabPAT: "token",
    }),
    {
      startDate: "2026-02-01T00:00:00.000Z",
      endDate: "2026-02-16T23:59:59.999Z",
    },
  );

  assertEquals(usedLive, true);
  assertEquals(data.length, 0);
});

Deno.test("JiraAdapter uses live fetch", async () => {
  let usedLive = false;
  const adapter = new JiraAdapter({
    fetchLive: async () => {
      usedLive = true;
      return [];
    },
  });

  const data = await adapter.fetchIssues(
    baseConfig({
      provider: "jira",
      jiraURL: "https://jira.example.com",
      jiraPAT: "token",
      jiraUsername: "mock.user",
    }),
    {
      startDate: "2026-02-01T00:00:00.000Z",
      endDate: "2026-02-16T23:59:59.999Z",
    },
  );

  assertEquals(usedLive, true);
  assertEquals(data.length, 0);
});

Deno.test("GitHubAdapter uses live fetch", async () => {
  let usedLive = false;
  const adapter = new GitHubAdapter({
    fetchLive: async () => {
      usedLive = true;
      return [];
    },
  });

  const data = await adapter.fetchIssues(
    baseConfig({
      provider: "github",
      githubURL: "https://api.github.com",
      githubPAT: "token",
      githubUsername: "mock.user",
    }),
    {
      startDate: "2026-02-01T00:00:00.000Z",
      endDate: "2026-02-16T23:59:59.999Z",
    },
  );

  assertEquals(usedLive, true);
  assertEquals(data.length, 0);
});
