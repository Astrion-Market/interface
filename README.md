<p align="center">
  <img src="./project-asset/logo.svg" alt="Astrion" width="240" />
</p>

<h3 align="center">The credit layer for Stellar.</h3>

<p align="center">
  Non-custodial hybrid lending · Core &amp; Isolated markets · Built on Soroban
</p>

<p align="center">
  <a href="https://astrion.market"><strong>astrion.market</strong></a> ·
  <a href="#getting-started">Get started</a> ·
  <a href="CONTRIBUTING.md">Contribute</a> ·
  <a href="https://twitter.com/astrionmarket">Twitter</a>
</p>

---

## The Problem

DeFi lending on Stellar doesn't exist at institutional quality. Existing protocols across ecosystems force users to choose between capital efficiency and safety — pool everything together (high risk) or silo everything apart (low efficiency). There is no middle ground.

## The Solution

**Astrion** introduces a **dual-market architecture** — the first of its kind on Stellar:

| | Core Markets | Isolated Markets |
|---|---|---|
| **Liquidity** | Shared cross-collateral pool | Independent per-asset pools |
| **Assets** | USDC, XLM, BTC, ETH, EURC | Long-tail, volatile, RWAs |
| **Risk** | Diversified, lower | Ring-fenced, contained |
| **Efficiency** | Maximum capital utilization | Safety over efficiency |

> **Capital efficiency where safe. Isolation where necessary.**

---

## Screenshots

| Landing | Dashboard |
|---|---|
| ![Landing page](./screenshots/landing.png) | ![Dashboard](./screenshots/dashboard.png) |

| Markets | Analytics |
|---|---|
| ![Markets](./screenshots/markets.png) | ![Analytics](./screenshots/analytics.png) |

---

## Why Astrion

### 🏛️ Institutional-grade UX
Designed to feel like Bloomberg Terminal meets Stripe Dashboard — not another casino-like DeFi interface. Clean typography, information hierarchy, and financial-grade data presentation.

### 🔒 Risk isolation by design
Isolated markets contain risk to individual pools. A failure in one experimental market **never** propagates to core liquidity — protecting the entire protocol.

### ⚡ Built on Soroban
Stellar's smart contract platform brings sub-second finality, near-zero fees, and a growing institutional ecosystem. Astrion is the foundational credit layer for this ecosystem.

