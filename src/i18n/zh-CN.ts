/**
 * 简体中文翻译字典
 */
const zhCN: Record<string, string> = {
  // ── 通知 ──
  balance_refreshed: "余额状态已刷新",
  sub2api_cache_cleared: "Sub2Api provider 探测缓存已清空，将重新扫描",
  unknown_provider: '未知 provider：{name}',
  provider_enabled: "{label} 显示已开启",
  provider_disabled: "{label} 显示已关闭",
  provider_toggled: "{label} 显示已{status}",

  // ── 语言切换 ──
  lang_switched_zh: "语言已切换为简体中文",
  lang_switched_en: "语言已切换为 English",
  lang_unsupported: "不支持的语言：{name}。可用选项：zh-CN, en",

  // ── 状态关键词 ──
  status_enabled: "开启",
  status_disabled: "关闭",
  status_available: "可用",
  status_not_ready: "未就绪",

  // ── 菜单 ──
  menu_refresh: "Refresh",
  menu_back: "Back",
  menu_display: "Display",

  // ── Provider 描述 ──
  desc_deepseek: "DeepSeek /user/balance 余额",
  desc_moonshot: "Moonshot /v1/users/me/balance 余额",
  desc_openrouter: "OpenRouter /credits 剩余额度",
  desc_sub2api: "Sub2Api /usage 剩余额度",
  desc_codex: "OpenAI Codex ChatGPT 订阅用量",
  desc_nous: "Nous Portal 订阅 + 充值额度",

  // ── Provider 支持详情 ──
  support_model_found: "已发现 {provider} 模型",
  support_model_not_found: "未发现 {provider} 模型",
  support_auth_available: "{provider} 认证可用",
  support_auth_unavailable: "{provider} 认证不可用",

  // ── Sub2Api 支持详情 ──
  support_sub2api_compat: "兼容 API 会在当前模型 baseUrl 上尝试 /usage 与 /v1/usage",
  support_sub2api_auth_available: "至少一个模型认证可用",
  support_sub2api_no_auth: "未发现可用模型认证",

  // ── Codex 支持详情 ──
  support_codex_fallback_on: "会优先复用 Pi 的 Codex 订阅认证，必要时回退到 codex app-server",
  support_codex_fallback_off: "会仅复用 Pi 的 Codex 订阅认证；codex app-server 回退已关闭",

  // ── Codex 菜单 ──
  codex_no_credits: "no credits",
  codex_unlimited: "unlimited",
  codex_credits: "credits",
  codex_cli_fallback: "CLI fallback",
};

export default zhCN;
