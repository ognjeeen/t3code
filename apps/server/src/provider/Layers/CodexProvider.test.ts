import assert from "node:assert/strict";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, it } from "@effect/vitest";
import { CodexSettings } from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as CodexErrors from "effect-codex-app-server/errors";

import { ServerSettingsService } from "../../serverSettings.ts";
import { checkCodexProviderStatus } from "./CodexProvider.ts";

const testLayer = Layer.mergeAll(ServerSettingsService.layerTest(), NodeServices.layer);
const codexSettings: CodexSettings = {
  enabled: true,
  binaryPath: "codex",
  homePath: "",
  shadowHomePath: "",
  customModels: [],
};

describe("CodexProvider account usage", () => {
  it.effect("attaches account usage when account/rateLimits/read succeeds", () =>
    Effect.gen(function* () {
      const status = yield* checkCodexProviderStatus(codexSettings, () =>
        Effect.succeed({
          version: "1.0.0",
          account: {
            account: {
              type: "chatgpt",
              email: "test@example.com",
              planType: "pro",
            },
            requiresOpenaiAuth: false,
          },
          models: [],
          skills: [],
          accountUsage: {
            source: "codex.app-server.rate-limits",
            updatedAt: 1_746_000_000_000,
            limitId: "codex",
            limitName: "Codex",
            planType: "pro",
            primary: {
              usedPercent: 75,
              resetsAt: 1_746_000_360_000,
              windowDurationMins: 60,
            },
            secondary: null,
            credits: {
              hasCredits: true,
              unlimited: false,
              balance: "$8.00",
            },
            rateLimitReachedType: null,
          },
        }),
      );

      assert.equal(status.accountUsage?.limitId, "codex");
      assert.equal(status.accountUsage?.primary?.usedPercent, 75);
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("does not fail provider probe when account usage is unavailable", () =>
    Effect.gen(function* () {
      const status = yield* checkCodexProviderStatus(codexSettings, () =>
        Effect.succeed({
          version: "1.0.0",
          account: {
            account: {
              type: "chatgpt",
              email: "test@example.com",
              planType: "pro",
            },
            requiresOpenaiAuth: false,
          },
          models: [],
          skills: [],
        }),
      );

      assert.equal(status.status, "ready");
      assert.equal(status.accountUsage, undefined);
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("still surfaces actual probe failures", () =>
    Effect.gen(function* () {
      const result = yield* checkCodexProviderStatus(codexSettings, () =>
        Effect.fail(
          new CodexErrors.CodexAppServerSpawnError({
            command: "codex app-server",
            cause: new Error("spawn codex ENOENT"),
          }),
        ),
      ).pipe(Effect.result);

      assert.equal(result._tag, "Success");
      if (result._tag !== "Success") {
        return;
      }
      assert.equal(result.success.status, "error");
      assert.equal(result.success.accountUsage, undefined);
    }).pipe(Effect.provide(testLayer)),
  );
});
