import { Confirm } from "@cliffy/prompt/confirm";
import { Input } from "@cliffy/prompt/input";
import { Secret } from "@cliffy/prompt/secret";
import { Select } from "@cliffy/prompt/select";
import { Table } from "@cliffy/table";
import { bold, cyan, green, yellow } from "@std/fmt/colors";
import { Config } from "../shared/types.ts";
import {
  describeProviderField,
  getMissingFieldsForProvider,
  getProviderReadiness,
  providerLabel,
} from "./provider_readiness.ts";
import { ProviderName } from "../providers/types.ts";

const TIME_RANGES = ["week", "month", "year", "custom"] as const;
const PROVIDERS = ["gitlab", "jira", "github", "all"] as const;
const OUTPUT_DIR = "output";

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

const formatStep = (
  step: number,
  totalSteps: number,
  label: string,
): string => `${bold(cyan(`Step ${step}/${totalSteps}`))} — ${label}`;

const formatMissingFields = (fields: (keyof Config)[]): string =>
  fields.map(describeProviderField).join(", ");

const printBanner = (): void => {
  console.log("");
  console.log(bold(cyan("  ┌─────────────────────────────────────────┐")));
  console.log(
    bold(cyan("  │")) +
      bold("       RECEIPTS  —  Issue Reporter       ") +
      bold(cyan("│")),
  );
  console.log(bold(cyan("  └─────────────────────────────────────────┘")));
  console.log("");
};

const captureProviderCredentials = async (
  config: Config,
  provider: ProviderName,
): Promise<void> => {
  const missing = getMissingFieldsForProvider(config, provider);
  if (!missing.length) return;

  for (const field of missing) {
    if (field === "gitlabPAT") {
      const keep = config.gitlabPAT
        ? await Confirm.prompt({ message: "GitLab PAT: keep existing value?", default: true })
        : false;
      if (!keep) {
        config.gitlabPAT = await Secret.prompt({
          message: "Enter GitLab Personal Access Token",
          minLength: 1,
        });
      }
      continue;
    }
    if (field === "gitlabURL") {
      config.gitlabURL = await Input.prompt({
        message: "Enter GitLab URL",
        hint: "https://gitlab.com",
        default: config.gitlabURL ?? "",
        minLength: 1,
      });
      continue;
    }
    if (field === "jiraPAT") {
      const keep = config.jiraPAT
        ? await Confirm.prompt({ message: "Jira PAT: keep existing value?", default: true })
        : false;
      if (!keep) {
        config.jiraPAT = await Secret.prompt({
          message: "Enter Jira Personal Access Token",
          minLength: 1,
        });
      }
      continue;
    }
    if (field === "jiraURL") {
      config.jiraURL = await Input.prompt({
        message: "Enter Jira URL",
        hint: "https://jira.example.com/",
        default: config.jiraURL ?? "",
        minLength: 1,
      });
      continue;
    }
    if (field === "jiraUsername") {
      config.jiraUsername = await Input.prompt({
        message: "Enter Jira username",
        default: config.jiraUsername ?? "",
        minLength: 1,
      });
      continue;
    }
    if (field === "githubPAT") {
      const keep = config.githubPAT
        ? await Confirm.prompt({ message: "GitHub PAT: keep existing value?", default: true })
        : false;
      if (!keep) {
        config.githubPAT = await Secret.prompt({
          message: "Enter GitHub Personal Access Token",
          minLength: 1,
        });
      }
      continue;
    }
    if (field === "githubURL") {
      config.githubURL = await Input.prompt({
        message: "Enter GitHub API URL",
        hint: "https://api.github.com",
        default: config.githubURL ?? "",
        minLength: 1,
      });
      continue;
    }
    if (field === "githubUsername") {
      config.githubUsername = await Input.prompt({
        message: "Enter GitHub username",
        default: config.githubUsername ?? "",
        minLength: 1,
      });
    }
  }
};

export const runSetup = async (seed: Config): Promise<Config> => {
  printBanner();

  const totalSteps = 3;
  let step = 1;

  const provider = await Select.prompt({
    message: formatStep(step++, totalSteps, "Select provider"),
    options: [
      { name: "All providers", value: "all" },
      { name: "GitLab", value: "gitlab" },
      { name: "GitHub", value: "github" },
      { name: "Jira", value: "jira" },
    ],
    default: normalizeChoice(seed.provider, PROVIDERS) ?? "all",
  }) as Config["provider"];

  const timeRange = await Select.prompt({
    message: formatStep(step++, totalSteps, "Select time range"),
    options: [
      { name: "Last 7 days", value: "week" },
      { name: "Last 30 days", value: "month" },
      { name: "Last year", value: "year" },
      { name: "Custom range", value: "custom" },
    ],
    default: normalizeChoice(seed.timeRange, TIME_RANGES) ?? "week",
  }) as Config["timeRange"];

  let startDate = seed.startDate;
  let endDate = seed.endDate;
  if (timeRange === "custom") {
    startDate = await Input.prompt({
      message: "Enter custom START_DATE",
      hint: "MM-DD-YYYY",
      default: seed.startDate ?? "",
      minLength: 1,
    });
    endDate = await Input.prompt({
      message: "Enter custom END_DATE",
      hint: "MM-DD-YYYY",
      default: seed.endDate ?? "",
      minLength: 1,
    });
  }

  const config: Config = {
    ...seed,
    provider,
    outFile: getDefaultOutFile(provider),
    timeRange,
    startDate,
    endDate,
  };

  const { selectedProviders } = getProviderReadiness(config);
  const needsCredentials = selectedProviders.some(
    (p) => getMissingFieldsForProvider(config, p).length > 0,
  );

  if (needsCredentials) {
    console.log("\n" + formatStep(step, totalSteps, "Review provider credentials"));

    for (const target of selectedProviders) {
      const missing = getMissingFieldsForProvider(config, target);
      if (!missing.length) continue;

      const shouldCapture = await Confirm.prompt({
        message: `${cyan(providerLabel(target))} is missing ${formatMissingFields(missing)}. Add now?`,
        default: true,
      });
      if (shouldCapture) {
        await captureProviderCredentials(config, target);
      }
    }
  } else {
    console.log(
      "\n" + formatStep(step, totalSteps, "Provider credentials — all set"),
    );
  }

  // Provider readiness table
  const readiness = getProviderReadiness(config);
  console.log("");
  console.log(bold("  Provider Readiness"));
  new Table()
    .header([bold("Provider"), bold("Status"), bold("Notes")])
    .body(
      readiness.selectedProviders.map((p) => {
        const missing = readiness.missingByProvider[p] ?? [];
        const ready = missing.length === 0;
        return [
          cyan(providerLabel(p)),
          ready ? green("ready") : yellow("skipping"),
          ready ? "" : `missing: ${missing.map(describeProviderField).join(", ")}`,
        ];
      }),
    )
    .border(true)
    .padding(1)
    .indent(2)
    .render();
  console.log("");

  const confirmed = await Confirm.prompt({
    message: bold("Start run with this configuration?"),
    default: true,
  });
  if (!confirmed) {
    console.log("Run canceled.");
    Deno.exit(0);
  }

  return config;
};
