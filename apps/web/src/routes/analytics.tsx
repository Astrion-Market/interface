import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { AnalyticsPage } from "../features/lending/components/analytics/analytics-page"

export const Route = createFileRoute("/analytics")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <AnalyticsPage />
    </AppLayout>
  )
}
