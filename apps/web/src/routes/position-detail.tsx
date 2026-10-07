import { data } from "react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { RouteNotice } from "../features/lending/components/navigation/route-notice"
import { isSupportedDetailRoute } from "../features/lending/lib/route-params"
import type { Route } from "./+types/position-detail"

// Syntactic check only; an unknown but well-formed ID renders a notice.
export function loader({ params }: Route.LoaderArgs) {
  if (!isSupportedDetailRoute(params.chain, params.protocol, params.positionId, "position"))
    throw data(null, { status: 404 })
  return null
}

export function ErrorBoundary() {
  return (
    <AppLayout>
      <RouteNotice title="Position link not recognized">
        <p>Check the chain, protocol, and identifier in this link.</p>
      </RouteNotice>
    </AppLayout>
  )
}

export default function Page({ params }: Route.ComponentProps) {
  return (
    <AppLayout>
      <RouteNotice title="Position details are not available yet">
        <p>
          Cross-chain position data and actions are still in development. This
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
              {params.positionId}
            </dd>
          </div>
        </dl>
      </RouteNotice>
    </AppLayout>
  )
}
