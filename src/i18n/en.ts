/**
 * English translation dictionary
 */
const en: Record<string, string> = {
  // ── Notifications ──
  balance_refreshed: "Balance status refreshed",
  sub2api_cache_cleared: "Sub2Api probe cache cleared, will rescan",
  unknown_provider: "Unknown provider: {name}",
  provider_enabled: "{label} display enabled",
  provider_disabled: "{label} display disabled",
  provider_toggled: "{label} display {status}",

  // ── Language switching ──
  lang_switched_zh: "Switched to Simplified Chinese",
  lang_switched_en: "Switched to English",
  lang_unsupported: "Unsupported language: {name}. Available: zh-CN, en",

  // ── Status keywords ──
  status_enabled: "enabled",
  status_disabled: "disabled",
  status_available: "available",
  status_not_ready: "not ready",

  // ── Menu ──
  menu_refresh: "Refresh",
  menu_back: "Back",
  menu_display: "Display",

  // ── Provider descriptions ──
  desc_deepseek: "DeepSeek /user/balance balance",
  desc_moonshot: "Moonshot /v1/users/me/balance balance",
  desc_openrouter: "OpenRouter /credits remaining credits",
  desc_sub2api: "Sub2Api /usage remaining quota",
  desc_codex: "OpenAI Codex ChatGPT subscription usage",
  desc_nous: "Nous Portal subscription + top-up credits",

  // ── Provider support details ──
  support_model_found: "Found {provider} model",
  support_model_not_found: "No {provider} model found",
  support_auth_available: "{provider} auth available",
  support_auth_unavailable: "{provider} auth unavailable",

  // ── Sub2Api support details ──
  support_sub2api_compat: "Compatible API will try /usage and /v1/usage on current model baseUrl",
  support_sub2api_auth_available: "At least one model auth available",
  support_sub2api_no_auth: "No available model auth found",

  // ── Codex support details ──
  support_codex_fallback_on: "Will reuse Pi Codex subscription auth, fallback to codex app-server if needed",
  support_codex_fallback_off: "Will only reuse Pi Codex subscription auth; codex app-server fallback disabled",

  // ── Codex menu ──
  codex_no_credits: "no credits",
  codex_unlimited: "unlimited",
  codex_credits: "credits",
  codex_cli_fallback: "CLI fallback",
};

export default en;
