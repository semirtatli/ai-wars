# ⚔️ AI Wars — AI vs AI Debate Arena

> Pick two AI models, give them a topic, and watch them debate in real-time.

[Live Demo](https://ai-wars.vercel.app) · [Report Bug](https://github.com/semirtatli/ai-wars/issues)

## Features

- **10+ AI Models** — Gemini 2.0 Flash, GPT-4o, Llama 3.3 70B, DeepSeek R1, Mixtral, and more
- **Real-time Streaming** — Watch AI responses appear word-by-word
- **User-Controlled Flow** — Continue, redirect, deepen, or intensify the debate after each round
- **Dynamic System Prompts** — Turn-aware prompting with anti-repetition and argument tracking
- **VS Battle Layout** — Side-by-side panels with glow animations for the active speaker
- **100% Free** — All models use free-tier APIs; zero cost for users or operators
- **Secure by Design** — API keys server-side only, rate limiting, Turnstile bot protection, XSS-safe markdown rendering

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components) |
| **AI SDK** | Vercel AI SDK v6 (`streamText`, multi-provider) |
| **Providers** | Google Gemini, Groq, GitHub Models, OpenRouter |
| **Language** | TypeScript (strict mode, `noUncheckedIndexedAccess`) |
| **Styling** | Tailwind CSS v4 |
| **Rate Limiting** | Upstash Redis (`@upstash/ratelimit`) |
| **Bot Protection** | Cloudflare Turnstile |
| **Security** | `rehype-sanitize` (XSS), Zod validation, CSP headers |
| **Deployment** | Vercel (serverless, edge middleware) |
| **Env Validation** | `@t3-oss/env-nextjs` (build-time) |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Setup Page   │→│ Battle Arena  │  │ Action Panel       │  │
│  │ Model Select │  │ VS Layout    │  │ Continue/Redirect  │  │
│  │ Topic Input  │  │ Streaming    │  │ Deepen/Intensify   │  │
│  └─────────────┘  └──────┬───────┘  └────────────────────┘  │
│                           │ fetch (streaming)                 │
└───────────────────────────┼──────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Server (Next.js API Routes)                │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────────┐ │
│  │ Turnstile │→│ Rate Limit  │→│ Model Whitelist + Stream  │ │
│  │ Verify    │  │ (Upstash)   │  │ (Vercel AI SDK)         │ │
│  └──────────┘  └────────────┘  └────────────┬─────────────┘ │
│                                              │                │
│  API Keys in process.env (NEVER client-side) │                │
└──────────────────────────────────────────────┼───────────────┘
                                               ▼
                               ┌──────────────────────────┐
                               │   Free AI Provider APIs   │
                               │   Google · Groq · GitHub  │
                               │   OpenRouter              │
                               └──────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Free API keys (see below)

### Installation

```bash
git clone https://github.com/semirtatli/ai-wars.git
cd ai-wars
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | How to Get | Cost |
|----------|-----------|------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) | Free |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) | Free |
| `GITHUB_TOKEN` | [GitHub Settings → Tokens](https://github.com/settings/tokens) | Free |
| `OPENROUTER_API_KEY` | [OpenRouter Keys](https://openrouter.ai/keys) | Free |
| `UPSTASH_REDIS_REST_URL` | [Upstash Console](https://console.upstash.com) | Free |
| `UPSTASH_REDIS_REST_TOKEN` | [Upstash Console](https://console.upstash.com) | Free |
| `TURNSTILE_SECRET_KEY` | [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile) | Free |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile) | Free |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm run format       # Prettier format
npm run type-check   # TypeScript strict check
npm run test         # Run tests (Vitest)
```

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts        # Streaming AI endpoint (security layers)
│   ├── battle/page.tsx           # Battle arena page
│   ├── page.tsx                  # Setup page (model selection + topic)
│   ├── layout.tsx                # Root layout (theme, header, footer)
│   ├── error.tsx                 # Error boundary
│   └── not-found.tsx             # 404 page
├── components/
│   ├── setup/                    # Setup page components
│   │   ├── model-selector.tsx    # Model dropdown with provider grouping
│   │   ├── topic-input.tsx       # Topic textarea + example topics
│   │   ├── round-config.tsx      # Turn count slider + response length
│   │   └── setup-form.tsx        # Main form orchestrator
│   ├── battle/                   # Battle page components
│   │   ├── battle-arena.tsx      # Main VS layout controller
│   │   ├── model-panel.tsx       # Single side message panel
│   │   ├── message-bubble.tsx    # XSS-safe markdown message
│   │   ├── action-panel.tsx      # User action buttons (6 options)
│   │   └── battle-header.tsx     # Model names + turn counter
│   └── shared/                   # Shared components
│       ├── header.tsx            # Site header + theme toggle
│       ├── footer.tsx            # Footer with credits
│       └── theme-provider.tsx    # next-themes wrapper
├── hooks/
│   ├── use-battle.ts             # Battle state machine (core logic)
│   └── use-battle-stream.ts      # Low-level streaming hook
├── lib/
│   ├── ai/
│   │   ├── providers.ts          # AI SDK provider configs + model whitelist
│   │   ├── models.ts             # Model metadata registry
│   │   └── prompts.ts            # Dynamic system prompt builder
│   ├── security/
│   │   ├── rate-limiter.ts       # Upstash Redis rate limiting
│   │   └── turnstile.ts          # Cloudflare Turnstile verification
│   ├── validators/
│   │   └── chat.ts               # Zod request schemas
│   └── utils.ts                  # Utility functions (cn, generateId, etc.)
├── types/
│   ├── battle.ts                 # Battle domain types
│   └── models.ts                 # Model/provider types
├── env.ts                        # t3-env build-time validation
└── middleware.ts                  # Global rate limiting middleware
```

## Key Design Decisions

### Why Free-Tier Only?
- **Zero financial risk** — even if API keys leak, maximum damage is $0
- **Zero friction for users** — no sign-up, no API key input, just pick models and go
- **Still high quality** — Gemini 2.0 Flash and GPT-4o are top-tier models available free

### Why Server-Side Proxy?
- API keys never reach the client browser (not in JS bundle, not in network requests)
- Rate limiting protects free-tier quotas from abuse
- Single security boundary to audit

### Why Dynamic System Prompts?
- Turn-aware instructions prevent repetitive arguments
- Action modifiers (new angle, deepen, intensify) give users meaningful control
- Anti-repetition tracking extracts key arguments and explicitly asks models to avoid them

### Why No Database?
- Debates are ephemeral — no PII stored, no data to steal, minimal attack surface
- State lives in React state (client) and URL params (shareable config)
- Rate limiting uses Upstash Redis (stateless serverless-compatible)

## Security

| Layer | Protection |
|-------|-----------|
| **API Keys** | Server-only env vars, no `NEXT_PUBLIC_` prefix |
| **Bot Protection** | Cloudflare Turnstile (server-side verified) |
| **Rate Limiting** | Upstash Redis — per-IP middleware + per-route limits |
| **Input Validation** | Zod schemas on all API inputs |
| **SSRF Prevention** | Hardcoded model whitelist, no user-supplied URLs |
| **XSS Prevention** | `react-markdown` + `rehype-sanitize` (no `dangerouslySetInnerHTML`) |
| **Security Headers** | CSP, X-Content-Type-Options, X-Frame-Options |

## License

MIT
