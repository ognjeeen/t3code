import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { ProviderAccountUsageSnapshot } from "./accountUsage.ts";

const decodeAccountUsageSnapshot = Schema.decodeUnknownSync(ProviderAccountUsageSnapshot);

describe("ProviderAccountUsageSnapshot", () => {
  it("decodes account usage snapshots", () => {
    const parsed = decodeAccountUsageSnapshot({
      source: "codex.app-server.rate-limits",
      updatedAt: 1_746_000_000_000,
      limitId: "codex",
      limitName: "Codex",
      planType: "pro",
      primary: {
        usedPercent: 82,
        resetsAt: 1_746_000_360_000,
        windowDurationMins: 60,
      },
      secondary: {
        usedPercent: 20,
      },
      credits: {
        hasCredits: true,
        unlimited: false,
        balance: "$12.34",
      },
      rateLimitReachedType: null,
    });

    expect(parsed.limitId).toBe("codex");
    expect(parsed.primary?.usedPercent).toBe(82);
    expect(parsed.credits?.balance).toBe("$12.34");
  });

  it("allows null optional codex fields", () => {
    const parsed = decodeAccountUsageSnapshot({
      source: "codex.app-server.rate-limits",
      updatedAt: 1_746_000_000_000,
      limitId: null,
      limitName: null,
      planType: null,
      primary: null,
      secondary: null,
      credits: null,
      rateLimitReachedType: null,
    });

    expect(parsed.limitId).toBeNull();
    expect(parsed.primary).toBeNull();
    expect(parsed.credits).toBeNull();
  });
});