### 📊 Full transparency
Health factor visualization, liquidation price tracking, oracle source display, real-time utilization — users always understand their risk exposure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     ASTRION PROTOCOL                    │
│                                                         │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │    Core Markets      │  │    Isolated Markets       │  │
│  │                     │  │                          │  │
│  │  ┌─────┐ ┌─────┐   │  │  ┌──────┐  ┌──────┐     │  │
│  │  │USDC │ │ XLM │   │  │  │Token │  │Token │     │  │
│  │  └──┬──┘ └──┬──┘   │  │  │  A   │  │  B   │     │  │
│  │     │       │       │  │  └──────┘  └──────┘     │  │
│  │  ┌──┴───────┴──┐   │  │  Independent pools       │  │
│  │  │ Shared Pool  │   │  │  Ring-fenced risk        │  │
│  │  └─────────────┘   │  │  Separate liquidation     │  │
│  └─────────────────────┘  └──────────────────────────┘  │
│                                                         │
│  ┌───────────┐ ┌──────────┐ ┌──────────────────────┐   │
│  │LendingPool│ │PriceOracle│ │LiquidationManager   │   │
│  └───────────┘ └──────────┘ └──────────────────────┘   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              GovernanceRouter                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | [Turborepo](https://turbo.build) + [Bun](https://bun.sh) workspaces |
| Framework | [React 19](https://react.dev) + [Vite 7](https://vitejs.dev) |
| Routing | [TanStack Router v1](https://tanstack.com/router) |
| Server state | [TanStack Query v5](https://tanstack.com/query) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI components | [shadcn/ui](https://ui.shadcn.com) (via `packages/ui` workspace) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Blockchain | [Stellar](https://stellar.org) / [Soroban](https://soroban.stellar.org) |
| Type safety | TypeScript 5.9 |

---

## Project Structure

```
astrion/
├── apps/
│   └── web/                        # Main React/Vite application
│       ├── public/                 # Static assets — favicon, manifest, PWA icons
│       └── src/
│           ├── features/
│           │   ├── lending/        # Core lending UI — dashboard, markets, governance
│           │   │   ├── components/ # Page + sub-components
│           │   │   ├── data/       # Mock data layer (contract integration pending)
│           │   │   └── types/      # Shared TypeScript types
│           │   ├── earn/           # Earn page — staking, vesting, LP
│           │   ├── referrals/      # Referral program
│           │   └── trade/          # Trading — chart, order panel, positions
│           ├── routes/             # TanStack Router file-based routes
│           ├── styles/             # Global CSS + design tokens
│           └── ui/                 # Shared UI — Navbar, ThemeProvider, landing
│
├── packages/
│   └── ui/                         # Shared component library (shadcn/ui)
│
├── project-asset/                  # Brand assets, design spec, logo SVGs
├── turbo.json
├── package.json
└── bun.lock
```

---

## Features

| Area | Details |
|---|---|
| **Dashboard** | Portfolio overview, active positions, protocol stats, health factor gauge |
| **Core Markets** | Shared-liquidity markets with cross-collateral support |
| **Isolated Markets** | Independent risk/liquidity pools for higher-risk assets |
| **Portfolio** | Net worth, net APY, total collateral & debt, health factor visualization |
| **Analytics** | TVL, borrow volume, APY history, utilization breakdowns, liquidation activity |
| **Earn** | Token staking, escrowed token vesting, LP rewards, multiplier points |
| **Trade** | Chart interface, order panel, position management |
| **Governance** | On-chain proposals, voting, quorum tracking |
| **Theme** | Full dark / light mode with zero flash on load |
| **Responsive** | Mobile-first — collapsible drawer sidebar on mobile, full sidebar on desktop |

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| [Bun](https://bun.sh) | ≥ 1.3 |
| [Node.js](https://nodejs.org) | ≥ 20 |

### Quick start

```bash
# Clone
git clone https://github.com/Astrion-Market/interface.git
cd interface

# Install
bun install

# Dev server → http://localhost:3000
bun dev
```

### Production build

```bash
bun build
```

### All commands

| Command | Description |
|---|---|
| `bun dev` | Start all packages in development mode |
| `bun build` | Build all packages for production |
| `bun lint` | Lint all packages with ESLint |
| `bun format` | Format all files with Prettier |
| `bun typecheck` | Run TypeScript type checks across all packages |

---

## How It Works

### Health Factor

A per-position risk metric: `weighted collateral value ÷ total borrow value`

| Range | Status | Color |
|---|---|---|
| ≥ 1.5 | Safe | 🟢 Green |
| 1.2 — 1.5 | Moderate risk | 🟡 Amber |
| 1.0 — 1.2 | High risk | 🔴 Red |
| < 1.0 | Liquidatable | ⛔ Critical |

### Interest Rate Model

Utilization-based with a kinked curve — rates rise gently under optimal utilization, then aggressively above it. This prevents liquidity exhaustion while keeping borrowing costs low during normal conditions.

### Contract Surface

The contract integration targets four Soroban contracts:

| Contract | Responsibility |
|---|---|
| `LendingPool` | Supply, withdraw, borrow, repay |
| `PriceOracle` | Asset price feeds |
| `LiquidationManager` | Health monitoring + liquidations |
| `GovernanceRouter` | Proposal creation + voting |

> **Status:** The current build uses a mock data layer. Contract integration is in progress.

---

## Roadmap

- [x] Core UI — dashboard, markets, portfolio, analytics, governance
- [x] Dual-market architecture — core + isolated market views
- [x] Dark/light theme with zero-flash loading
- [x] Mobile-responsive layout
- [x] Earn page — staking, vesting, distributions
- [x] Trade page — chart, order panel
- [ ] Soroban contract integration
- [ ] Wallet connection (Freighter, WalletConnect)
- [ ] Oracle integration (DIA / Reflector)
- [ ] Liquidation bot infrastructure
- [ ] Mainnet launch

---

## Contributing

We welcome contributions. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide — setup, branch naming, commit style, and PR process.

Quick version:

```bash
git clone https://github.com/Astrion-Market/interface.git
cd interface && bun install
git checkout -b feat/your-feature
# make changes, then:
bun lint && bun typecheck
git commit -m "feat: your feature description"
```

---

## License

```
MIT License — Copyright (c) 2026 Astrion Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built by <a href="https://astrion.market">Astrion Labs</a> · Stellar Mainnet
</p>
