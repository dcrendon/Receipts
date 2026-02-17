import { assertEquals } from "@std/assert";
import { getDateRange, getPreviousDateRange } from "../../config/dates.ts";

Deno.test("getDateRange returns ISO bounds for week range", () => {
  const { startDate, endDate } = getDateRange({
    timeRange: "week",
  });

  assertEquals(typeof startDate, "string");
  assertEquals(typeof endDate, "string");
  assertEquals(startDate.includes("T"), true);
  assertEquals(endDate.includes("T"), true);
});

Deno.test("getDateRange returns full-day bounds for custom range", () => {
  const { startDate, endDate } = getDateRange({
    timeRange: "custom",
    startDate: "02-01-2026",
    endDate: "02-02-2026",
  });

  assertEquals(startDate.startsWith("2026-02-01T00:00:00"), true);
  assertEquals(endDate.startsWith("2026-02-02T23:59:59"), true);
});

Deno.test("getPreviousDateRange mirrors current window duration", () => {
  const currentStart = "2026-02-08T00:00:00.000Z";
  const currentEnd = "2026-02-14T23:59:59.999Z";
  const previous = getPreviousDateRange({
    startDate: currentStart,
    endDate: currentEnd,
  });

  const currentDuration = Date.parse(currentEnd) - Date.parse(currentStart);
  const previousDuration = Date.parse(previous.endDate) -
    Date.parse(previous.startDate);
  assertEquals(Math.abs(previousDuration - currentDuration) <= 1000, true);
  assertEquals(
    Math.abs((Date.parse(previous.endDate) + 1) - Date.parse(currentStart)) <=
      1000,
    true,
  );
});
