import { generateConfig, promptExit } from "./config.ts";
import { getDateRange } from "./dates.ts";
import { GitLabAdapter } from "./providers/gitlab_adapter.ts";
import { JiraAdapter } from "./providers/jira_adapter.ts";
import { ProviderAdapter, ProviderName } from "./providers/types.ts";

type ProviderStatus = "success" | "failed";
type RunStatus = "SUCCESS" | "PARTIAL" | "FAILED";

interface ProviderRunResult {
  provider: ProviderName;
  status: ProviderStatus;
  issueCount: number;
  error?: string;
}

const EXIT_CODES: Record<RunStatus, number> = {
  SUCCESS: 0,
  FAILED: 1,
  PARTIAL: 2,
};

const getProviderAdapters = (): ProviderAdapter[] => {
  return [new GitLabAdapter(), new JiraAdapter()];
};

export const evaluateRunStatus = (results: ProviderRunResult[]): RunStatus => {
  const successCount = results.filter((r) => r.status === "success").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  if (failedCount === 0 && successCount > 0) {
    return "SUCCESS";
  }

  if (successCount > 0 && failedCount > 0) {
    return "PARTIAL";
  }

  return "FAILED";
};

const main = async () => {
  const config = await generateConfig();
  const { startDate, endDate } = getDateRange(config);
  const runResults: ProviderRunResult[] = [];
  const adapters = getProviderAdapters();

  for (const adapter of adapters) {
    if (!adapter.canRun(config)) {
      continue;
    }

    try {
      const outFile = adapter.getOutFile(config);
      const issues = await adapter.fetchIssues(config, { startDate, endDate });
      const providerTitle = adapter.name === "gitlab" ? "GitLab" : "Jira";

      if (!issues.length) {
        console.log(
          `\nNo ${providerTitle} issues found for the specified criteria.`,
        );
      } else {
        await Deno.writeTextFile(
          outFile,
          JSON.stringify(issues, null, 2),
        );
        console.log(`\n${providerTitle} issue data written to ${outFile}`);
      }

      runResults.push({
        provider: adapter.name,
        status: "success",
        issueCount: issues.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      const providerTitle = adapter.name === "gitlab" ? "GitLab" : "Jira";
      console.error(`\n${providerTitle} provider failed: ${errorMessage}`);
      runResults.push({
        provider: adapter.name,
        status: "failed",
        issueCount: 0,
        error: errorMessage,
      });
    }
  }

  const runStatus = evaluateRunStatus(runResults);
  console.log("\nRun Summary:");
  for (const result of runResults) {
    const suffix = result.status === "success"
      ? `${result.issueCount} issues`
      : result.error ?? "unknown error";
    console.log(`- ${result.provider}: ${result.status} (${suffix})`);
  }
  promptExit(
    `Process completed with status: ${runStatus}.`,
    EXIT_CODES[runStatus],
  );
};

if (import.meta.main) {
  main();
}
