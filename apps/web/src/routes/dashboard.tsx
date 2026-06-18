import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { DashboardPage } from "../features/lending/components/dashboard/dashboard-page"

export const Route = createFileRoute("/dashboard")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  )
}
