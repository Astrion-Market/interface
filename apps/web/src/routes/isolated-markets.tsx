import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { IsolatedMarketsPage } from "../features/lending/components/isolated-markets/isolated-markets-page"

export const Route = createFileRoute("/isolated-markets")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <IsolatedMarketsPage />
    </AppLayout>
  )
}
