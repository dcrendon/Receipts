import { load } from "@std/dotenv";
import { Config } from "../shared/types.ts";
import {
  parseAiNarrativeMode,
  parseAttributionUsername,
  parseReportFormat,
  parseReportProfile,
} from "./report_options.ts";

export const promptExit = (message: string | null, exitCode: number): never => {
  if (message) {
    console.log(message);
  }
  if (Deno.stdin.isTerminal()) {
    prompt("\nPress Enter to close...");
  }
  Deno.exit(exitCode);
};

export const loadEnvConfig = async (): Promise<Partial<Config>> => {
  await load({ export: true });

  const reportProfile = parseReportProfile(Deno.env.get("REPORT_PROFILE")) ??
    "activity_retro";
  const reportFormat = parseReportFormat(Deno.env.get("REPORT_FORMAT")) ??
    "html";
  const aiNarrative = parseAiNarrativeMode(Deno.env.get("AI_NARRATIVE")) ??
    "auto";

  return {
    provider: Deno.env.get("PROVIDER") as Config["provider"] | undefined,
    gitlabPAT: Deno.env.get("GITLAB_PAT")?.trim() || undefined,
    gitlabURL: Deno.env.get("GITLAB_URL")?.trim() || undefined,
    gitlabUsername: parseAttributionUsername(Deno.env.get("GITLAB_USERNAME")),
    jiraPAT: Deno.env.get("JIRA_PAT")?.trim() || undefined,
    jiraURL: Deno.env.get("JIRA_URL")?.trim() || undefined,
    jiraUsername: parseAttributionUsername(Deno.env.get("JIRA_USERNAME")),
    githubPAT: Deno.env.get("GITHUB_PAT")?.trim() || undefined,
    githubURL: Deno.env.get("GITHUB_URL")?.trim() || undefined,
    githubUsername: parseAttributionUsername(Deno.env.get("GITHUB_USERNAME")),
    reportProfile,
    reportFormat,
    aiNarrative,
    aiModel: Deno.env.get("AI_MODEL")?.trim() || "5.2",
    openaiApiKey: Deno.env.get("OPENAI_API_KEY")?.trim() || undefined,
    outFile: Deno.env.get("OUT_FILE")?.trim() || "output/issues.json",
    timeRange: Deno.env.get("TIME_RANGE")?.trim() || "week",
    fetchMode: Deno.env.get("FETCH_MODE")?.trim() || "all_contributions",
    startDate: Deno.env.get("START_DATE")?.trim() || undefined,
    endDate: Deno.env.get("END_DATE")?.trim() || undefined,
  };
};

interface BuildRuntimeConfigInput {
  envConfig: Partial<Config>;
  interactive: boolean;
}

const normalizeProvider = (value?: string): Config["provider"] => {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === "gitlab" || normalized === "jira" ||
    normalized === "github" || normalized === "all"
  ) {
    return normalized;
  }
  return "all";
};

export const buildRuntimeConfig = (
  { envConfig }: BuildRuntimeConfigInput,
): Config => {
  return {
    provider: normalizeProvider(envConfig.provider),
    gitlabPAT: envConfig.gitlabPAT,
    gitlabURL: envConfig.gitlabURL,
    gitlabUsername: parseAttributionUsername(envConfig.gitlabUsername),
    jiraPAT: envConfig.jiraPAT,
    jiraURL: envConfig.jiraURL,
    jiraUsername: parseAttributionUsername(envConfig.jiraUsername),
    githubPAT: envConfig.githubPAT,
    githubURL: envConfig.githubURL,
    githubUsername: parseAttributionUsername(envConfig.githubUsername),
    reportProfile: envConfig.reportProfile ?? "activity_retro",
    reportFormat: envConfig.reportFormat ?? "html",
    aiNarrative: envConfig.aiNarrative ?? "auto",
    aiModel: envConfig.aiModel?.trim() || "5.2",
    openaiApiKey: envConfig.openaiApiKey,
    outFile: envConfig.outFile?.trim() || "output/issues.json",
    timeRange: envConfig.timeRange?.trim() || "week",
    fetchMode: envConfig.fetchMode?.trim() || "all_contributions",
    startDate: envConfig.startDate,
    endDate: envConfig.endDate,
  };
};
