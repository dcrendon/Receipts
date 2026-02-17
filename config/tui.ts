import { promptSecret } from "@std/cli";
import { Config } from "../shared/types.ts";
import {
  parseAiNarrativeMode,
  parseReportFormat,
  parseReportProfile,
  REPORT_PROFILES,
} from "./report_options.ts";
import {
  getMissingFieldsForProvider,
  getProviderReadiness,
  providerLabel,
} from "./provider_readiness.ts";
import { ProviderName } from "../providers/types.ts";

const TIME_RANGES = ["week", "month", "year", "custom"] as const;
const FETCH_MODES = ["my_issues", "all_contributions"] as const;
const OUTPUT_DIR = "output";
const FIXED_PROVIDER: Config["provider"] = "all";
const FIXED_REPORT_FORMAT: Config["reportFormat"] = "html";
const FIXED_AI_NARRATIVE: Config["aiNarrative"] = "auto";
const DEFAULT_AI_MODEL = "5.2";

const isNonEmpty = (value: string | null): value is string =>
  Boolean(value && value.trim().length > 0);

interface AiWizardConfigDecision {
  aiNarrative: Config["aiNarrative"];
  aiModel: string;
  shouldPromptForModel: boolean;
  statusMessage: string;
}

export const resolveAiWizardConfig = (
  seed: Config,
): AiWizardConfigDecision => {
  const defaultModel = seed.aiModel ?? DEFAULT_AI_MODEL;

  if (!seed.openaiApiKey) {
    return {
      aiNarrative: "off",
      aiModel: defaultModel,
      shouldPromptForModel: false,
      statusMessage:
        "Step 5/6 - AI is disabled for this run (OPENAI_API_KEY not set).",
    };
  }

  return {
    aiNarrative: FIXED_AI_NARRATIVE,
    aiModel: defaultModel,
    shouldPromptForModel: true,
    statusMessage: "Step 5/6 - Configure AI model",
  };
};

export const getDefaultOutFile = (provider: Config["provider"]): string => {
  if (provider === "gitlab") return `${OUTPUT_DIR}/gitlab_issues.json`;
  if (provider === "jira") return `${OUTPUT_DIR}/jira_issues.json`;
  if (provider === "github") return `${OUTPUT_DIR}/github_issues.json`;
  return `${OUTPUT_DIR}/issues.json`;
};

export const normalizeChoice = <T extends readonly string[]>(
  rawValue: string | undefined,
  allowed: T,
): T[number] | undefined => {
  if (!rawValue) return undefined;
  const normalized = rawValue.trim().toLowerCase();
  if (!normalized) return undefined;
  const found = allowed.find((value) => value === normalized);
  return found;
};

const askChoice = <T extends readonly string[]>(
  question: string,
  options: T,
  defaultValue: T[number],
): T[number] => {
  while (true) {
    const raw = prompt(
      `${question} [${options.join("/")}] (default: ${defaultValue})`,
    );
    const value = normalizeChoice(raw ?? undefined, options) ??
      normalizeChoice(defaultValue, options);
    if (value) return value;
    console.log(`Invalid value. Use one of: ${options.join(", ")}`);
  }
};

const askBoolean = (question: string, defaultValue: boolean): boolean => {
  while (true) {
    const raw = prompt(
      `${question} [y/n] (default: ${defaultValue ? "y" : "n"})`,
    );
    const normalized = (raw ?? (defaultValue ? "y" : "n")).trim().toLowerCase();
    if (["y", "yes"].includes(normalized)) return true;
    if (["n", "no"].includes(normalized)) return false;
    console.log("Invalid value. Use y or n.");
  }
};

const askRequiredText = (question: string, defaultValue?: string): string => {
  while (true) {
    const suffix = defaultValue ? ` (default: ${defaultValue})` : "";
    const raw = prompt(`${question}${suffix}`);
    const value = isNonEmpty(raw) ? raw.trim() : defaultValue?.trim();
    if (value) return value;
    console.log("This field is required.");
  }
};

const askRequiredSecret = (question: string, defaultValue?: string): string => {
  const useDefault = Boolean(defaultValue) &&
    askBoolean(`${question}: keep existing value?`, true);
  if (useDefault && defaultValue) {
    return defaultValue;
  }

  while (true) {
    const raw = promptSecret(question, { mask: "*" });
    if (isNonEmpty(raw)) {
      return raw.trim();
    }
    console.log("This field is required.");
  }
};

const describeMissingField = (field: keyof Config): string => {
  if (field === "gitlabPAT") return "GitLab PAT";
  if (field === "gitlabURL") return "GitLab URL";
  if (field === "jiraPAT") return "Jira PAT";
  if (field === "jiraURL") return "Jira URL";
  if (field === "jiraUsername") return "Jira username";
  if (field === "githubPAT") return "GitHub PAT";
  if (field === "githubURL") return "GitHub URL";
  if (field === "githubUsername") return "GitHub username";
  return String(field);
};

