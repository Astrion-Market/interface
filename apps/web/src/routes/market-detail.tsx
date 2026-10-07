import { data } from "react-router"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ErrorState } from "@workspace/ui/components/state-panel"
import { MarketDetail } from "../features/crosschain/components/market-detail"
import { findRoute } from "../features/crosschain/fixture-client"
import { marketKeyFromPath } from "../features/crosschain/model"
import { useCrosschainMarkets } from "../features/crosschain/use-crosschain-markets"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { RouteNotice } from "../features/lending/components/navigation/route-notice"
import { isSupportedDetailRoute } from "../features/lending/lib/route-params"
import type { Route } from "./+types/market-detail"

// Syntactic check only; an unknown but well-formed ID renders a notice.
export function loader({ params }: Route.LoaderArgs) {
  if (!isSupportedDetailRoute(params.chain, params.protocol, params.marketId, "market"))
    throw data(null, { status: 404 })
  return null
}


export function ErrorBoundary() {
  return (
    <AppLayout>
      <RouteNotice title="Market link not recognized">
        <p>Check the chain, protocol, and identifier in this link.</p>
      </RouteNotice>
    </AppLayout>
  )
}

export default function Page({ params }: Route.ComponentProps) {
  const { data, error, isLoading } = useCrosschainMarkets()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64" />
        </div>
      </AppLayout>
    )
  }
  if (error || !data) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <ErrorState title="Couldn't load market data" description="This is not the same as the market not existing." />
        </div>
      </AppLayout>
    )
  }

  const key = marketKeyFromPath(params.chain, params.protocol, params.marketId)
  const market = data.markets.find((m) => m.key === key)
  if (!market) {
    return (
      <AppLayout>
        <RouteNotice title="This market is not listed">
          <p>
            The link is well formed, but the market is not in Astrion&apos;s market list for this chain and
            protocol. It may be unsupported or not yet approved.
          </p>
        </RouteNotice>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <MarketDetail market={market} route={findRoute(data.routes, market.ref.chain, market.protocol)} />
    </AppLayout>
  )
}
