import { Schema } from "effect";

export const ProviderAccountUsageWindow = Schema.Struct({
  usedPercent: Schema.Number,
  resetsAt: Schema.optional(Schema.NullOr(Schema.Number)),
  windowDurationMins: Schema.optional(Schema.NullOr(Schema.Number)),
});
export type ProviderAccountUsageWindow = typeof ProviderAccountUsageWindow.Type;

export const ProviderAccountUsageCredits = Schema.Struct({
  hasCredits: Schema.Boolean,
  unlimited: Schema.Boolean,
  balance: Schema.optional(Schema.NullOr(Schema.String)),
});
export type ProviderAccountUsageCredits = typeof ProviderAccountUsageCredits.Type;

export const ProviderAccountUsageSnapshot = Schema.Struct({
  source: Schema.Literal("codex.app-server.rate-limits"),
  updatedAt: Schema.Number,
  limitId: Schema.optional(Schema.NullOr(Schema.String)),
  limitName: Schema.optional(Schema.NullOr(Schema.String)),
  planType: Schema.optional(Schema.NullOr(Schema.String)),
  primary: Schema.optional(Schema.NullOr(ProviderAccountUsageWindow)),
  secondary: Schema.optional(Schema.NullOr(ProviderAccountUsageWindow)),
  credits: Schema.optional(Schema.NullOr(ProviderAccountUsageCredits)),
  rateLimitReachedType: Schema.optional(Schema.NullOr(Schema.String)),
});
export type ProviderAccountUsageSnapshot = typeof ProviderAccountUsageSnapshot.Type;
