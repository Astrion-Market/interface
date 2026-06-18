import { createFileRoute } from "@tanstack/react-router"
import { FaucetPage } from "../features/faucet/components/faucet-page"
import { AppLayout } from "../features/lending/components/layout/app-layout"

export const Route = createFileRoute("/faucet")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <FaucetPage />
    </AppLayout>
  )
}
