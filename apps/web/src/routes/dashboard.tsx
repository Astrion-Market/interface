import { useSearchParams } from "react-router"
import { OverviewPage } from "../features/crosschain/components/portfolio-views"
import { DashboardPage } from "../features/lending/components/dashboard/dashboard-page"
import { AppLayout } from "../features/lending/components/layout/app-layout"

// Cross-chain overview by default; the existing Stellar dashboard with ?venue=stellar.
export default function Page() {
  const [search] = useSearchParams()
  return (
    <AppLayout>
      {search.get("venue") === "stellar" ? <DashboardPage /> : <OverviewPage sample={search.get("sample") === "true"} />}
    </AppLayout>
  )
}
