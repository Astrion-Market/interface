import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { ROUTE_EVM_NETWORKS, ROUTE_STELLAR_NETWORK } from "../crosschain/env"
import { AddressText } from "../lending/components/primitives/address-text"
import { EvmConnectButton } from "./evm/evm-connect-button"
import { useEvmWallet } from "./evm/evm-wallet-provider"
import { ConnectWalletButton } from "./connect-wallet-button"
import { useWallet } from "./wallet-provider"

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:items-center">
      <dt className="text-copy-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

// Both wallet identities side by side. Showing them together is a convenience;
// it never lets one wallet act for the other.
export function WalletSessions() {
  const stellar = useWallet()
  const evm = useEvmWallet()
  const evmNames = Object.values(ROUTE_EVM_NETWORKS)
    .map((n) => n.name)
    .join(" or ")

  return (
    <section aria-labelledby="wallets-title" className="space-y-4">
      <div>
        <h2 id="wallets-title" className="text-heading-card">
          Wallets
        </h2>
        <p className="text-copy-sm mt-1 max-w-prose text-muted-foreground">
          Cross-chain lending uses two wallets. Each one signs only on its own chain; connecting both does not let
          either sign for the other.
        </p>
      </div>

      {(evm.session.notice || evm.session.error) && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-attention/30 bg-attention-surface px-3 py-2">
          <p className="text-copy-sm text-foreground">{evm.session.error ?? evm.session.notice}</p>
          <Button size="sm" variant="ghost" onClick={evm.dismiss}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-label">Stellar wallet</h3>
            <StatusBadge tone={stellar.address ? "success" : "neutral"}>
              {stellar.address ? "Connected" : "Not connected"}
            </StatusBadge>
          </div>
          <dl className="mt-2 divide-y divide-border">
            <Row label="Account">
              {stellar.address ? <AddressText value={stellar.address} label="Stellar account" /> : <span className="text-copy-sm">-</span>}
            </Row>
            <Row label="Network">
              <span className="text-copy-sm">{ROUTE_STELLAR_NETWORK.label}</span>
            </Row>
            <Row label="Signs">
              <span className="text-copy-sm">Transfers that start on Stellar: lending from Stellar and repaying from Stellar.</span>
            </Row>
          </dl>
          <div className="mt-3 max-w-xs">
            <ConnectWalletButton placement="sidebar" />
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-label">EVM wallet</h3>
            {evm.session.status !== "connected" ? (
              <StatusBadge tone="neutral">Not connected</StatusBadge>
            ) : evm.isSupportedChain ? (
              <StatusBadge tone="success">Connected</StatusBadge>
            ) : (
              <StatusBadge tone="attention">Unsupported network</StatusBadge>
            )}
          </div>
          <dl className="mt-2 divide-y divide-border">
            <Row label="Account">
              {evm.session.account ? <AddressText value={evm.session.account} label="EVM account" /> : <span className="text-copy-sm">-</span>}
            </Row>
            <Row label="Network">
              <span className="text-copy-sm">
                {evm.networkName ?? "-"}
                {evm.session.status === "connected" && !evm.isSupportedChain && ` (use ${evmNames})`}
              </span>
            </Row>
            <Row label="Execution account">
              <span className="text-copy-sm text-muted-foreground">
                Not created yet. Your EVM wallet will own it, and it holds your lending positions on each chain.
              </span>
            </Row>
            <Row label="Signs">
              <span className="text-copy-sm">
                Supplying, borrowing, repaying, and withdrawing on Base and Ethereum, plus transfers back to Stellar.
              </span>
            </Row>
          </dl>
          <div className="mt-3 max-w-xs">
            <EvmConnectButton />
          </div>
        </article>
      </div>
    </section>
  )
}
