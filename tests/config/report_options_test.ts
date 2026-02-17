import { assertEquals, assertThrows } from "@std/assert";
import {
  parseAiNarrativeMode,
  parseAttributionUsername,
  parseReportFormat,
  parseReportProfile,
} from "../../config/report_options.ts";

Deno.test("parseReportProfile accepts valid values", () => {
  assertEquals(parseReportProfile("brief"), "brief");
  assertEquals(parseReportProfile("ACTIVITY_RETRO"), "activity_retro");
  assertEquals(parseReportProfile("showcase"), "showcase");
});

Deno.test("parseReportProfile hard-rejects manager_retro", () => {
  assertThrows(
    () => parseReportProfile("manager_retro"),
    Error,
    "manager_retro",
  );
});

Deno.test("parseReportFormat and parseAiNarrativeMode parse values", () => {
  assertEquals(parseReportFormat("markdown"), "markdown");
  assertEquals(parseReportFormat("HTML"), "html");
  assertEquals(parseReportFormat("both"), "both");

  assertEquals(parseAiNarrativeMode("auto"), "auto");
  assertEquals(parseAiNarrativeMode("ON"), "on");
  assertEquals(parseAiNarrativeMode("off"), "off");
});

Deno.test("parseAttributionUsername trims values", () => {
  assertEquals(parseAttributionUsername("  mock.user  "), "mock.user");
  assertEquals(parseAttributionUsername("   "), undefined);
});
