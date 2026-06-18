# Astrion — Implementation Plan

Hybrid lending protocol UI on Stellar / Soroban.
Stack: Vite + TanStack Router + React 19 + TailwindCSS v4 + Sonner + @workspace/ui

---

## Pages

| Route | Component | Status |
|---|---|---|
| `/dashboard` | `DashboardPage` | [ ] |
| `/markets` | `MarketsPage` | [ ] |
| `/portfolio` | `PortfolioPage` | [ ] |
| `/isolated-markets` | `IsolatedMarketsPage` | [ ] |
| `/analytics` | `AnalyticsPage` | [ ] |
| `/governance` | `GovernancePage` | [ ] |

---

## Layout Components

| Component | Path | Description | Status |
|---|---|---|---|
| `AppSidebar` | `features/lending/components/layout/app-sidebar.tsx` | Full sidebar nav with sections, wallet, network | [ ] |
| `AppLayout` | `features/lending/components/layout/app-layout.tsx` | Sidebar + main content wrapper | [ ] |

---

## Shared / Common Components

| Component | Path | Description | Status |
|---|---|---|---|
| `MetricCard` | `features/lending/components/shared/metric-card.tsx` | KPI stat card (Net Worth, TVL, etc.) | [ ] |
| `HealthFactorGauge` | `features/lending/components/shared/health-factor-gauge.tsx` | Radial + color-coded health gauge | [ ] |
| `AssetIcon` | `features/lending/components/shared/asset-icon.tsx` | Token icon w/ chain badge | [ ] |
| `MarketBadge` | `features/lending/components/shared/market-badge.tsx` | "Core Market" / "Isolated Risk" badge | [ ] |
| `SectionHeader` | `features/lending/components/shared/section-header.tsx` | Page section title + subtitle | [ ] |
| `EmptyState` | `features/lending/components/shared/empty-state.tsx` | Empty table/list placeholder | [ ] |

---

## Dashboard Components (`/dashboard`)

| Component | Path | Description | Status |
|---|---|---|---|
| `DashboardPage` | `features/lending/components/dashboard/dashboard-page.tsx` | Full dashboard layout | [ ] |
| `PortfolioSummaryBar` | `features/lending/components/dashboard/portfolio-summary-bar.tsx` | Net Worth, Supplied, Borrowed, Health row | [ ] |
| `ActivePositionsTable` | `features/lending/components/dashboard/active-positions-table.tsx` | Table: Asset / Supplied / Borrowed / APY / Health / Actions | [ ] |
| `MarketInsightsSidebar` | `features/lending/components/dashboard/market-insights-sidebar.tsx` | Right panel: trending rates, TVL, utilization | [ ] |

---

## Markets Components (`/markets`)

| Component | Path | Description | Status |
|---|---|---|---|
| `MarketsPage` | `features/lending/components/markets/markets-page.tsx` | Full markets listing page | [ ] |
| `MarketCard` | `features/lending/components/markets/market-card.tsx` | Card: APY, utilization, LTV, actions | [ ] |
| `SharedMarketCard` | `features/lending/components/markets/shared-market-card.tsx` | Core Market card variant (blue accent) | [ ] |
| `IsolatedMarketCard` | `features/lending/components/markets/isolated-market-card.tsx` | Isolated Risk card variant (amber accent) | [ ] |
| `MarketFilters` | `features/lending/components/markets/market-filters.tsx` | Search, type filter (All / Core / Isolated) | [ ] |

---

## Portfolio Components (`/portfolio`)

| Component | Path | Description | Status |
|---|---|---|---|
| `PortfolioPage` | `features/lending/components/portfolio/portfolio-page.tsx` | Portfolio overview layout | [ ] |
| `PortfolioSummary` | `features/lending/components/portfolio/portfolio-summary.tsx` | Summary: Net Worth, Net APY, Health | [ ] |
| `SupplyPositionsTable` | `features/lending/components/portfolio/supply-positions-table.tsx` | Supplied assets table | [ ] |
| `BorrowPositionsTable` | `features/lending/components/portfolio/borrow-positions-table.tsx` | Borrowed assets table | [ ] |

---

## Isolated Markets Components (`/isolated-markets`)

| Component | Path | Description | Status |
|---|---|---|---|
| `IsolatedMarketsPage` | `features/lending/components/isolated-markets/isolated-markets-page.tsx` | Isolated markets list | [ ] |
| `RiskWarningBanner` | `features/lending/components/isolated-markets/risk-warning-banner.tsx` | Amber banner with isolation risk explanation | [ ] |
| `IsolatedMarketRow` | `features/lending/components/isolated-markets/isolated-market-row.tsx` | Table row for isolated market | [ ] |

---

## Analytics Components (`/analytics`)

| Component | Path | Description | Status |
|---|---|---|---|
| `AnalyticsPage` | `features/lending/components/analytics/analytics-page.tsx` | Analytics layout with charts grid | [ ] |
| `UtilizationChart` | `features/lending/components/analytics/utilization-chart.tsx` | Bar chart: market utilization | [ ] |
| `ApyHistoryChart` | `features/lending/components/analytics/apy-history-chart.tsx` | Line chart: supply/borrow APY over time | [ ] |
| `TvlChart` | `features/lending/components/analytics/tvl-chart.tsx` | Area chart: TVL growth | [ ] |
| `ProtocolStatsBar` | `features/lending/components/analytics/protocol-stats-bar.tsx` | Total TVL, total borrowed, total revenue | [ ] |

---

## Governance Components (`/governance`)

| Component | Path | Description | Status |
|---|---|---|---|
| `GovernancePage` | `features/lending/components/governance/governance-page.tsx` | Governance layout | [ ] |
| `ProposalCard` | `features/lending/components/governance/proposal-card.tsx` | Proposal: title, status, votes, deadline | [ ] |
| `ProposalStats` | `features/lending/components/governance/proposal-stats.tsx` | Vote distribution bar | [ ] |

---

## Data Layer

| File | Path | Description | Status |
|---|---|---|---|
| `lending.ts` (types) | `features/lending/types/lending.ts` | All TS types: Market, Position, Proposal | [ ] |
| `mock-markets.ts` | `features/lending/data/mock-markets.ts` | Static mock market data | [ ] |
| `mock-positions.ts` | `features/lending/data/mock-positions.ts` | Static mock position data | [ ] |
| `mock-governance.ts` | `features/lending/data/mock-governance.ts` | Static mock proposal data | [ ] |

---

## Routes

| File | Path | Status |
|---|---|---|
| `dashboard.tsx` | `apps/web/src/routes/dashboard.tsx` | [ ] |
| `markets.tsx` | `apps/web/src/routes/markets.tsx` | [ ] |
| `portfolio.tsx` | `apps/web/src/routes/portfolio.tsx` | [ ] |
| `isolated-markets.tsx` | `apps/web/src/routes/isolated-markets.tsx` | [ ] |
| `analytics.tsx` | `apps/web/src/routes/analytics.tsx` | [ ] |
| `governance.tsx` | `apps/web/src/routes/governance.tsx` | [ ] |
