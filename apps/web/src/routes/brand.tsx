import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { BrandPage } from "../features/brand/components/brand-page"

export const Route = createFileRoute("/brand")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <BrandPage />
    </AppLayout>
  )
}
