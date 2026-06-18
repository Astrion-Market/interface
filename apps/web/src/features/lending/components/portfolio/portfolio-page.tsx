import { ConnectWalletButton } from "../../../wallet/connect-wallet-button"
import { useWallet } from "../../../wallet/wallet-provider"
import { useLendingPortfolio } from "../../hooks/queries/use-lending-portfolio"
import { PortfolioSummary } from "./portfolio-summary"
import { SupplyPositionsTable } from "./supply-positions-table"
import { BorrowPositionsTable } from "./borrow-positions-table"

export function PortfolioPage() {
  const { address } = useWallet()
  const { data, error, isFetching } = useLendingPortfolio(address)
  const positions = data?.positions ?? []
  const supplyPositions = positions.filter((p) => parseFloat(p.supplied) > 0)
  const borrowPositions = positions.filter((p) => parseFloat(p.borrowed) > 0)

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Manage your supply and borrow positions
          </p>
        </div>
        <ConnectWalletButton />
      </div>

      <div className="mb-6">
        <PortfolioSummary
          summary={data?.summary}
          isLoading={isFetching}
          isConnected={Boolean(address)}
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          Portfolio data is unavailable right now. Please try again in a moment.
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <SupplyPositionsTable positions={supplyPositions} />
        </div>
        <div className="overflow-x-auto">
          <BorrowPositionsTable positions={borrowPositions} />
        </div>
      </div>
    </div>
  )
}
