import { StatusBadge } from "@workspace/ui/components/status-badge"
import { ChainBadge, ProtocolBadge } from "../../lending/components/primitives/identity-badge"
import { EXECUTION_CHAIN_IDS, PROTOCOL_IDS } from "../../lending/lib/identity"
import { findRoute } from "../fixture-client"
import type { RouteAvailability } from "../model"

// Availability for all six chain/protocol routes, with the reason for each
// disabled one written out.
export function RouteMatrix({ routes }: { routes: Array<RouteAvailability> }) {
  return (
    <section aria-labelledby="route-matrix-title" className="rounded-xl border border-border bg-card">
      <h2 id="route-matrix-title" className="text-heading-card border-b border-border px-4 py-3">
        Route availability
      </h2>
      <ul className="divide-y divide-border">
        {EXECUTION_CHAIN_IDS.flatMap((chain) =>
          PROTOCOL_IDS.map((protocol) => {
            const route = findRoute(routes, chain, protocol)
            return (
              <li
                key={`${chain}-${protocol}`}
                className="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_7rem_1fr] sm:items-center"
              >
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <ProtocolBadge protocol={protocol} size="sm" />
                  <ChainBadge chain={chain} size="sm" />
                </span>
                {route?.enabled ? (
                  <StatusBadge tone="success">Available</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Not available</StatusBadge>
                )}
                <span className="text-copy-sm text-muted-foreground">
                  {route ? (route.reason ?? "Open for supported actions.") : "No route configured."}
                </span>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
