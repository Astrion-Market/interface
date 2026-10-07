import { createFileRoute } from "@tanstack/react-router"
import { PositionsPage } from "../features/crosschain/components/portfolio-views"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { PortfolioPage } from "../features/lending/components/portfolio/portfolio-page"

type VenueSearch = { venue?: "stellar"; sample?: boolean }

const validateSearch = (search: Record<string, unknown>): VenueSearch => ({
  venue: search.venue === "stellar" ? "stellar" : undefined,
  sample: search.sample === true || search.sample === "true" ? true : undefined,
})

// Cross-chain positions by default; existing Stellar positions with ?venue=stellar.
export const Route = createFileRoute("/portfolio")({ validateSearch, component: Page })

function Page() {
  const { venue, sample } = Route.useSearch()
  return <AppLayout>{venue === "stellar" ? <PortfolioPage /> : <PositionsPage sample={!!sample} />}</AppLayout>
}
