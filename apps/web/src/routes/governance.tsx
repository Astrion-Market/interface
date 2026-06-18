import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { GovernancePage } from "../features/lending/components/governance/governance-page"

export const Route = createFileRoute("/governance")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <GovernancePage />
    </AppLayout>
  )
}
