import { index, route } from "@react-router/dev/routes"
import type { RouteConfig } from "@react-router/dev/routes"

// Explicit route table. Paths match the URLs the app used before moving to
// React Router, so existing links and bookmarks keep working.
export default [
  index("routes/index.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("markets", "routes/markets.tsx"),
  route("markets/:chain/:protocol/:marketId", "routes/market-detail.tsx"),
  route("review", "routes/review.tsx"),
  route("activity", "routes/activity.tsx"),
  route("activity/:operationId", "routes/activity-detail.tsx"),
  route("portfolio", "routes/portfolio.tsx"),
  route("portfolio/:chain/:protocol/:positionId", "routes/position-detail.tsx"),
  route("legacy", "routes/legacy.tsx"),
  route("settings", "routes/settings.tsx"),
  route("docs", "routes/docs.tsx"),
  route("design-system", "routes/design-system.tsx"),
  route("brand", "routes/brand.tsx"),
  route("faucet", "routes/faucet.tsx"),
  route("api/faucet", "routes/api.faucet.ts"),
  route("isolated-markets", "routes/isolated-markets.tsx"),
  route("earn", "routes/earn.tsx"),
  route("trade", "routes/trade.tsx"),
  route("referrals", "routes/referrals.tsx"),
  route("governance", "routes/governance.tsx"),
  route("analytics", "routes/analytics.tsx"),
  route("pitch-deck", "routes/pitch-deck.tsx"),
  route("video-demo", "routes/video-demo.tsx"),
  route("vide-demo", "routes/vide-demo.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig
