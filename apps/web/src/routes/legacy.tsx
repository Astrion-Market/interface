import { Link, createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { STELLAR_NETWORK_LABEL } from "../features/lending/lib/network"

export const Route = createFileRoute("/legacy")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs text-muted-foreground">
          Existing integration · {STELLAR_NETWORK_LABEL}
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Stellar positions</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Your existing Stellar lending positions remain accessible as Astrion
          develops cross-chain lending. Connect the Stellar wallet that owns the
          position to repay debt or withdraw available funds.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          These views use the configured Soroban contracts. They do not
          represent Aave, Morpho, or Compound positions on Base or Ethereum.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/portfolio"
            className="rounded-lg border border-border bg-card p-5 hover:border-primary"
          >
            <h2 className="font-medium">Manage positions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Review supplied assets, posted collateral, and debt. Repay or
              withdraw from your existing position.
            </p>
          </Link>
          <Link
            to="/markets"
            search={{ type: "isolated" }}
            className="rounded-lg border border-border bg-card p-5 hover:border-primary"
          >
            <h2 className="font-medium">Stellar isolated markets</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the existing market controls with the isolated-market filter
              selected.
            </p>
          </Link>
        </div>
      </section>
    </AppLayout>
  )
}
