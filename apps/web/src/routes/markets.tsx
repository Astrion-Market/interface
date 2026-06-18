import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { MarketsPage } from "../features/lending/components/markets/markets-page"

export const Route = createFileRoute("/markets")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <MarketsPage />
    </AppLayout>
  )
}
