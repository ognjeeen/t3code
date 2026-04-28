import type { ProviderAccountUsageSnapshot } from "@t3tools/contracts";

export type AccountUsageSeverity = "normal" | "warning" | "critical";

const STALE_AFTER_MS = 15 * 60 * 1_000;
const MINUTE_MS = 60 * 1_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function normalizeAccountUsageTimestamp(timestamp: number): number {
  if (!Number.isFinite(timestamp)) {
    return timestamp;
  }

  const absoluteValue = Math.abs(timestamp);
  if (absoluteValue < 10_000_000_000) {
    return timestamp * 1_000;
  }
  if (absoluteValue > 10_000_000_000_000) {
    return Math.trunc(timestamp / 1_000);
  }
  return timestamp;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function formatUsagePercent(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  const normalized = clampPercent(value);
  return normalized < 10
    ? `${normalized.toFixed(1).replace(/\.0$/, "")}%`
    : `${Math.round(normalized)}%`;
}

export function getRemainingPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return clampPercent(100 - value);
}

export function formatResetTime(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined || !Number.isFinite(timestamp)) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(normalizeAccountUsageTimestamp(timestamp)));
}

export function formatTimeUntilReset(
  timestamp: number | null | undefined,
  now = Date.now(),
): string | null {
  if (timestamp === null || timestamp === undefined || !Number.isFinite(timestamp)) {
    return null;
  }

  const diffMs = normalizeAccountUsageTimestamp(timestamp) - now;
  if (diffMs <= 0) {
    return "Now";
  }

  const days = Math.floor(diffMs / DAY_MS);
  const hours = Math.floor((diffMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diffMs % HOUR_MS) / MINUTE_MS);

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return "<1m";
}

export function formatWindowDuration(windowDurationMins: number | null | undefined): string | null {
  if (
    windowDurationMins === null ||
    windowDurationMins === undefined ||
    !Number.isFinite(windowDurationMins) ||
    windowDurationMins <= 0
  ) {
    return null;
  }

  if (windowDurationMins % (24 * 60) === 0) {
    const days = windowDurationMins / (24 * 60);
    return days === 1 ? "1 day" : `${days} days`;
  }

  if (windowDurationMins % 60 === 0) {
    const hours = windowDurationMins / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  const hours = Math.floor(windowDurationMins / 60);
  const minutes = windowDurationMins % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${windowDurationMins} min`;
}

export function formatPlanType(planType: string | null | undefined): string | null {
  const normalized = planType?.trim();
  return normalized ? normalized.toLocaleUpperCase() : null;
}

export function getAccountUsageWindowLabel(
  kind: "primary" | "secondary",
  windowDurationMins: number | null | undefined,
): string {
  if (kind === "primary" && windowDurationMins === 5 * 60) {
    return "5-hour limit";
  }
  if (kind === "secondary" && windowDurationMins === 7 * 24 * 60) {
    return "Weekly limit";
  }

  const formattedDuration = formatWindowDuration(windowDurationMins);
  if (formattedDuration) {
    return `${formattedDuration} limit`;
  }

  return kind === "primary" ? "Primary limit" : "Secondary limit";
}

export function isAccountUsageStale(
  accountUsage: ProviderAccountUsageSnapshot,
  now = Date.now(),
): boolean {
  return now - accountUsage.updatedAt > STALE_AFTER_MS;
}

export function getAccountUsageSeverity(
  accountUsage: ProviderAccountUsageSnapshot,
): AccountUsageSeverity {
  const usedPercent = accountUsage.primary?.usedPercent ?? 0;
  if (accountUsage.rateLimitReachedType || usedPercent >= 100) {
    return "critical";
  }
  if (usedPercent >= 80) {
    return "warning";
  }
  return "normal";
}
