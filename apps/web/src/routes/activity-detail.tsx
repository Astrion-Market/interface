import { OperationDetail } from "../features/crosschain/components/activity-views"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import type { Route } from "./+types/activity-detail"

export default function Page({ params }: Route.ComponentProps) {
  const { operationId } = params
  return (
    <AppLayout>
      <OperationDetail operationId={operationId} />
    </AppLayout>
  )
}
