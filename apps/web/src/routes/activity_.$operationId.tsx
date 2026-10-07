import { createFileRoute } from "@tanstack/react-router"
import { OperationDetail } from "../features/crosschain/components/activity-views"
import { AppLayout } from "../features/lending/components/layout/app-layout"

export const Route = createFileRoute("/activity_/$operationId")({ component: Page })

function Page() {
  const { operationId } = Route.useParams()
  return (
    <AppLayout>
      <OperationDetail operationId={operationId} />
    </AppLayout>
  )
}
