import { AppLayout } from "../features/lending/components/layout/app-layout"
import { ArchivedFeature } from "../features/lending/components/navigation/route-notice"

export default function Page() {
  return (
    <AppLayout>
      <ArchivedFeature title="Analytics" />
    </AppLayout>
  )
}
