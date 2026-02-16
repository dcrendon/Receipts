import { Config } from "../types.ts";

export type ProviderName = "gitlab" | "jira";

export interface DateWindow {
  startDate: string;
  endDate: string;
}

export interface ProviderAdapter {
  name: ProviderName;
  canRun(config: Config): boolean;
  getOutFile(config: Config): string;
  fetchIssues(config: Config, dateWindow: DateWindow): Promise<unknown[]>;
}
