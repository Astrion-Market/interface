import { AppLayout } from "../features/lending/components/layout/app-layout"
import { SettingsPage } from "../features/lending/components/settings/settings-page"

export default function Page() {
  return (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  )
}
