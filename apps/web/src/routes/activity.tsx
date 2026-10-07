import { ActivityList } from "../features/crosschain/components/activity-views"
import { AppLayout } from "../features/lending/components/layout/app-layout"

export default function Page() {
  return (
    <AppLayout>
      <ActivityList />
    </AppLayout>
  )
}
