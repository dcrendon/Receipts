import { generateConfig, promptExit } from "./config.ts";
import { getDateRange } from "./dates.ts";
import { gitlabIssues } from "./gitlab.ts";
import { jiraIssues } from "./jira.ts";

type ProviderName = "gitlab" | "jira";
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

  if (config.provider === "gitlab" || config.provider === "all") {
    try {
      const headers = {
        "PRIVATE-TOKEN": config.gitlabPAT!,
      };
      const outFile = config.provider === "all"
        ? "gitlab_issues.json"
        : config.outFile;

      const issues = await gitlabIssues(
        config.gitlabURL!,
        headers,
        startDate,
        endDate,
        config.fetchMode,
      );

      if (!issues.length) {
        console.log("\nNo GitLab issues found for the specified criteria.");
      } else {
        await Deno.writeTextFile(
          outFile,
          JSON.stringify(issues, null, 2),
        );
        console.log(`\nGitLab issue data written to ${outFile}`);
      }

      runResults.push({
        provider: "gitlab",
        status: "success",
        issueCount: issues.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`\nGitLab provider failed: ${errorMessage}`);
      runResults.push({
        provider: "gitlab",
        status: "failed",
        issueCount: 0,
        error: errorMessage,
      });
    }
  }

  if (config.provider === "jira" || config.provider === "all") {
    try {
      const headers = {
        "Authorization": `Bearer ${config.jiraPAT}`,
        "Content-Type": "application/json",
      };
      const outFile = config.provider === "all"
        ? "jira_issues.json"
        : config.outFile;

      const issues = await jiraIssues(
        config.jiraURL!,
        headers,
        config.jiraUsername!,
        startDate,
        endDate,
        config.fetchMode,
      );

      if (!issues.length) {
        console.log("\nNo Jira issues found for the specified criteria.");
      } else {
        await Deno.writeTextFile(
          outFile,
          JSON.stringify(issues, null, 2),
        );
        console.log(`\nJira issue data written to ${outFile}`);
      }

      runResults.push({
        provider: "jira",
        status: "success",
        issueCount: issues.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`\nJira provider failed: ${errorMessage}`);
      runResults.push({
        provider: "jira",
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
