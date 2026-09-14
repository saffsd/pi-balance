import type { Api, Model } from "@earendil-works/pi-ai";

// ── Balance result ───────────────────────────────────────────
export type BalanceResult =
  | { amount: number; unit: string }
  | { text: string };

// ── Fetch context passed to every provider ───────────────────
export type FetchContext = {
  model: Model<Api>;
  baseUrl: string;
  headers: Record<string, string>;
  config: BalanceConfig;
};

// ── Provider keys ───────────────────────────────────────────
export const PROVIDER_KEYS = [
  "deepseek",
  "sub2api",
  "codex",
  "moonshot",
  "openrouter",
  "nous",
] as const;

export type ProviderKey = (typeof PROVIDER_KEYS)[number];

// ── Provider metadata ───────────────────────────────────────
export type ProviderDefinition = {
  key: ProviderKey;
  label: string;
  description: string;
  enabledByDefault: boolean;
};

// ── Config persisted across sessions ────────────────────────
export type BalanceConfig = {
  disabledProviders: ProviderKey[];
  disabledSub2ApiProviders: string[];
  codexAppServerFallback: boolean;
};

// ── Support status visible in the menu ──────────────────────
export type ProviderSupport = {
  provider: ProviderDefinition;
  configured: boolean;
  enabled: boolean;
  details: string[];
};

// ── Constants ───────────────────────────────────────────────
export const STATUS_KEY = "provider-balance";
export const REQUEST_TIMEOUT_MS = 8000;
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
export const CONFIG_ENTRY_TYPE = "pi-balance-config";

export const DEFAULT_CONFIG: BalanceConfig = {
  disabledProviders: [],
  disabledSub2ApiProviders: [],
  codexAppServerFallback: true,
};

export const CODEX_PROVIDER_ID = "openai-codex";
export const CODEX_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
export const CODEX_APP_SERVER_TIMEOUT_MS = 15000;
export const CODEX_STATUS_PREFIX = "📊 codex";
export const MAX_ERROR_BODY_CHARS = 600;
export const JWT_CLAIM_PATH = "https://api.openai.com/auth";
export const SUB2API_PROBE_CACHE_TTL_MS = 60 * 1000;

export const MENU_UNAVAILABLE_COLOR = "\u001b[90m";
export const MENU_MUTED_COLOR = "\u001b[90m";
export const MENU_COLOR_RESET = "\u001b[39m";
export const MENU_CURRENT_PROVIDER_COLOR = "\u001b[33m";

// ── Codex-specific types ────────────────────────────────────
export type CodexUsageReport = {
  source: "pi-auth" | "codex-app-server";
  capturedAt: number;
  planType?: string;
  snapshots: NormalizedRateLimitSnapshot[];
};

export type NormalizedRateLimitSnapshot = {
  limitId: string;
  limitName?: string;
  primary?: NormalizedRateLimitWindow;
  secondary?: NormalizedRateLimitWindow;
  credits?: NormalizedCredits;
};

export type NormalizedRateLimitWindow = {
  usedPercent: number;
  windowMinutes?: number;
  resetsAt?: number;
};

export type NormalizedCredits = {
  hasCredits: boolean;
  unlimited: boolean;
  balance?: string;
};

export type PendingRpc = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

export type RpcResponse = {
  id?: unknown;
  result?: unknown;
  error?: { message?: unknown };
};

// ── Menu helpers ────────────────────────────────────────────
export type MenuOption = {
  label: string;
  value: string;
  choice: string;
};
