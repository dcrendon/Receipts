import { assertEquals, assertRejects } from "@std/assert";
import { applyAiNarrativeRewrite } from "../../reporting/ai_narrative.ts";

const baseRequest = {
  mode: "off" as const,
  model: "gpt-4o-mini",
  headlineLead: "Deterministic headline lead.",
  topHighlightWording: ["Highlight one.", "Highlight two."],
  weeklyPointLeads: ["Point one.", "Point two."],
  context: {
    startDate: "2026-02-01T00:00:00Z",
    endDate: "2026-02-16T23:59:59Z",
    fetchMode: "all_contributions",
    reportProfile: "activity_retro" as const,
  },
  payload: {
    highlights: [{
      provider: "github" as const,
      key: "GH-1",
      title: "Title",
      state: "open",
      bucket: "active" as const,
      impactScore: 20,
      updatedAt: "2026-02-16T00:00:00Z",
      userCommentCount: 1,
      isAuthoredByUser: true,
      isAssignedToUser: false,
      isCommentedByUser: true,
      labels: ["p1"],
      descriptionSnippet: "Snippet",
    }],
    collaboration: [],
    risks: [],
  },
};

Deno.test("applyAiNarrativeRewrite returns deterministic text when mode is off", async () => {
  const result = await applyAiNarrativeRewrite(baseRequest);

  assertEquals(result.headlineLead, baseRequest.headlineLead);
  assertEquals(result.topHighlightWording, baseRequest.topHighlightWording);
  assertEquals(result.weeklyPointLeads, baseRequest.weeklyPointLeads);
  assertEquals(result.assisted.headline, false);
  assertEquals(result.assisted.highlights, false);
  assertEquals(result.assisted.weeklyTalkingPoints, false);
});

Deno.test("applyAiNarrativeRewrite requires OPENAI_API_KEY when mode is on", async () => {
  await assertRejects(
    () =>
      applyAiNarrativeRewrite({
        ...baseRequest,
        mode: "on",
      }),
    Error,
    "OPENAI_API_KEY",
  );
});

Deno.test("applyAiNarrativeRewrite falls back when AI response is malformed", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "not-json" } }] }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    }) as typeof fetch;

    const result = await applyAiNarrativeRewrite({
      ...baseRequest,
      mode: "auto",
      apiKey: "fake-key",
    });

    assertEquals(result.headlineLead, baseRequest.headlineLead);
    assertEquals(result.assisted.headline, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("applyAiNarrativeRewrite accepts valid structured rewrite", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                headlineLead: "AI lead",
                topHighlightWording: ["AI highlight one", "AI highlight two"],
                weeklyPointLeads: ["AI point one", "AI point two"],
              }),
            },
          }],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    }) as typeof fetch;

    const result = await applyAiNarrativeRewrite({
      ...baseRequest,
      mode: "auto",
      apiKey: "fake-key",
    });

    assertEquals(result.headlineLead, "AI lead");
    assertEquals(result.topHighlightWording[0], "AI highlight one");
    assertEquals(result.weeklyPointLeads[0], "AI point one");
    assertEquals(result.assisted.headline, true);
    assertEquals(result.assisted.highlights, true);
    assertEquals(result.assisted.weeklyTalkingPoints, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
