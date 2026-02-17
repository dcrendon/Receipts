import { AiNarrativeMode, ReportProfile } from "../shared/types.ts";
import type { ReportIssueView } from "./reporting.ts";

interface AiNarrativeIssuePayload {
  key: string;
  title: string;
  state: string;
  bucket: string;
  labels: string[];
  updatedAt: string;
  commentCount: number;
  impactScore: number;
  descriptionSnippet: string;
}

interface AiNarrativeRequest {
  mode: AiNarrativeMode;
  model: string;
  apiKey?: string;
  headlineLead: string;
  topHighlightWording: string[];
  weeklyPointLeads: string[];
  context: {
    startDate: string;
    endDate: string;
    fetchMode: string;
    reportProfile: ReportProfile;
  };
  payload: {
    highlights: ReportIssueView[];
    collaboration: ReportIssueView[];
    risks: ReportIssueView[];
  };
}

interface AiRewriteResponse {
  headlineLead: string;
  topHighlightWording: string[];
  weeklyPointLeads: string[];
}

export interface AiNarrativeResult {
  headlineLead: string;
  topHighlightWording: string[];
  weeklyPointLeads: string[];
  assisted: {
    headline: boolean;
    highlights: boolean;
    weeklyTalkingPoints: boolean;
  };
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const truncateSnippet = (value: string): string => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 280) return cleaned;
  return `${cleaned.slice(0, 277)}...`;
};

const toIssuePayload = (issue: ReportIssueView): AiNarrativeIssuePayload => ({
  key: issue.key,
  title: issue.title,
  state: issue.state,
  bucket: issue.bucket,
  labels: issue.labels,
  updatedAt: issue.updatedAt,
  commentCount: issue.userCommentCount,
  impactScore: issue.impactScore,
  descriptionSnippet: truncateSnippet(issue.descriptionSnippet),
});

const fallbackResult = (request: AiNarrativeRequest): AiNarrativeResult => ({
  headlineLead: request.headlineLead,
  topHighlightWording: request.topHighlightWording,
  weeklyPointLeads: request.weeklyPointLeads,
  assisted: {
    headline: false,
    highlights: false,
    weeklyTalkingPoints: false,
  },
});

const extractJsonObject = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (blockMatch?.[1]) {
    return blockMatch[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
};

const isStringArray = (
  value: unknown,
  expectedLength: number,
): value is string[] => {
  return (
    Array.isArray(value) &&
    value.length === expectedLength &&
    value.every((entry) => typeof entry === "string" && entry.trim().length > 0)
  );
};

const parseRewriteResponse = (
  rawContent: string,
  request: AiNarrativeRequest,
): AiRewriteResponse => {
  const parsed = JSON.parse(extractJsonObject(rawContent)) as Record<
    string,
    unknown
  >;

  const headlineLead = typeof parsed.headlineLead === "string"
    ? parsed.headlineLead.trim()
    : "";

  if (!headlineLead) {
    throw new Error("AI response missing headlineLead.");
  }

  if (
    !isStringArray(
      parsed.topHighlightWording,
      request.topHighlightWording.length,
    )
  ) {
    throw new Error(
      "AI response topHighlightWording did not match expected structure.",
    );
  }

  if (
    !isStringArray(parsed.weeklyPointLeads, request.weeklyPointLeads.length)
  ) {
    throw new Error(
      "AI response weeklyPointLeads did not match expected structure.",
    );
  }

  return {
    headlineLead,
    topHighlightWording: parsed.topHighlightWording,
    weeklyPointLeads: parsed.weeklyPointLeads,
  };
};

const buildPrompt = (request: AiNarrativeRequest): string => {
  const payload = {
    context: request.context,
    instructions: {
      guardrails: [
        "Rewrite wording only.",
        "Do not add, remove, reorder, or replace issues.",
        "Do not alter counts, dates, impact scores, or provider totals.",
        "Keep output concise and executive-friendly.",
      ],
      outputShape: {
        headlineLead: "string",
        topHighlightWording: `string[${request.topHighlightWording.length}]`,
        weeklyPointLeads: `string[${request.weeklyPointLeads.length}]`,
      },
    },
    deterministic: {
      headlineLead: request.headlineLead,
      topHighlightWording: request.topHighlightWording,
      weeklyPointLeads: request.weeklyPointLeads,
    },
    issuePayload: {
      highlights: request.payload.highlights.map(toIssuePayload),
      collaboration: request.payload.collaboration.map(toIssuePayload),
      risks: request.payload.risks.map(toIssuePayload),
    },
  };

  return JSON.stringify(payload, null, 2);
};

const rewriteWithOpenAI = async (
  request: AiNarrativeRequest,
): Promise<AiNarrativeResult> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${request.apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You rewrite status-report narrative text. Preserve factual meaning, counts, ordering, and selected issues exactly.",
        },
        {
          role: "user",
          content: buildPrompt(request),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status}).`);
  }

  const body = await response.json() as OpenAIChatResponse;
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response did not include message content.");
  }

  const rewritten = parseRewriteResponse(content, request);

  return {
    headlineLead: rewritten.headlineLead,
    topHighlightWording: rewritten.topHighlightWording,
    weeklyPointLeads: rewritten.weeklyPointLeads,
    assisted: {
      headline: rewritten.headlineLead !== request.headlineLead,
      highlights: rewritten.topHighlightWording.some((line, index) =>
        line !== request.topHighlightWording[index]
      ),
      weeklyTalkingPoints: rewritten.weeklyPointLeads.some((line, index) =>
        line !== request.weeklyPointLeads[index]
      ),
    },
  };
};

export const applyAiNarrativeRewrite = async (
  request: AiNarrativeRequest,
): Promise<AiNarrativeResult> => {
  if (request.mode === "off") {
    return fallbackResult(request);
  }

  if (!request.apiKey) {
    if (request.mode === "on") {
      throw new Error(
        "AI narrative mode is `on` but OPENAI_API_KEY is missing. Set OPENAI_API_KEY or use --aiNarrative auto/off.",
      );
    }
    return fallbackResult(request);
  }

  try {
    return await rewriteWithOpenAI(request);
  } catch {
    return fallbackResult(request);
  }
};
