import { parseArgs, promptSecret } from "@std/cli";
import { load } from "@std/dotenv";
import { getDefaultOutFile, runConfigWizard } from "./tui.ts";
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
  const gitlabPAT = Deno.env.get("GITLAB_PAT");
  const gitlabURL = Deno.env.get("GITLAB_URL");
  const gitlabUsername = Deno.env.get("GITLAB_USERNAME");
  const jiraPAT = Deno.env.get("JIRA_PAT");
  const jiraURL = Deno.env.get("JIRA_URL");
  const jiraUsername = Deno.env.get("JIRA_USERNAME");
  const githubPAT = Deno.env.get("GITHUB_PAT");
  const githubURL = Deno.env.get("GITHUB_URL");
  const githubUsername = Deno.env.get("GITHUB_USERNAME");
  const reportProfile = Deno.env.get("REPORT_PROFILE");
  const reportFormat = Deno.env.get("REPORT_FORMAT");
  const aiNarrative = Deno.env.get("AI_NARRATIVE");
  const aiModel = Deno.env.get("AI_MODEL");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  const outFile = Deno.env.get("OUT_FILE");
  const timeRange = Deno.env.get("TIME_RANGE");
  const fetchMode = Deno.env.get("FETCH_MODE");
  const startDate = Deno.env.get("START_DATE");
  const endDate = Deno.env.get("END_DATE");
  const provider = Deno.env.get("PROVIDER") as
    | "gitlab"
    | "jira"
    | "github"
    | "all"
    | undefined;
  // const projectIDs = Deno.env.get("PROJECT_IDS")?.split(",");
  const envParams: Partial<Config> = {
    gitlabPAT,
    gitlabURL,
    jiraPAT,
    jiraURL,
    githubPAT,
    githubURL,
    outFile,
    timeRange,
    fetchMode,
    startDate,
    endDate,
    provider,
    gitlabUsername: parseAttributionUsername(gitlabUsername),
    jiraUsername: parseAttributionUsername(jiraUsername),
    githubUsername: parseAttributionUsername(githubUsername),
    reportProfile: parseReportProfile(reportProfile),
    reportFormat: parseReportFormat(reportFormat),
    aiNarrative: parseAiNarrativeMode(aiNarrative),
    aiModel: aiModel?.trim() || undefined,
    openaiApiKey: openaiApiKey?.trim() || undefined,
    // projectIDs,
  };
  return envParams;
};

const printHelp = () => {
  console.log(`
    Flags:
      --provider
          Provider to use
          Default: gitlab
          Options: gitlab, jira, github, all
      --gitlabPAT:
          GitLab Personal Access Token - Required if provider is gitlab
          Alias: --pat
      --gitlabURL
          GitLab URL - Required if provider is gitlab
          Alias: --url
      --gitlabUsername
          GitLab username used for report attribution
          Env: GITLAB_USERNAME
      --jiraPAT:
          Jira Personal Access Token - Required if provider is jira
      --jiraURL
          Jira URL - Required if provider is jira
      --jiraUsername
          Jira Username - Required if provider is jira
          Env: JIRA_USERNAME
      --githubPAT:
          GitHub Personal Access Token - Required if provider is github
      --githubURL
          GitHub API URL - Required if provider is github
          Example: https://api.github.com
      --githubUsername
          GitHub Username - Required if provider is github
          Env: GITHUB_USERNAME
      --outFile,
          Output file name
          Alias: --out
          Default: output/provider_issues.json (depending on provider)
      --timeRange,
          Time range for issues
          Alias: --range
          Default: week
          Options: week, month, year, custom
      --fetchMode,
          Fetch mode for issues
          Alias: --mode
          Default: all_contributions
          Options: my_issues, all_contributions
      --startDate,
          Custom start date (Format: MM-DD-YYYY)
          Alias: --start
      --endDate,
          Custom end date (Format: MM-DD-YYYY)
          Alias: --end
      --help,
          Show this help message.
          alias: -h
      --tui
          Launch interactive wizard-style TUI flow
      --reportProfile
          Report profile
          Default: activity_retro
          Options: brief, activity_retro, showcase
          Env: REPORT_PROFILE
      --reportFormat
          Report output format
          Default: html
          Options: markdown, html, both
          Env: REPORT_FORMAT
      --aiNarrative
          AI narrative rewrite mode
          Default: auto
          Options: auto, on, off
          Env: AI_NARRATIVE
      --aiModel
          OpenAI model for AI narrative rewrite
          Default: gpt-4o-mini
          Env: AI_MODEL
      OPENAI_API_KEY
          Required when --aiNarrative on
  `);
  promptExit(null, 0);
};

