import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Api, Model } from "@earendil-works/pi-ai";
import type {
  BalanceResult,
  BalanceConfig,
  FetchContext,
  ProviderSupport,
} from "../types.js";
import { getJson, getRecord, toNumber } from "../utils.js";
import type { BalanceProvider } from "./types.js";
import { registry } from "./registry.js";
import { t } from "../i18n/index.js";

// ══════════════════════════════════════════════════════════════
// Nous Research Portal balance provider
// ══════════════════════════════════════════════════════════════

const PORTAL_BASE_URL = "https://portal.nousresearch.com";

const NOUS_PROVIDER_IDS = new Set(["nousresearch", "nous-portal", "nous-portal-api-key"]);

function portalBaseUrl(): string {
  const fromEnv = process.env.NOUS_PORTAL_BASE_URL?.trim();
  return (fromEnv || PORTAL_BASE_URL).replace(/\/+$/, "");
}

/** Whether the given model/baseUrl belongs to the Nous Research Portal. */
export function isNousModel(model: Model<Api>, baseUrl?: string): boolean {
  if (NOUS_PROVIDER_IDS.has(model.provider)) return true;
  return Boolean(baseUrl?.includes("nousresearch.com"));
}

/**
 * Subscription credits remaining this billing cycle.
 * GET {portal}/api/billing/subscription → current.creditsRemaining
 */
export function extractNousCreditsRemaining(payload: unknown): number | undefined {
  const current = getRecord(getRecord(payload)?.current);
  return toNumber(current?.creditsRemaining);
}

/**
 * Prepaid / top-up credit balance.
 * GET {portal}/api/billing/state → balanceUsd
 */
export function extractNousBalanceUsd(payload: unknown): number | undefined {
  return toNumber(getRecord(payload)?.balanceUsd);
}

/**
 * Total available balance from the two Nous Portal billing payloads:
 * subscription credits remaining plus any separate prepaid/top-up balance.
 * When either payload is missing or yields no value (e.g. its endpoint
 * failed), fall back to whichever value is available.
 */
export function combineNousBalances(
  subscription: unknown,
  state: unknown,
): BalanceResult | undefined {
  const creditsRemaining = extractNousCreditsRemaining(subscription);
  const balanceUsd = extractNousBalanceUsd(state);

  if (creditsRemaining !== undefined && balanceUsd !== undefined) {
    return { amount: creditsRemaining + balanceUsd, unit: "$" };
  }
  if (creditsRemaining !== undefined) return { amount: creditsRemaining, unit: "$" };
  if (balanceUsd !== undefined) return { amount: balanceUsd, unit: "$" };
  return undefined;
}

/**
 * Build portal request headers.  The portal billing endpoints accept the same
 * portal-issued Bearer token used for the inference API, so reuse the resolved
 * auth header instead of forwarding every model header.
 */
function buildPortalHeaders(context: FetchContext): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const authorization = Object.entries(context.headers).find(
    ([key]) => key.toLowerCase() === "authorization",
  )?.[1];
  if (authorization) headers.Authorization = authorization;
  return headers;
}

export const nousProvider: BalanceProvider = {
  key: "nous",
  definition: {
    key: "nous",
    label: "Nous Portal",
    description: t("desc_nous"),
    enabledByDefault: true,
  },

  shouldTry(model: Model<Api>, baseUrl: string): boolean {
    return isNousModel(model, baseUrl);
  },

  async fetchBalance(
    context: FetchContext,
    signal?: AbortSignal,
  ): Promise<BalanceResult | undefined> {
    const headers = buildPortalHeaders(context);
    if (!headers.Authorization) return undefined;

    const base = portalBaseUrl();

    // Total available balance: subscription credits remaining plus the
    // separate prepaid/top-up balance; degrade to whichever is available.
    const subscription = await getJson(`${base}/api/billing/subscription`, headers, signal);
    const state = await getJson(`${base}/api/billing/state`, headers, signal);
    return combineNousBalances(subscription, state);
  },

  getSupport(
    ctx: ExtensionContext,
    _config: BalanceConfig,
  ): ProviderSupport {
    const models = ctx.modelRegistry.getAll();
    const availableModels = ctx.modelRegistry.getAvailable();

    const hasModel = models.some((model) => isNousModel(model, model.baseUrl));
    const configured = availableModels.some((model) => isNousModel(model, model.baseUrl));

    return {
      provider: this.definition,
      configured,
      enabled: true, // will be determined by config
      details: [
        hasModel
          ? t("support_model_found", { provider: "Nous Portal" })
          : t("support_model_not_found", { provider: "Nous Portal" }),
        configured
          ? t("support_auth_available", { provider: "Nous Portal" })
          : t("support_auth_unavailable", { provider: "Nous Portal" }),
      ],
    };
  },
};

registry.register(nousProvider);
