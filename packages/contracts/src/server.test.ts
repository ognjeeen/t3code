import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { ServerProvider } from "./server.ts";

const decodeServerProvider = Schema.decodeUnknownSync(ServerProvider);

describe("ServerProvider", () => {
  it("defaults capability arrays when decoding legacy snapshots", () => {
    const parsed = decodeServerProvider({
      provider: "codex",
      enabled: true,
      installed: true,
      version: "1.0.0",
      status: "ready",
      auth: {
        status: "authenticated",
      },
      checkedAt: "2026-04-10T00:00:00.000Z",
      models: [],
    });

    expect(parsed.slashCommands).toEqual([]);
    expect(parsed.skills).toEqual([]);
  });

  it("decodes optional provider account usage", () => {
    const parsed = decodeServerProvider({
      provider: "codex",
      enabled: true,
      installed: true,
      version: "1.0.0",
      status: "ready",
      auth: {
        status: "authenticated",
      },
      checkedAt: "2026-04-10T00:00:00.000Z",
      models: [],
      accountUsage: {
        source: "codex.app-server.rate-limits",
        updatedAt: 1_746_000_000_000,
        limitId: "codex",
        primary: {
          usedPercent: 42,
        },
      },
    });

    expect(parsed.accountUsage?.limitId).toBe("codex");
    expect(parsed.accountUsage?.primary?.usedPercent).toBe(42);
  });
});
