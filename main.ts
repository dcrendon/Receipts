import {
  buildRuntimeConfig,
  loadEnvConfig,
  promptExit,
} from "./config/config.ts";
import { getDateRange } from "./config/dates.ts";
import {
  describeProviderField,
  getProviderReadiness,
  providerLabel as readinessProviderLabel,
} from "./config/provider_readiness.ts";
import { runSetup } from "./config/tui.ts";
import { Spinner } from "@std/cli/unstable-spinner";
import { bold, cyan, green, red, yellow } from "@std/fmt/colors";
import { Table } from "@cliffy/table";
import {
  evaluateRunStatus,
  EXIT_CODES,
  ProviderRunResult,
} from "./core/run_status.ts";
import { GitLabAdapter } from "./providers/gitlab_adapter.ts";
import { getProviderAdapters } from "./providers/index.ts";
import { providerLabel } from "./providers/provider_meta.ts";
import { ProviderName } from "./providers/types.ts";
import { buildRunReport, writeRunReport } from "./reporting/reporting.ts";
import { Config } from "./shared/types.ts";

const formatMissingProviders = (
  missingByProvider: Partial<Record<ProviderName, (keyof Config)[]>>,
): string => {
  const chunks: string[] = [];
  for (const provider of ["gitlab", "jira", "github"] as ProviderName[]) {
    const missing = missingByProvider[provider] ?? [];
    if (!missing.length) continue;
    chunks.push(
      `${readinessProviderLabel(provider)} missing ${
        missing.map(describeProviderField).join(", ")
      }`,
    );
  }
  return chunks.join("; ");
};

const runFetch = async (config: Config) => {
  const readiness = getProviderReadiness(config);

  const skippedProviders = readiness.selectedProviders.filter((provider) =>
    !readiness.runnableProviders.includes(provider)
  );

  if (readiness.runnableProviders.length === 0) {
    promptExit(
      `No provider credentials found for selected provider(s). ${
        formatMissingProviders(readiness.missingByProvider)
      }`,
      1,
    );
  }

  const { startDate, endDate } = getDateRange(config);
  const runResults: ProviderRunResult[] = [];
  const successfulIssues: Partial<Record<ProviderName, unknown[]>> = {};
  const adapters = getProviderAdapters();
  const requestedProviders = readiness.runnableProviders;

  console.log("");
  for (const adapter of adapters) {
    if (!adapter.canRun(config)) {
      continue;
    }

    const label = providerLabel(adapter.name);
    const spinner = new Spinner({
      message: `Fetching ${cyan(label)} issues...`,
      color: "cyan",
    });
    spinner.start();

    try {
      const issues = await adapter.fetchIssues(config, { startDate, endDate });
      spinner.stop();
      console.log(`  ${green("✓")} ${bold(label)}: ${issues.length} issues`);

      runResults.push({
        provider: adapter.name,
        status: "success",
        issueCount: issues.length,
      });
      successfulIssues[adapter.name] = issues;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      spinner.stop();
      console.error(`  ${red("✗")} ${bold(label)}: ${errorMessage}`);
      runResults.push({
        provider: adapter.name,
        status: "failed",
        issueCount: 0,
        error: errorMessage,
      });
    }
  }

  const runStatus = evaluateRunStatus(runResults);

  const successfulResults = runResults.filter((result) =>
    result.status === "success"
  );
  if (successfulResults.length > 0) {
    try {
      const report = await buildRunReport(successfulIssues, {
        startDate,
        endDate,
        sourceMode: "fetch",
        generatedAt: new Date().toISOString(),
        geminiApiKey: config.geminiApiKey!,
        usernames: {
          gitlab: adapters.find((a): a is GitLabAdapter =>
            a instanceof GitLabAdapter
          )?.resolvedUsername,
          jira: config.jiraUsername,
          github: config.githubUsername,
        },
      }, {
        diagnostics: {
          sourceMode: "fetch",
          requestedProviders,
          runResults,
        },
      });
      const { htmlPath, normalizedPath } = await writeRunReport(report);
      console.log(`\n  ${green("✓")} Report:     ${cyan(htmlPath)}`);
      console.log(`  ${green("✓")} Normalized: ${cyan(normalizedPath)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\nReport generation failed: ${message}`);
    }
  }

  console.log(`\n${bold("  Run Summary")}`);
  new Table()
    .header([bold("Provider"), bold("Status"), bold("Details")])
    .body([
      ...runResults.map((result) => [
        cyan(readinessProviderLabel(result.provider)),
        result.status === "success" ? green("success") : red("failed"),
        result.status === "success"
          ? `${result.issueCount} issues`
          : (result.error ?? "unknown error"),
      ]),
      ...skippedProviders.map((provider) => [
        cyan(readinessProviderLabel(provider)),
        yellow("skipped"),
        "—",
      ]),
    ])
    .border(true)
    .padding(1)
    .indent(2)
    .render();

  promptExit(
    `Process completed with status: ${runStatus}.`,
    EXIT_CODES[runStatus],
  );
};

const main = async () => {
  let envConfig: Partial<Config> = {};
  try {
    envConfig = await loadEnvConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    promptExit(message, 1);
  }

  const baseConfig = buildRuntimeConfig({
    envConfig,
  });

  const config = Deno.stdin.isTerminal()
    ? await runSetup(baseConfig)
    : baseConfig;

  if (!config.geminiApiKey) {
    promptExit(
      "GEMINI_API_KEY is required. Set it in your .env file.",
      1,
    );
  }

  await runFetch(config);
};

if (import.meta.main) {
  main();
}