export const generateConfig = async (rawArgs = Deno.args): Promise<Config> => {
  let envConfig: Partial<Config> = {};
  try {
    envConfig = await loadEnvConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    promptExit(message, 1);
  }

  const args = parseArgs(rawArgs, {
    string: [
      "gitlabPAT",
      "gitlabURL",
      "gitlabUsername",
      "jiraPAT",
      "jiraURL",
      "jiraUsername",
      "githubPAT",
      "githubURL",
      "githubUsername",
      "reportProfile",
      "reportFormat",
      "aiNarrative",
      "aiModel",
      "outFile",
      "timeRange",
      "fetchMode",
      "startDate",
      "endDate",
      "provider",
    ],
    // collect: ["projectIDs"],
    boolean: ["help", "tui"],
    alias: {
      help: "h",
      gitlabPAT: "pat",
      gitlabURL: "url",
      outFile: "out",
      timeRange: "range",
      fetchMode: "mode",
      startDate: "start",
      endDate: "end",
      // projectIDs: "projects",
    },
  });

  if (args.help) {
    printHelp();
  }

  let combinedConfig: Partial<Config> = {};
  try {
    combinedConfig = {
      provider: (args.provider as "gitlab" | "jira" | "github" | "all") ??
        envConfig.provider ??
        "gitlab",
      gitlabPAT: args.gitlabPAT ?? envConfig.gitlabPAT,
      gitlabURL: args.gitlabURL ?? envConfig.gitlabURL,
      gitlabUsername: parseAttributionUsername(
        args.gitlabUsername ?? envConfig.gitlabUsername,
      ),
      jiraPAT: args.jiraPAT ?? envConfig.jiraPAT,
      jiraURL: args.jiraURL ?? envConfig.jiraURL,
      jiraUsername: parseAttributionUsername(
        args.jiraUsername ?? envConfig.jiraUsername,
      ),
      githubPAT: args.githubPAT ?? envConfig.githubPAT,
      githubURL: args.githubURL ?? envConfig.githubURL,
      githubUsername: parseAttributionUsername(
        args.githubUsername ?? envConfig.githubUsername,
      ),
      reportProfile: parseReportProfile(
        args.reportProfile ?? envConfig.reportProfile,
      ) ?? "activity_retro",
      reportFormat:
        parseReportFormat(args.reportFormat ?? envConfig.reportFormat) ??
          "html",
      aiNarrative: parseAiNarrativeMode(
        args.aiNarrative ?? envConfig.aiNarrative,
      ) ?? "auto",
      aiModel: (args.aiModel ?? envConfig.aiModel ?? "gpt-4o-mini").trim(),
      openaiApiKey: envConfig.openaiApiKey,
      outFile: args.outFile ?? envConfig.outFile,
      timeRange: args.timeRange ?? envConfig.timeRange ?? "week",
      fetchMode: args.fetchMode ?? envConfig.fetchMode ?? "all_contributions",
      startDate: args.startDate ?? envConfig.startDate,
      endDate: args.endDate ?? envConfig.endDate,
      // projectIDs: (args.projectIDs as string[]) ?? envConfig.projectIDs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    promptExit(message, 1);
  }

  if (args.tui) {
    return await runConfigWizard(combinedConfig);
  }

  if (!combinedConfig.outFile) {
    combinedConfig.outFile = getDefaultOutFile(
      combinedConfig.provider ?? "gitlab",
    );
  }

  // Validate GitLab Config
  if (
    (combinedConfig.provider === "gitlab" || combinedConfig.provider === "all")
  ) {
    if (!combinedConfig.gitlabPAT) {
      const gitlabPAT = promptSecret(
        "Enter your GitLab Personal Access Token:",
        {
          mask: "*",
        },
      );
      if (!gitlabPAT) {
        promptExit("GitLab Personal Access Token is required.", 1);
      }
      combinedConfig.gitlabPAT = gitlabPAT as string;
    }

    if (!combinedConfig.gitlabURL) {
      const gitlabURL = prompt(
        "Enter your GitLab URL (e.g., https://gitlab.com):",
      );
      if (!gitlabURL) {
        promptExit("GitLab URL is required.", 1);
      }
      combinedConfig.gitlabURL = gitlabURL as string;
    }
  }

  // Validate Jira Config
  if (
    (combinedConfig.provider === "jira" || combinedConfig.provider === "all")
  ) {
    if (!combinedConfig.jiraPAT) {
      const jiraPAT = promptSecret(
        "Enter your Jira Personal Access Token:",
        {
          mask: "*",
        },
      );
      if (!jiraPAT) {
        promptExit("Jira Personal Access Token is required.", 1);
      }
      combinedConfig.jiraPAT = jiraPAT as string;
    }

    if (!combinedConfig.jiraURL) {
      const jiraURL = prompt(
        "Enter your Jira URL (e.g., https://jira.example.com/):",
      );
      if (!jiraURL) {
        promptExit("Jira URL is required.", 1);
      }
      combinedConfig.jiraURL = jiraURL as string;
    }

    if (!combinedConfig.jiraUsername) {
      const jiraUsername = prompt(
        "Enter your Jira Username:",
      );
      if (!jiraUsername) {
        promptExit("Jira Username is required.", 1);
      }
      combinedConfig.jiraUsername = jiraUsername as string;
    }
  }

  // Validate GitHub Config
  if (
    (combinedConfig.provider === "github" || combinedConfig.provider === "all")
  ) {
    if (!combinedConfig.githubPAT) {
      const githubPAT = promptSecret(
        "Enter your GitHub Personal Access Token:",
        { mask: "*" },
      );
      if (!githubPAT) {
        promptExit("GitHub Personal Access Token is required.", 1);
      }
      combinedConfig.githubPAT = githubPAT as string;
    }

    if (!combinedConfig.githubURL) {
      const githubURL = prompt(
        "Enter your GitHub API URL (e.g., https://api.github.com):",
      );
      if (!githubURL) {
        promptExit("GitHub API URL is required.", 1);
      }
      combinedConfig.githubURL = githubURL as string;
    }

    if (!combinedConfig.githubUsername) {
      const githubUsername = prompt("Enter your GitHub Username:");
      if (!githubUsername) {
        promptExit("GitHub Username is required.", 1);
      }
      combinedConfig.githubUsername = githubUsername as string;
    }
  }

  const finalConfig: Config = combinedConfig as Config;

  console.log(`
Configuration:
  - Provider: ${finalConfig.provider}
  - URL(s): ${
    finalConfig.provider === "all"
      ? `GitLab: ${finalConfig.gitlabURL}, Jira: ${finalConfig.jiraURL}, GitHub: ${finalConfig.githubURL}`
      : finalConfig.provider === "gitlab"
      ? finalConfig.gitlabURL
      : finalConfig.provider === "github"
      ? finalConfig.githubURL
      : finalConfig.jiraURL
  }
  - Output File(s): ${
    finalConfig.provider === "all"
      ? "output/gitlab_issues.json, output/jira_issues.json, output/github_issues.json"
      : finalConfig.outFile
  }
  - Time Range: ${finalConfig.timeRange}
  - Fetch Mode: ${finalConfig.fetchMode}
  - Report Profile: ${finalConfig.reportProfile}
  - Report Format: ${finalConfig.reportFormat}
  - AI Narrative: ${finalConfig.aiNarrative}
  - AI Model: ${finalConfig.aiModel}`);

  return finalConfig;
};
