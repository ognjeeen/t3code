import type { ProviderAccountUsageSnapshot } from "@t3tools/contracts";
import * as CodexSchema from "effect-codex-app-server/schema";

type CodexReadBucket = CodexSchema.V2GetAccountRateLimitsResponse["rateLimits"];
type CodexNotificationBucket = CodexSchema.V2AccountRateLimitsUpdatedNotification["rateLimits"];

function normalizeWindow(
  window:
    | CodexSchema.V2GetAccountRateLimitsResponse__RateLimitWindow
    | CodexSchema.V2AccountRateLimitsUpdatedNotification__RateLimitWindow
    | null
    | undefined,
): ProviderAccountUsageSnapshot["primary"] {
  if (!window) {
    return null;
  }

  return {
    usedPercent: window.usedPercent,
    resetsAt: window.resetsAt ?? null,
    windowDurationMins: window.windowDurationMins ?? null,
  };
}

function normalizeCredits(
  credits:
    | CodexSchema.V2GetAccountRateLimitsResponse__CreditsSnapshot
    | CodexSchema.V2AccountRateLimitsUpdatedNotification__CreditsSnapshot
    | null
    | undefined,
): ProviderAccountUsageSnapshot["credits"] {
  if (!credits) {
    return null;
  }

  return {
    hasCredits: credits.hasCredits,
    unlimited: credits.unlimited,
    balance: credits.balance ?? null,
  };
}

function normalizeBucket(
  bucket: CodexReadBucket | CodexNotificationBucket,
  updatedAt: number,
): ProviderAccountUsageSnapshot {
  return {
    source: "codex.app-server.rate-limits",
    updatedAt,
    limitId: bucket.limitId ?? null,
    limitName: bucket.limitName ?? null,
    planType: bucket.planType ?? null,
    primary: normalizeWindow(bucket.primary),
    secondary: normalizeWindow(bucket.secondary),
    credits: normalizeCredits(bucket.credits),
    rateLimitReachedType: bucket.rateLimitReachedType ?? null,
  };
}

function selectRateLimitsBucket(
  response: CodexSchema.V2GetAccountRateLimitsResponse,
): CodexReadBucket {
  const codexBucket = response.rateLimitsByLimitId?.codex;
  if (codexBucket) {
    return {
      ...codexBucket,
      limitId: codexBucket.limitId ?? "codex",
    };
  }

  const discoveredCodexBucket = Object.values(response.rateLimitsByLimitId ?? {}).find(
    (bucket) => bucket.limitId === "codex",
  );
  if (discoveredCodexBucket) {
    return discoveredCodexBucket;
  }

  return response.rateLimits;
}

export function normalizeCodexRateLimitsReadResponse(
  response: CodexSchema.V2GetAccountRateLimitsResponse,
  updatedAt: number,
): ProviderAccountUsageSnapshot {
  return normalizeBucket(selectRateLimitsBucket(response), updatedAt);
}

export function normalizeCodexRateLimitsNotification(
  notification: CodexSchema.V2AccountRateLimitsUpdatedNotification,
  updatedAt: number,
): ProviderAccountUsageSnapshot {
  return normalizeBucket(notification.rateLimits, updatedAt);
}
