import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { RouteNotice } from "../features/lending/components/navigation/route-notice"

export const Route = createFileRoute("/activity")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <RouteNotice title="Activity">
        <p>
          Cross-chain transaction tracking is not available yet. This page will
          show transfer progress and the actions needed to complete or recover a
          transaction.
        </p>
        <p>
          This is not a transaction history or confirmation that your wallet has
          no activity. Use your existing Stellar positions to manage current
          lending balances.
        </p>
      </RouteNotice>
    </AppLayout>
  )
}
