<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/pi--balance-⚖️-6C5CE7?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgM0wxIDM3aDM4eiIgZmlsbD0iIzZDQ0NFNyIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxRTFDMkIiPuKZrzwvdGV4dD48L3N2Zz4=">
    <img src="https://img.shields.io/badge/pi--balance-⚖️-6C5CE7?style=for-the-badge" alt="pi-balance" height="48">
  </picture>
</p>

<p align="center">
  <strong>Real-time AI Provider Balance for <a href="https://github.com/earendil-works/pi-coding-agent">pi</a> Coding Agent</strong>
  <br>
  <sub>Display your API provider credit balance right in the pi status bar</sub>
</p>

<p align="center">
  <a href="#-features"><img src="https://img.shields.io/badge/Features-📋-6C5CE7?style=flat-square"></a>
  <a href="#-installation"><img src="https://img.shields.io/badge/Installation-📦-00B894?style=flat-square"></a>
  <a href="#-supported-providers"><img src="https://img.shields.io/badge/Providers-🔌-FD79A8?style=flat-square"></a>
  <a href="#-usage"><img src="https://img.shields.io/badge/Usage-🚀-0984E3?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/pi-balance"><img src="https://img.shields.io/npm/v/pi-balance?style=flat-square&color=CB3837"></a>
  <a href="./README.zh-CN.md"><img src="https://img.shields.io/badge/🇨🇳_中文-FADB4A?style=flat-square"></a>
</p>

<p align="center">
  <img src="https://img.dog/file/1779542581467_mzRI9XShNB2pFCVDlx1f8.webp" alt="pi-balance preview" width="600">
</p>

---

## 📋 Features

