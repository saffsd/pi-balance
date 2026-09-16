import assert from "node:assert/strict";
import test from "node:test";

import {
  extractRemaining,
  extractMoonshotAvailableBalance,
  extractOpenRouterRemaining,
  extractNousCreditsRemaining,
  extractNousBalanceUsd,
  combineNousBalances,
  isNousModel,
  formatCodexUsageStatusline,
  getSub2ApiUsageUrls,
  normalizeAppServerResponse,
  normalizeBackendPayload,
  selectCodexSnapshot,
} from "../src/index.ts";

test("getSub2ApiUsageUrls tries both root and v1 usage endpoints", () => {
  assert.deepEqual(getSub2ApiUsageUrls("https://api.example.com/v1"), [
    "https://api.example.com/v1/usage",
    "https://api.example.com/usage",
  ]);
  assert.deepEqual(getSub2ApiUsageUrls("https://api.example.com"), [
    "https://api.example.com/usage",
    "https://api.example.com/v1/usage",
  ]);
});

test("extractRemaining supports common Sub2Api response shapes", () => {
  assert.equal(extractRemaining({ remaining: "12.5" }), 12.5);
  assert.equal(extractRemaining({ data: { remaining: 3 } }), 3);
  assert.equal(extractRemaining({ usage: { remaining: "9" } }), 9);
  assert.equal(extractRemaining({ usage: { used: 9 } }), undefined);
});

test("extractMoonshotAvailableBalance parses Kimi balance response", () => {
  assert.equal(
    extractMoonshotAvailableBalance({
      code: 0,
      data: {
        available_balance: 49.58894,
        voucher_balance: 46.58893,
        cash_balance: 3.00001,
      },
      scode: "0x0",
      status: true,
    }),
    49.58894,
  );
  assert.equal(extractMoonshotAvailableBalance({ code: 1, status: false, data: {} }), undefined);
});

test("normalizeBackendPayload parses backend rate limits and credits", () => {
  const report = normalizeBackendPayload(
    {
      plan_type: "plus",
      rate_limit: {
        primary_window: { used_percent: 25, limit_window_seconds: 18_000, reset_at: 123 },
        secondary_window: { used_percent: "50%", limit_window_seconds: 604_800, reset_at: 456 },
      },
      credits: { has_credits: true, unlimited: false, balance: "42.5" },
    },
    1000,
    "pi-auth",
  );

  assert.equal(report?.source, "pi-auth");
  assert.equal(report?.planType, "plus");
  assert.equal(report?.snapshots[0]?.primary?.usedPercent, 25);
  assert.equal(report?.snapshots[0]?.secondary?.usedPercent, 50);
  assert.equal(report?.snapshots[0]?.credits?.balance, "42.5");
});

test("normalizeAppServerResponse parses app-server multi bucket response", () => {
  const report = normalizeAppServerResponse(
    {
      rateLimits: {
        limitId: "codex",
        limitName: "Codex",
        primary: { usedPercent: 10, windowDurationMins: 300, resetsAt: 123 },
        secondary: null,
        credits: null,
        planType: "pro",
      },
      rateLimitsByLimitId: {
        "gpt-5-codex": {
          limitId: "gpt-5-codex",
          limitName: "GPT-5 Codex",
          primary: { usedPercent: 80, windowDurationMins: 300, resetsAt: 456 },
          secondary: { usedPercent: 20, windowDurationMins: 10_080, resetsAt: 789 },
          credits: { hasCredits: true, unlimited: false, balance: "7" },
        },
      },
    },
    2000,
  );

  assert.equal(report?.source, "codex-app-server");
  assert.equal(report?.planType, "pro");
  assert.equal(report?.snapshots.length, 2);
  assert.equal(report?.snapshots[1]?.limitId, "gpt-5-codex");
  assert.equal(report?.snapshots[1]?.credits?.balance, "7");
});

test("selectCodexSnapshot prefers the active Codex model bucket", () => {
  const report = normalizeAppServerResponse(
    {
      rateLimits: {
        limitId: "codex",
        limitName: "Codex",
        primary: { usedPercent: 10, windowDurationMins: 300, resetsAt: 123 },
        secondary: null,
        credits: null,
      },
      rateLimitsByLimitId: {
        "gpt-5-codex": {
          limitId: "gpt-5-codex",
          limitName: "GPT-5 Codex",
          primary: { usedPercent: 80, windowDurationMins: 300, resetsAt: 456 },
          secondary: null,
          credits: null,
        },
      },
    },
    2000,
  );

  assert.ok(report);
  const selected = selectCodexSnapshot(report, {
    provider: "openai-codex",
    id: "gpt-5-codex",
    name: "GPT-5 Codex",
  });
  assert.equal(selected?.limitId, "gpt-5-codex");
});

test("formatCodexUsageStatusline formats remaining percentage and credits fallback", () => {
  const usageReport = normalizeAppServerResponse(
    {
      rateLimits: {
        limitId: "codex",
        limitName: "Codex",
        primary: { usedPercent: 25, windowDurationMins: 300, resetsAt: 123 },
        secondary: { usedPercent: 40, windowDurationMins: 10_080, resetsAt: 456 },
        credits: null,
      },
      rateLimitsByLimitId: null,
    },
    2000,
  );
  assert.ok(usageReport);
  assert.equal(formatCodexUsageStatusline(usageReport), "📊 codex 75% 5h 60% wk");

  const creditsReport = normalizeAppServerResponse(
    {
      rateLimits: {
        limitId: "codex",
        limitName: "Codex",
        primary: null,
        secondary: null,
        credits: { hasCredits: true, unlimited: false, balance: "12.345" },
      },
      rateLimitsByLimitId: null,
    },
    2000,
  );
  assert.ok(creditsReport);
  assert.equal(formatCodexUsageStatusline(creditsReport), "📊 codex 12.35 credits");
});

