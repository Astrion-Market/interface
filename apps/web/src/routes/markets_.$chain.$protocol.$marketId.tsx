import { createFileRoute, notFound } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { RouteNotice } from "../features/lending/components/navigation/route-notice"
import { isSupportedDetailRoute } from "../features/lending/lib/route-params"

export const Route = createFileRoute("/markets_/$chain/$protocol/$marketId")({
  beforeLoad: ({ params }) => {
    if (
      !isSupportedDetailRoute(
        params.chain,
        params.protocol,
        params.marketId,
        "market"
      )
    )
      throw notFound()
  },
  component: Page,
  notFoundComponent: () => (
    <AppLayout>
      <RouteNotice title="Market link not recognized">
        <p>Check the chain, protocol, and identifier in this link.</p>
      </RouteNotice>
    </AppLayout>
  ),
})

function Page() {
  const params = Route.useParams()
  return (
    <AppLayout>
      <RouteNotice title="Market details are not available yet">
        <p>
          Cross-chain market data and actions are still in development. This
          link does not confirm a supported market, a balance, or ownership of a
          position.
        </p>
        <dl className="grid gap-3 rounded-lg border border-border p-4">
          <div>
            <dt>Chain</dt>
            <dd className="font-medium text-foreground">{params.chain}</dd>
          </div>
          <div>
            <dt>Protocol</dt>
            <dd className="font-medium text-foreground">{params.protocol}</dd>
          </div>
          <div>
            <dt>Requested identifier</dt>
            <dd className="font-mono text-xs break-all text-foreground">
              {params.marketId}
            </dd>
          </div>
        </dl>
      </RouteNotice>
    </AppLayout>
  )
}
