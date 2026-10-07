import { createFileRoute, redirect } from "@tanstack/react-router"
import { FaucetPage } from "../features/faucet/components/faucet-page"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { IS_STELLAR_TESTNET } from "../features/lending/lib/network"

export const Route = createFileRoute("/faucet")({
  beforeLoad: () => {
    if (!IS_STELLAR_TESTNET) throw redirect({ to: "/legacy", replace: true })
  },
  component: Page,
})

function Page() {
  return (
    <AppLayout>
      <FaucetPage />
    </AppLayout>
  )
}
