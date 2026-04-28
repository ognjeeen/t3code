import type { ProviderAccountUsageSnapshot } from "@t3tools/contracts";
import { GaugeIcon } from "lucide-react";

import {
  formatPlanType,
  formatResetTime,
  formatTimeUntilReset,
  formatUsagePercent,
  formatWindowDuration,
  getAccountUsageWindowLabel,
  getAccountUsageSeverity,
  getRemainingPercent,
  isAccountUsageStale,
} from "~/lib/accountUsage";
import { cn } from "~/lib/utils";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";

function detailRow(label: string, value: string | null) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function AccountUsageMeter(props: { accountUsage: ProviderAccountUsageSnapshot }) {
  const { accountUsage } = props;
  const severity = getAccountUsageSeverity(accountUsage);
  const isStale = isAccountUsageStale(accountUsage);
  const usedPercent = formatUsagePercent(accountUsage.primary?.usedPercent);
  const remainingPercent = formatUsagePercent(
    getRemainingPercent(accountUsage.primary?.usedPercent),
  );
  const secondaryUsedPercent = formatUsagePercent(accountUsage.secondary?.usedPercent);
  const secondaryRemainingPercent = formatUsagePercent(
    getRemainingPercent(accountUsage.secondary?.usedPercent),
  );
  const primaryResetAt = formatResetTime(accountUsage.primary?.resetsAt);
  const secondaryResetAt = formatResetTime(accountUsage.secondary?.resetsAt);
  const primaryResetsIn = formatTimeUntilReset(accountUsage.primary?.resetsAt);
  const secondaryResetsIn = formatTimeUntilReset(accountUsage.secondary?.resetsAt);
  const planType = formatPlanType(accountUsage.planType);

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        closeDelay={0}
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs transition-opacity hover:opacity-85",
              severity === "critical"
                ? "text-rose-500"
                : severity === "warning"
                  ? "text-amber-500"
                  : "text-muted-foreground",
            )}
            aria-label={
              usedPercent ? `Codex account usage ${usedPercent} used` : "Codex account usage"
            }
          >
            <GaugeIcon className="size-3.5" />
            <span className="font-medium">{usedPercent ?? "Usage"}</span>
          </button>
        }
      />
      <PopoverPopup tooltipStyle side="top" align="end" className="w-72 px-3 py-2">
        <div className="space-y-2 leading-tight">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Codex usage
              </div>
              <div className="text-sm font-medium text-foreground">
                {accountUsage.limitName ?? accountUsage.limitId ?? "Codex"}
              </div>
            </div>
            <div
              className={cn(
                "text-[11px] font-medium",
                isStale ? "text-amber-500" : "text-muted-foreground",
              )}
            >
              {isStale ? "Stale" : "Live"}
            </div>
          </div>

          {planType ? <div className="text-xs text-muted-foreground">Plan: {planType}</div> : null}

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-foreground">
              {getAccountUsageWindowLabel("primary", accountUsage.primary?.windowDurationMins)}
            </div>
            {detailRow("Used", usedPercent)}
            {detailRow("Remaining", remainingPercent)}
            {detailRow("Reset at", primaryResetAt)}
            {detailRow("Resets in", primaryResetsIn)}
            {detailRow("Window", formatWindowDuration(accountUsage.primary?.windowDurationMins))}
          </div>

          {accountUsage.secondary ? (
            <div className="space-y-1.5 border-t border-border/60 pt-2">
              <div className="text-xs font-medium text-foreground">
                {getAccountUsageWindowLabel("secondary", accountUsage.secondary.windowDurationMins)}
              </div>
              {detailRow("Used", secondaryUsedPercent)}
              {detailRow("Remaining", secondaryRemainingPercent)}
              {detailRow("Reset at", secondaryResetAt)}
              {detailRow("Resets in", secondaryResetsIn)}
              {detailRow("Window", formatWindowDuration(accountUsage.secondary.windowDurationMins))}
            </div>
          ) : null}

          {accountUsage.credits ? (
            <div className="space-y-1.5 border-t border-border/60 pt-2">
              <div className="text-xs font-medium text-foreground">Credits</div>
              {detailRow("Available", accountUsage.credits.hasCredits ? "Yes" : "No")}
              {detailRow("Unlimited", accountUsage.credits.unlimited ? "Yes" : "No")}
              {detailRow("Balance", accountUsage.credits.balance ?? null)}
            </div>
          ) : null}

          {accountUsage.rateLimitReachedType ? (
            <div className="rounded-md bg-rose-500/10 px-2 py-1.5 text-xs text-rose-600">
              Limit reached: {accountUsage.rateLimitReachedType}
            </div>
          ) : null}

          <div className="text-[11px] text-muted-foreground">
            Last updated {formatResetTime(accountUsage.updatedAt) ?? "unknown"}
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  );
}
