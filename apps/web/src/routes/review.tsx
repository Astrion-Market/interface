import { useSearchParams } from "react-router"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ErrorState } from "@workspace/ui/components/state-panel"
import { TransactionComposer } from "../features/crosschain/components/transaction-composer"
import { useCrosschainMarkets } from "../features/crosschain/use-crosschain-markets"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { RouteNotice } from "../features/lending/components/navigation/route-notice"
import type { ComposerAction } from "../features/crosschain/components/transaction-composer"

const ACTIONS: ReadonlyArray<ComposerAction> = ["lend", "borrow", "repay", "withdraw", "withdraw-collateral"]

export default function Page() {
  const [search] = useSearchParams()
  const key = search.get("market")?.toLowerCase()
  const action = ACTIONS.find((a) => a === search.get("action"))
  const { data, error, isLoading } = useCrosschainMarkets()
  const market = data?.markets.find((m) => m.key === key)

  return (
    <AppLayout>
      {isLoading ? (
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-80" />
        </div>
      ) : error || !data ? (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <ErrorState title="Couldn't load market data" />
        </div>
      ) : !market || !action ? (
        <RouteNotice title="Nothing to review">
          <p>Choose a market and an action first.</p>
        </RouteNotice>
      ) : (
        <TransactionComposer key={`${market.key}-${action}`} data={data} market={market} action={action} />
      )}
    </AppLayout>
  )
}