export const formatProviderReadinessSummary = (config: Config): string[] => {
  const readiness = getProviderReadiness(config);
  const lines = ["\nProvider readiness:"];

  for (const provider of readiness.selectedProviders) {
    const missing = readiness.missingByProvider[provider] ?? [];
    if (missing.length === 0) {
      lines.push(`- ${providerLabel(provider)}: ready`);
    } else {
      lines.push(
        `- ${providerLabel(provider)}: missing ${
          missing.map(describeMissingField).join(", ")
        }`,
      );
    }
  }

  return lines;
};

const captureProviderCredentials = (
  config: Config,
  provider: ProviderName,
): void => {
  const missing = getMissingFieldsForProvider(config, provider);
  if (!missing.length) {
    return;
  }

  console.log(`\n${providerLabel(provider)} is missing required credentials.`);

  for (const field of missing) {
    if (field === "gitlabPAT") {
      config.gitlabPAT = askRequiredSecret(
        "Enter GitLab Personal Access Token",
      );
      continue;
    }
    if (field === "gitlabURL") {
      config.gitlabURL = askRequiredText(
        "Enter GitLab URL (e.g., https://gitlab.com)",
        config.gitlabURL,
      );
      continue;
    }
    if (field === "jiraPAT") {
      config.jiraPAT = askRequiredSecret("Enter Jira Personal Access Token");
      continue;
    }
    if (field === "jiraURL") {
      config.jiraURL = askRequiredText(
        "Enter Jira URL (e.g., https://jira.example.com/)",
        config.jiraURL,
      );
      continue;
    }
    if (field === "jiraUsername") {
      config.jiraUsername = askRequiredText(
        "Enter Jira username",
        config.jiraUsername,
      );
      continue;
    }
    if (field === "githubPAT") {
      config.githubPAT = askRequiredSecret(
        "Enter GitHub Personal Access Token",
      );
      continue;
    }
    if (field === "githubURL") {
      config.githubURL = askRequiredText(
        "Enter GitHub API URL (e.g., https://api.github.com)",
        config.githubURL,
      );
      continue;
    }
    if (field === "githubUsername") {
      config.githubUsername = askRequiredText(
        "Enter GitHub username",
        config.githubUsername,
      );
    }
  }
};

export const runConfigWizard = async (
  seed: Config,
): Promise<Config> => {
  console.log("\nIssue Fetcher Wizard");
  console.log(
    "Configure this run. Missing provider credentials can be added now.\n",
  );

  const provider = FIXED_PROVIDER;
  console.log("Step 1/6 - Provider is fixed to: all");

  const timeRange = askChoice(
    "Step 2/6 - Select time range",
    TIME_RANGES,
    normalizeChoice(seed.timeRange, TIME_RANGES) ?? "week",
  );

  let startDate = seed.startDate;
  let endDate = seed.endDate;
  if (timeRange === "custom") {
    startDate = askRequiredText(
      "Enter custom START_DATE (MM-DD-YYYY)",
      seed.startDate,
    );
    endDate = askRequiredText(
      "Enter custom END_DATE (MM-DD-YYYY)",
      seed.endDate,
    );
  }

  const fetchMode = askChoice(
    "Step 3/6 - Select fetch mode",
    FETCH_MODES,
    normalizeChoice(seed.fetchMode, FETCH_MODES) ?? "all_contributions",
  );

  const reportProfile = askChoice(
    "Step 4/6 - Select report profile",
    REPORT_PROFILES,
    seed.reportProfile ?? "activity_retro",
  );
  const reportFormat = FIXED_REPORT_FORMAT;
  const aiConfig = resolveAiWizardConfig(seed);
  console.log(aiConfig.statusMessage);
  const aiNarrative = aiConfig.aiNarrative;
  const aiModel = aiConfig.shouldPromptForModel
    ? askRequiredText("AI model", aiConfig.aiModel)
    : aiConfig.aiModel;

  const outFile = provider === "all"
    ? `${OUTPUT_DIR}/issues.json`
    : askRequiredText(
      "Output file name",
      seed.outFile ?? getDefaultOutFile(provider),
    );

  const config: Config = {
    ...seed,
    provider,
    outFile,
    timeRange,
    fetchMode,
    startDate,
    endDate,
    reportProfile: parseReportProfile(reportProfile) ?? "activity_retro",
    reportFormat: parseReportFormat(reportFormat) ?? FIXED_REPORT_FORMAT,
    aiNarrative: parseAiNarrativeMode(aiNarrative) ?? FIXED_AI_NARRATIVE,
    aiModel,
  };

  for (const line of formatProviderReadinessSummary(config)) {
    console.log(line);
  }

  const targetProviders = provider === "all"
    ? (["gitlab", "jira", "github"] as ProviderName[])
    : [provider];

  for (const target of targetProviders) {
    const missing = getMissingFieldsForProvider(config, target);
    if (!missing.length) continue;

    const shouldCapture = askBoolean(
      `Add missing ${providerLabel(target)} credentials now?`,
      true,
    );
    if (shouldCapture) {
      captureProviderCredentials(config, target);
    }
  }

  for (const line of formatProviderReadinessSummary(config)) {
    console.log(line);
  }

  const confirmed = askBoolean("Start run with this configuration?", true);
  if (!confirmed) {
    console.log("Run canceled.");
    Deno.exit(0);
  }

  return config;
};
