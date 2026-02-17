import {
  AiNarrativeMode,
  ReportFormat,
  ReportProfile,
} from "../shared/types.ts";

export const REPORT_PROFILES = [
  "brief",
  "activity_retro",
  "showcase",
] as const;
export const REPORT_FORMATS = ["markdown", "html", "both"] as const;
export const AI_NARRATIVE_MODES = ["auto", "on", "off"] as const;

const normalizeValue = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
};

const normalizeUsername = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const ensureAllowed = <T extends readonly string[]>(
  value: string,
  allowed: T,
  label: string,
): T[number] => {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T[number];
  }
  throw new Error(
    `Invalid ${label}: ${value}. Allowed values: ${allowed.join(", ")}.`,
  );
};

export const parseReportProfile = (
  value?: string,
): ReportProfile | undefined => {
  const normalized = normalizeValue(value);
  if (!normalized) return undefined;
  if (normalized === "manager_retro") {
    throw new Error(
      "reportProfile `manager_retro` is not supported. Use `activity_retro`.",
    );
  }
  return ensureAllowed(normalized, REPORT_PROFILES, "reportProfile");
};

export const parseReportFormat = (
  value?: string,
): ReportFormat | undefined => {
  const normalized = normalizeValue(value);
  if (!normalized) return undefined;
  return ensureAllowed(normalized, REPORT_FORMATS, "reportFormat");
};

export const parseAiNarrativeMode = (
  value?: string,
): AiNarrativeMode | undefined => {
  const normalized = normalizeValue(value);
  if (!normalized) return undefined;
  return ensureAllowed(normalized, AI_NARRATIVE_MODES, "aiNarrative");
};

export const parseAttributionUsername = (value?: string): string | undefined =>
  normalizeUsername(value);
