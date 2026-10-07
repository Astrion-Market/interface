import { Link, createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { RouteNotice } from "../features/lending/components/navigation/route-notice"

export const Route = createFileRoute("/docs")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <RouteNotice title="Learn">
        <p>
          Astrion is developing access to lending markets on Base and Ethereum
          for Stellar users. Cross-chain transactions are not available in this
          preview.
        </p>
        <p>
          The planned initial experience uses both Stellar and EVM wallets.
          Collateral and debt stay on the lending chain when borrowed USDC
          returns to Stellar.
        </p>
        <p>
          Current market and position views use the existing Stellar
          integration. Repayment and withdrawal remain accessible through
          Stellar positions.
        </p>
        <p>
          <Link
            to="/activity"
            className="text-primary underline underline-offset-4"
          >
            Activity availability
          </Link>
          {" · "}
          <Link
            to="/brand"
            className="text-primary underline underline-offset-4"
          >
            Brand resources
          </Link>
        </p>
      </RouteNotice>
    </AppLayout>
  )
}
