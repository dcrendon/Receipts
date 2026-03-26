import { assertEquals } from "@std/assert";
import {
  getDefaultOutFile,
  normalizeChoice,
} from "../../config/tui.ts";
import { getProviderReadiness } from "../../config/provider_readiness.ts";
import { Config } from "../../shared/types.ts";

const baseConfig = (overrides: Partial<Config> = {}): Config => ({
  provider: "all",
  outFile: "output/issues.json",
  timeRange: "week",
  ...overrides,
});

Deno.test("getDefaultOutFile returns provider defaults", () => {
  assertEquals(getDefaultOutFile("gitlab"), "output/gitlab_issues.json");
  assertEquals(getDefaultOutFile("jira"), "output/jira_issues.json");
  assertEquals(getDefaultOutFile("github"), "output/github_issues.json");
  assertEquals(getDefaultOutFile("all"), "output/issues.json");
});

Deno.test("normalizeChoice validates and normalizes input", () => {
  const allowed = ["gitlab", "jira", "github"] as const;
  assertEquals(normalizeChoice("GitHub", allowed), "github");
  assertEquals(normalizeChoice(" jira ", allowed), "jira");
  assertEquals(normalizeChoice("", allowed), undefined);
  assertEquals(normalizeChoice("invalid", allowed), undefined);
});

Deno.test("getProviderReadiness marks providers with missing credentials as not runnable", () => {
  const config = baseConfig({
    provider: "all",
    gitlabPAT: "token",
    gitlabURL: "https://gitlab.com",
    jiraPAT: "token",
    githubPAT: "token",
    githubURL: "https://api.github.com",
    githubUsername: "user",
  });

  const readiness = getProviderReadiness(config);

  assertEquals(readiness.runnableProviders.includes("gitlab"), true);
  assertEquals(readiness.runnableProviders.includes("github"), true);
  // Jira is missing jiraURL and jiraUsername so it should not be runnable
  assertEquals(readiness.runnableProviders.includes("jira"), false);
  assertEquals((readiness.missingByProvider["jira"]?.length ?? 0) > 0, true);
});
