import { describe, expect, it, vi } from "vitest";

import {
  formatPlanType,
  formatResetTime,
  formatTimeUntilReset,
  formatUsagePercent,
  formatWindowDuration,
  getAccountUsageWindowLabel,
  getAccountUsageSeverity,
  getRemainingPercent,
  normalizeAccountUsageTimestamp,
  isAccountUsageStale,
} from "./accountUsage";

describe("accountUsage", () => {
  it("formats percentages and remaining values", () => {
    expect(formatUsagePercent(82)).toBe("82%");
    expect(formatUsagePercent(9)).toBe("9%");
    expect(getRemainingPercent(82)).toBe(18);
    expect(getRemainingPercent(0)).toBe(100);
    expect(getRemainingPercent(100)).toBe(0);
    expect(getRemainingPercent(125)).toBe(0);
    expect(getRemainingPercent(-10)).toBe(100);
  });

  it("formats reset times", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-28T12:00:00.000Z"));

    expect(formatResetTime(Date.parse("2026-04-28T14:30:00.000Z"))).toBeTruthy();
    expect(formatTimeUntilReset(Date.parse("2026-04-28T14:30:00.000Z"))).toBe("2h 30m");

    vi.useRealTimers();
  });

  it("normalizes second-based timestamps before formatting reset times", () => {
    const resetAtSeconds = Math.floor(Date.parse("2026-04-28T14:30:00.000Z") / 1_000);

    expect(normalizeAccountUsageTimestamp(resetAtSeconds)).toBe(
      Date.parse("2026-04-28T14:30:00.000Z"),
    );
    expect(formatResetTime(resetAtSeconds)).toBe(formatResetTime(resetAtSeconds * 1_000));
  });

  it("formats durations, plan names, and usage window labels for the UI", () => {
    expect(formatWindowDuration(300)).toBe("5 hours");
    expect(formatWindowDuration(10_080)).toBe("7 days");
    expect(formatPlanType("plus")).toBe("PLUS");
    expect(getAccountUsageWindowLabel("primary", 300)).toBe("5-hour limit");
    expect(getAccountUsageWindowLabel("secondary", 10_080)).toBe("Weekly limit");
  });

  it("detects stale snapshots", () => {
    expect(
      isAccountUsageStale(
        {
          source: "codex.app-server.rate-limits",
          updatedAt: Date.parse("2026-04-28T11:00:00.000Z"),
        },
        Date.parse("2026-04-28T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("computes severity", () => {
    expect(
      getAccountUsageSeverity({
        source: "codex.app-server.rate-limits",
        updatedAt: 0,
        primary: { usedPercent: 79 },
      }),
    ).toBe("normal");
    expect(
      getAccountUsageSeverity({
        source: "codex.app-server.rate-limits",
        updatedAt: 0,
        primary: { usedPercent: 80 },
      }),
    ).toBe("warning");
    expect(
      getAccountUsageSeverity({
        source: "codex.app-server.rate-limits",
        updatedAt: 0,
        primary: { usedPercent: 60 },
        rateLimitReachedType: "primary",
      }),
    ).toBe("critical");
  });
});
