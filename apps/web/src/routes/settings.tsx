import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { SettingsPage } from "../features/lending/components/settings/settings-page"

export const Route = createFileRoute("/settings")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  )
}
