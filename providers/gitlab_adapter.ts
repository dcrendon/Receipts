import { gitlabIssues } from "./gitlab.ts";
import { Config } from "../shared/types.ts";
import { DateWindow, ProviderAdapter } from "./types.ts";

type GitLabDeps = {
  fetchLive: typeof gitlabIssues;
};

export class GitLabAdapter implements ProviderAdapter {
  name: "gitlab" = "gitlab";
  #deps: GitLabDeps;

  constructor(deps?: Partial<GitLabDeps>) {
    this.#deps = {
      fetchLive: deps?.fetchLive ?? gitlabIssues,
    };
  }

  canRun(config: Config): boolean {
    return config.provider === "gitlab" || config.provider === "all";
  }

  getOutFile(config: Config): string {
    return config.provider === "all"
      ? "output/gitlab_issues.json"
      : config.outFile;
  }

  async fetchIssues(
    config: Config,
    dateWindow: DateWindow,
  ): Promise<unknown[]> {
    const headers = {
      "PRIVATE-TOKEN": config.gitlabPAT!,
    };

    return await this.#deps.fetchLive(
      config.gitlabURL!,
      headers,
      dateWindow.startDate,
      dateWindow.endDate,
      config.fetchMode,
    );
  }
}
