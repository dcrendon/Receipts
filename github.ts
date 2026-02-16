import { requestJsonWithRetry } from "./http_client.ts";
import { GitHubIssue } from "./types.ts";

interface GitHubSearchResponse {
  total_count?: number;
  items?: GitHubIssue[];
}

const escapeGitHubValue = (str: string): string => {
  return str.replace(/"/g, '\\"');
};

const isoDateOnly = (value: string): string => value.split("T")[0];

const baseApiUrl = (githubURL: string): string =>
  githubURL.endsWith("/") ? githubURL : `${githubURL}/`;

const getPaginatedSearchResults = async (
  githubURL: string,
  headers: Record<string, string>,
  query: string,
): Promise<GitHubIssue[]> => {
  const allIssues: GitHubIssue[] = [];
  let page = 1;
  const perPage = 100;
  const baseURL = baseApiUrl(githubURL);

  while (true) {
    const searchUrl = new URL("search/issues", baseURL);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("page", String(page));
    searchUrl.searchParams.set("per_page", String(perPage));

    const response = await requestJsonWithRetry<GitHubSearchResponse>(
      searchUrl.toString(),
      { headers, method: "GET" },
      "GitHub search",
    );

    const items = response.items ?? [];
    if (!items.length) {
      break;
    }

    allIssues.push(...items);

    const totalCount = response.total_count ?? 0;
    if (allIssues.length >= totalCount) {
      break;
    }
    page++;
  }

  return allIssues;
};

const getIssueComments = async (
  headers: Record<string, string>,
  commentsURL: string,
): Promise<any[]> => {
  const allComments: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = new URL(commentsURL);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));

    const comments = await requestJsonWithRetry<any[]>(
      url.toString(),
      { headers, method: "GET" },
      "GitHub comments",
    );

    if (!comments.length) {
      break;
    }

    allComments.push(...comments);
    page++;
  }

  return allComments;
};

const removeNulls = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj
      .map((v) => removeNulls(v))
      .filter((v) => v !== null && v !== undefined);
  } else if (typeof obj === "object" && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      const val = removeNulls(obj[key]);
      if (val !== null && val !== undefined) {
        newObj[key] = val;
      }
    }
    return newObj;
  }
  return obj;
};

export const githubIssues = async (
  githubURL: string,
  headers: Record<string, string>,
  username: string,
  startDate: string,
  endDate: string,
  fetchMode: string,
) => {
  const safeUser = escapeGitHubValue(username);
  const rangeStart = isoDateOnly(startDate);
  const rangeEnd = isoDateOnly(endDate);

  let issues: GitHubIssue[] = [];

  if (fetchMode === "my_issues") {
    const authorQuery =
      `type:issue author:${safeUser} created:${rangeStart}..${rangeEnd}`;
    const assigneeQuery =
      `type:issue assignee:${safeUser} created:${rangeStart}..${rangeEnd}`;
    const [authorIssues, assigneeIssues] = await Promise.all([
      getPaginatedSearchResults(githubURL, headers, authorQuery),
      getPaginatedSearchResults(githubURL, headers, assigneeQuery),
    ]);
    issues = [...authorIssues, ...assigneeIssues];
  } else if (fetchMode === "all_contributions") {
    const contributionsQuery =
      `type:issue involves:${safeUser} updated:${rangeStart}..${rangeEnd}`;
    issues = await getPaginatedSearchResults(
      githubURL,
      headers,
      contributionsQuery,
    );
  } else {
    throw new Error(`Invalid fetch mode: ${fetchMode}`);
  }

  if (!issues.length) {
    return [];
  }

  const deduped = new Map<number, GitHubIssue>();
  for (const issue of issues) {
    deduped.set(issue.id, issue);
  }

  const finalIssues: GitHubIssue[] = [];
  for (const issue of deduped.values()) {
    const commentsCount = issue.comments ?? 0;
    const commentsURL = typeof issue.comments_url === "string"
      ? issue.comments_url
      : undefined;
    const notes = commentsCount > 0 && commentsURL
      ? await getIssueComments(headers, commentsURL)
      : [];

    issue.notes = notes;
    issue.metadata = {
      repository: typeof issue.repository_url === "string"
        ? issue.repository_url.split("/").slice(-2).join("/")
        : undefined,
      labelNames: (issue.labels ?? [])
        .map((l) => l?.name)
        .filter((name): name is string => Boolean(name)),
      assigneeLogins: (issue.assignees ?? [])
        .map((a) => a?.login)
        .filter((login): login is string => Boolean(login)),
      milestoneTitle: issue.milestone?.title ?? null,
      commentCount: commentsCount,
    };

    finalIssues.push(issue);
  }

  return removeNulls(finalIssues);
};
