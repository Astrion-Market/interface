import { useSearchParams } from "react-router"
import { PositionsPage } from "../features/crosschain/components/portfolio-views"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { PortfolioPage } from "../features/lending/components/portfolio/portfolio-page"

// Cross-chain positions by default; existing Stellar positions with ?venue=stellar.
export default function Page() {
  const [search] = useSearchParams()
  return (
    <AppLayout>
      {search.get("venue") === "stellar" ? <PortfolioPage /> : <PositionsPage sample={search.get("sample") === "true"} />}
    </AppLayout>
  )
}