pi-balance is an **extension** for the [pi coding agent](https://github.com/earendil-works/pi-coding-agent) that automatically fetches and displays your AI provider's API credit balance in the pi **status bar**.

- ✅ **Auto-detects** your currently active model provider
- ✅ **Event-driven refresh** — balance updates automatically after each conversation (with delta display ▲▼)
- ✅ **Live updates** on provider/model switch
- ✅ **Multi-provider support** — DeepSeek, Moonshot/Kimi, OpenRouter, Sub2Api, OpenAI Codex, Nous Portal (and compatible APIs)
- ✅ **Zero configuration for balance APIs** — supported balance APIs work from existing model headers
- ✅ **Graceful fallback** — quietly hides when balance info is unavailable
- ✅ **i18n support** — English and Simplified Chinese, with `/balance lang <zh-CN|en>` command

## 📦 Installation

### Option 1: Install from npm (Recommended)

```bash
pi install npm:pi-balance
```

### Option 2: Install from GitHub

```bash
pi install git:github.com/DragonYH/pi-balance
```

### Option 3: Local Development

```bash
git clone https://github.com/DragonYH/pi-balance.git
cd pi-balance
npm install
npm run build
pi install ./
```

### Verify Installation

Restart pi. You should see the balance indicator appear in the status bar once you connect to a supported provider.

## 🔌 Supported Providers

| Provider | Balance Endpoint | Display |
|----------|--------------------------|---------|
| **DeepSeek** | `/user/balance` | ¥ (CNY) balance |
| **Moonshot / Kimi** | `/v1/users/me/balance` | ¥ (CNY) available balance |
| **Sub2Api** | `/usage` | $ (USD) remaining balance |
| **Compatible APIs** | `/usage`, `/v1/usage` | $ (USD) remaining balance |
| **OpenAI Codex** | ChatGPT Codex usage API / `codex app-server` | 5-hour and weekly usage remaining |
| **OpenRouter** | `/v1/credits` | $ (USD) remaining credits |
| **Nous Portal** | `/api/billing/subscription` + `/api/billing/state` | $ (USD) subscription + top-up credits |

> The extension automatically detects which provider you're using based on your current model configuration — no manual setup required.


## 🚀 Usage

Once installed, pi-balance works **completely automatically**:

1. **On session start** — it fetches your balance immediately
2. **On model switch** — it re-fetches for the new provider
3. **After each conversation** (`agent_end`) — automatically refreshes and shows balance delta (▲▼)

The balance is displayed in the **status bar** at the bottom of your pi terminal:

```
DeepSeek: ¥49.87
```

> If the extension cannot determine your balance (e.g., unsupported provider or network issue), the status bar entry is gracefully hidden.

### `/balance` Command

Run `/balance` to open an interactive configuration menu. You can:

- View support status for configured providers
- Expand/collapse providers to toggle display and extra options
- Enable/disable **Sub2Api** sub-providers inline (with auto-discovery)
- Toggle **Codex CLI fallback** on/off
- Refresh the current status immediately

You can also use command arguments directly:

```bash
/balance status
/balance refresh
/balance enable deepseek
/balance disable moonshot
/balance toggle codex
/balance toggle openrouter
/balance toggle sub2api
/balance sub2api               # Open Sub2Api sub-provider menu
/balance sub2api rescan         # Re-scan for new Sub2Api providers
/balance lang zh-CN             # Switch to Simplified Chinese
/balance lang en                # Switch to English
```

### Configuration Notes

- **Provider display toggles** are saved by the `/balance` menu and apply on the next refresh.
- **Custom Sub2Api providers** are discovered from your pi model configuration (`~/.pi/agent/models.json`) and can be enabled/disabled individually from the main menu or `/balance sub2api`. Use `/balance sub2api rescan` after changing model configuration.
- **OpenAI Codex usage** is shown only while the active model provider is `openai-codex`. The extension first reuses pi's Codex subscription auth headers and can fall back to `codex app-server --listen stdio://` when available; the CLI fallback can be toggled in the `/balance` menu.
- The menu caches support states intelligently: expanding/collapsing providers is instant (no recomputation), while config changes trigger automatic refresh.
- Network requests time out quickly and failures are hidden from the status bar instead of interrupting your session.

## 🧠 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  pi Coding Agent                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  [Chat Interface]                                     │  │
│  │                                                       │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Status Bar:  DeepSeek: ¥49.87     ◉ Connected        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Extension: pi-balance ───────────────────────────────┐  │
│  │  session_start  ──►  fetchBalance()  ──►  setStatus() │  │
│  │  model_select   ──►  fetchBalance()  ──►  setStatus() │  │
│  │  agent_end     ────►  refreshBalance(showDelta)        │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Events Handled

- **`session_start`** — initial balance fetch when a session begins
- **`model_select`** — re-fetch when you switch models/providers
- **`agent_end`** — refresh balance after each conversation, showing delta (▲▼)
- **`session_shutdown`** — cleanup and clear status

## 🏗️ Project Structure

```
pi-balance/
├── src/
│   ├── index.ts                  # Entry point, commands, lifecycle
│   ├── types.ts                   # Type definitions and constants
│   ├── config.ts                  # Config load/persist/toggle
│   ├── utils.ts                   # Helpers (fetch, JSON, type guards)
│   ├── menu.ts                    # Dynamic menu builder with caching
│   └── providers/
│       ├── types.ts               # BalanceProvider interface
│       ├── registry.ts            # Singleton provider registry
│       ├── deepseek.ts            # DeepSeek provider
│       ├── moonshot.ts            # Moonshot/Kimi provider
│       ├── openrouter.ts          # OpenRouter provider
│       ├── nous.ts                # Nous Portal provider
│       ├── sub2api.ts             # Sub2Api + auto-discovery
│       └── codex.ts               # OpenAI Codex + CLI fallback
│   └── i18n/
│       ├── index.ts              # t() function + language detection
│       ├── zh-CN.ts              # Chinese translations
│       └── en.ts                 # English translations
├── tests/
│   └── index.test.ts
├── LICENSE                       # MIT license
├── README.md                     # English documentation
├── README.zh-CN.md               # Chinese documentation
├── package.json                  # Node.js and pi package manifest
├── tsconfig.build.json           # Build configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🛠️ For Developers

### Type-Checking

```bash
npm run typecheck
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Publish Checklist

This project publishes through GitHub Actions when a version tag is pushed.

Before publishing, verify the package contents:

```bash
npm pack --dry-run
```

Then create and push a tag that matches `package.json`:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

Before pushing the tag, configure npm Trusted Publishing for this package:

- Publisher: GitHub Actions
- Owner: `DragonYH`
- Repository: `pi-balance`
- Workflow: `release.yml`
- Environment: leave empty unless you add one to the workflow.

### Adding a New Provider

The extension uses a pluggable provider architecture. To add support for a new provider, create a module in `src/providers/` that implements the `BalanceProvider` interface, then import it in `src/index.ts` to trigger auto-registration:

```typescript
// src/providers/yourprovider.ts
import type { BalanceProvider } from "./types.js";
import { registry } from "./registry.js";
import type {
  BalanceResult,
  BalanceConfig,
  FetchContext,
  ProviderSupport,
} from "../types.js";
import { getJson } from "../utils.js";

export const yourProvider: BalanceProvider = {
  key: "yourprovider",
  definition: {
    key: "yourprovider",
    label: "YourProvider",
    color: "#FFD700",
  },

  shouldTry(model, baseUrl) {
    return baseUrl.includes("yourprovider.com");
  },

  async fetchBalance(
    ctx: FetchContext,
    signal?: AbortSignal,
  ): Promise<BalanceResult | undefined> {
    const data = await getJson(`${ctx.baseUrl}/your/endpoint`, ctx.headers, signal);
    const amount = data?.credits_remaining;
    return typeof amount === "number" ? { amount, unit: "$" } : undefined;
  },

  async getSupport(
    ctx: ExtensionContext,
    config: BalanceConfig,
  ): Promise<ProviderSupport> {
    return {
      provider: this.definition,
      configured: true,
      details: ["Configured"],
    };
  },
};

registry.register(yourProvider);
```

Then add one import in `src/index.ts`:

```typescript
import "./providers/yourprovider.js";
```

That's it — the provider auto-registers, appears in the `/balance` menu, and participates in balance fetching. No other code changes needed.

## 📄 License

[MIT](./LICENSE)

---

<p align="center">
  <sub>Built for the <a href="https://github.com/earendil-works/pi-coding-agent">pi coding agent</a> ecosystem</sub>
  <br>
  <a href="./README.zh-CN.md"><img src="https://img.shields.io/badge/🇨🇳_阅读中文版本-FFD700?style=for-the-badge"></a>
</p>
