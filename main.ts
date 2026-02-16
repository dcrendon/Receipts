import { generateConfig, promptExit } from "./config.ts";
import {
  evaluateRunStatus,
  EXIT_CODES,
  ProviderRunResult,
} from "./core/run_status.ts";
import { getDateRange } from "./dates.ts";
import { getProviderAdapters } from "./providers/index.ts";
import { providerLabel } from "./providers/provider_meta.ts";

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
      const providerTitle = providerLabel(adapter.name);

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
      const providerTitle = providerLabel(adapter.name);
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
