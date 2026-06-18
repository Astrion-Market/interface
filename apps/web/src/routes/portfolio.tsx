import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { PortfolioPage } from "../features/lending/components/portfolio/portfolio-page"

export const Route = createFileRoute("/portfolio")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <PortfolioPage />
    </AppLayout>
  )
}
