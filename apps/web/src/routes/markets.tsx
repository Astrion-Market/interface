import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { MarketsPage } from "../features/lending/components/markets/markets-page"
import { parseMarketSearch } from "../features/lending/lib/route-params"

export const Route = createFileRoute("/markets")({
  validateSearch: parseMarketSearch,
  component: Page,
})

function Page() {
  const { type } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <AppLayout>
      <MarketsPage
        filter={type ?? "all"}
        onFilterChange={(filter) => {
          void navigate({
            search: { type: filter === "isolated" ? "isolated" : undefined },
          })
        }}
      />
    </AppLayout>
  )
}
