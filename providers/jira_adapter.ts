import { jiraIssues } from "./jira.ts";
import { Config } from "../shared/types.ts";
import { DateWindow, ProviderAdapter } from "./types.ts";

type JiraDeps = {
  fetchLive: typeof jiraIssues;
};

export class JiraAdapter implements ProviderAdapter {
  name: "jira" = "jira";
  #deps: JiraDeps;

  constructor(deps?: Partial<JiraDeps>) {
    this.#deps = {
      fetchLive: deps?.fetchLive ?? jiraIssues,
    };
  }

  canRun(config: Config): boolean {
    return config.provider === "jira" || config.provider === "all";
  }

  getOutFile(config: Config): string {
    return config.provider === "all"
      ? "output/jira_issues.json"
      : config.outFile;
  }

  async fetchIssues(
    config: Config,
    dateWindow: DateWindow,
  ): Promise<unknown[]> {
    const headers = {
      "Authorization": `Bearer ${config.jiraPAT}`,
      "Content-Type": "application/json",
    };

    return await this.#deps.fetchLive(
      config.jiraURL!,
      headers,
      config.jiraUsername!,
      dateWindow.startDate,
      dateWindow.endDate,
      config.fetchMode,
    );
  }
}
