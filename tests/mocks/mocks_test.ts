import { assertEquals, assertRejects } from "@std/assert";
import { loadMockIssues } from "../../providers/mocks.ts";

Deno.test("loadMockIssues loads fixture arrays", async () => {
  const originalReadTextFile = Deno.readTextFile;

  try {
    Deno.readTextFile = (async (path: string | URL) => {
      const asString = String(path);
      if (asString.endsWith("gitlab_issues.mock.json")) {
        return JSON.stringify([{ id: 1 }]);
      }
      if (asString.endsWith("github_issues.mock.json")) {
        return JSON.stringify([{ id: 2 }]);
      }
      return JSON.stringify([]);
    }) as typeof Deno.readTextFile;

    const gitlab = await loadMockIssues("gitlab");
    const github = await loadMockIssues("github");

    assertEquals(Array.isArray(gitlab), true);
    assertEquals(Array.isArray(github), true);
    assertEquals(gitlab[0].id, 1);
    assertEquals(github[0].id, 2);
  } finally {
    Deno.readTextFile = originalReadTextFile;
  }
});

Deno.test("loadMockIssues throws for missing fixture path", async () => {
  const originalReadTextFile = Deno.readTextFile;

  try {
    Deno.readTextFile = (async () => {
      throw new Deno.errors.NotFound("missing");
    }) as typeof Deno.readTextFile;

    await assertRejects(() => loadMockIssues("jira", "not-a-real-directory"));
  } finally {
    Deno.readTextFile = originalReadTextFile;
  }
});
