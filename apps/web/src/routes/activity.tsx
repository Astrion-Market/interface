import { createFileRoute } from "@tanstack/react-router"
import { ActivityList } from "../features/crosschain/components/activity-views"
import { AppLayout } from "../features/lending/components/layout/app-layout"

export const Route = createFileRoute("/activity")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <ActivityList />
    </AppLayout>
  )
}
