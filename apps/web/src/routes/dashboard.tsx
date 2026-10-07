import { createFileRoute } from "@tanstack/react-router"
import { OverviewPage } from "../features/crosschain/components/portfolio-views"
import { DashboardPage } from "../features/lending/components/dashboard/dashboard-page"
import { AppLayout } from "../features/lending/components/layout/app-layout"

type VenueSearch = { venue?: "stellar"; sample?: boolean }

const validateSearch = (search: Record<string, unknown>): VenueSearch => ({
  venue: search.venue === "stellar" ? "stellar" : undefined,
  sample: search.sample === true || search.sample === "true" ? true : undefined,
})

// Cross-chain overview by default; the existing Stellar dashboard with ?venue=stellar.
export const Route = createFileRoute("/dashboard")({ validateSearch, component: Page })

function Page() {
  const { venue, sample } = Route.useSearch()
  return <AppLayout>{venue === "stellar" ? <DashboardPage /> : <OverviewPage sample={!!sample} />}</AppLayout>
}
