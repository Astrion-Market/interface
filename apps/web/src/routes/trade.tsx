import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { ArchivedFeature } from "../features/lending/components/navigation/route-notice"

export const Route = createFileRoute("/trade")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <ArchivedFeature title="Trade" />
    </AppLayout>
  )
}