test("extractOpenRouterRemaining should compute remaining from total_credits minus total_usage", () => {
  const payload = {
    data: { total_credits: 100.0, total_usage: 35.25 },
  };
  const remaining = extractOpenRouterRemaining(payload);
  assert.equal(remaining, 64.75);
});

test("extractOpenRouterRemaining should return undefined when data is missing", () => {
  assert.equal(extractOpenRouterRemaining({}), undefined);
  assert.equal(extractOpenRouterRemaining({ data: {} }), undefined);
  assert.equal(extractOpenRouterRemaining({ data: { total_credits: 100 } }), undefined);
  assert.equal(extractOpenRouterRemaining({ data: { total_usage: 50 } }), undefined);
  assert.equal(extractOpenRouterRemaining(undefined), undefined);
  assert.equal(extractOpenRouterRemaining(null), undefined);
});

test("extractNousCreditsRemaining parses Nous Portal subscription payload", () => {
  assert.equal(
    extractNousCreditsRemaining({
      current: { tierId: "tier", monthlyCredits: "22", creditsRemaining: "12.432885981112" },
    }),
    12.432885981112,
  );
  assert.equal(extractNousCreditsRemaining({ current: { creditsRemaining: 5 } }), 5);
  assert.equal(extractNousCreditsRemaining({ current: null }), undefined);
  assert.equal(extractNousCreditsRemaining({}), undefined);
  assert.equal(extractNousCreditsRemaining(undefined), undefined);
  assert.equal(extractNousCreditsRemaining(null), undefined);
});

test("extractNousBalanceUsd parses Nous Portal billing state payload", () => {
  assert.equal(extractNousBalanceUsd({ balanceUsd: "42.5" }), 42.5);
  assert.equal(extractNousBalanceUsd({ balanceUsd: 0 }), 0);
  assert.equal(extractNousBalanceUsd({ balanceUsd: null }), undefined);
  assert.equal(extractNousBalanceUsd({}), undefined);
  assert.equal(extractNousBalanceUsd(undefined), undefined);
});

// Trimmed fixtures matching the live Nous Portal billing API responses:
// subscription → GET /api/billing/subscription, state → GET /api/billing/state.
const nousSubscriptionPayload = {
  context: "personal",
  org: { id: "nas_organisation:id", slug: "slug", name: "Account", role: "OWNER" },
  current: {
    tierId: "tier-plus",
    tierName: "Plus",
    monthlyCredits: "22",
    creditsRemaining: "2.01",
    cycleEndsAt: "2026-10-04T03:40:13.000Z",
    cancelAtPeriodEnd: false,
    cancellationEffectiveAt: null,
    pendingDowngradeTierName: null,
    pendingDowngradeAt: null,
  },
  tiers: [],
  canChangePlan: true,
};

const nousStatePayload = {
  org: { id: "nas_organisation:id", slug: "slug", name: "Account", role: "OWNER" },
  balanceUsd: "10",
  cliBillingEnabled: true,
  chargePresets: ["100", "250", "500"],
  bounds: { minUsd: "5", maxUsd: "10000" },
  subscriptionPastDue: false,
  card: null,
  autoReload: null,
};

test("combineNousBalances sums subscription credits and top-up balance", () => {
  assert.deepEqual(combineNousBalances(nousSubscriptionPayload, nousStatePayload), {
    amount: 12.01,
    unit: "$",
  });
});

test("combineNousBalances falls back to subscription credits when top-up state is missing", () => {
  assert.deepEqual(combineNousBalances(nousSubscriptionPayload, undefined), {
    amount: 2.01,
    unit: "$",
  });
  assert.deepEqual(combineNousBalances(nousSubscriptionPayload, {}), {
    amount: 2.01,
    unit: "$",
  });
});

test("combineNousBalances falls back to top-up balance when subscription payload is missing", () => {
  assert.deepEqual(combineNousBalances(undefined, nousStatePayload), {
    amount: 10,
    unit: "$",
  });
  assert.deepEqual(combineNousBalances({}, nousStatePayload), {
    amount: 10,
    unit: "$",
  });
});

test("combineNousBalances returns undefined when neither payload yields a balance", () => {
  assert.equal(combineNousBalances(undefined, undefined), undefined);
  assert.equal(combineNousBalances({}, {}), undefined);
  assert.equal(combineNousBalances(null, null), undefined);
});

test("isNousModel matches Nous provider ids and base urls", () => {
  const model = (provider: string, baseUrl?: string) =>
    ({ provider, baseUrl }) as Parameters<typeof isNousModel>[0];
  assert.equal(isNousModel(model("nousresearch")), true);
  assert.equal(isNousModel(model("nous-portal")), true);
  assert.equal(isNousModel(model("nous-portal-api-key")), true);
  assert.equal(
    isNousModel(model("custom"), "https://inference-api.nousresearch.com/v1"),
    true,
  );
  assert.equal(isNousModel(model("deepseek"), "https://api.deepseek.com"), false);
  assert.equal(isNousModel(model("openrouter", "https://openrouter.ai/api/v1")), false);
});
