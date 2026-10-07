import { StatusBadge } from "@workspace/ui/components/status-badge"
import { ChainBadge, ProtocolBadge } from "../../features/lending/components/primitives/identity-badge"
import type { StatusTone } from "@workspace/ui/components/status-badge"
import type { ExecutionChainId, ProtocolId } from "../../features/lending/lib/identity"

// Mirrors the capability matrix in docs/PRODUCT.md. Every row is planned.
const ROUTES: Array<{
  protocol: ProtocolId
  chain: ExecutionChainId
  lend: string
  borrow: string
  status: string
  tone: StatusTone
}> = [
  {
    protocol: "aave-v3",
    chain: "base",
    lend: "Supply native USDC to an approved reserve",
    borrow: "Borrow USDC against approved collateral",
    status: "First planned route",
    tone: "pending",
  },
  {
    protocol: "morpho-blue",
    chain: "base",
    lend: "Supply USDC as the loan asset in an approved market",
    borrow: "Post that market's collateral and borrow USDC",
    status: "Planned",
    tone: "neutral",
  },
  {
    protocol: "compound-v3",
    chain: "base",
    lend: "Supply USDC to an approved USDC Comet",
    borrow: "Post eligible collateral and borrow USDC",
    status: "Proposed",
    tone: "neutral",
  },
  {
    protocol: "aave-v3",
    chain: "ethereum",
    lend: "Supply native USDC to an approved reserve",
    borrow: "Borrow USDC against approved collateral",
    status: "After Base",
    tone: "neutral",
  },
  {
    protocol: "morpho-blue",
    chain: "ethereum",
    lend: "Supply USDC as the loan asset in an approved market",
    borrow: "Post that market's collateral and borrow USDC",
    status: "After Base",
    tone: "neutral",
  },
  {
    protocol: "compound-v3",
    chain: "ethereum",
    lend: "Supply USDC to an approved USDC Comet",
    borrow: "Post eligible collateral and borrow USDC",
    status: "Proposed",
    tone: "neutral",
  },
]

export function Markets() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 max-w-[640px]">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            Planned markets
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">
            Three protocols. Base first, then Ethereum.
          </h2>
          <p className="text-copy mt-4 text-muted-foreground">
            Each market is enabled on its own after integration and release
            checks. Rates and liquidity will appear from live market data, with
            the time they were read.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left">
            <caption className="sr-only">Planned protocol and chain routes</caption>
            <thead className="hidden bg-muted/40 md:table-header-group">
              <tr className="text-label-xs uppercase text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Market</th>
                <th scope="col" className="px-4 py-3 font-medium">Lend</th>
                <th scope="col" className="px-4 py-3 font-medium">Borrow</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROUTES.map((route) => (
                <tr
                  key={`${route.protocol}-${route.chain}`}
                  className="grid grid-cols-1 gap-2 px-4 py-4 md:table-row md:p-0"
                >
                  <th scope="row" className="font-normal md:px-4 md:py-3.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <ProtocolBadge protocol={route.protocol} />
                      <ChainBadge chain={route.chain} size="sm" />
                    </div>
                  </th>
                  <td className="text-copy-sm text-muted-foreground md:px-4 md:py-3.5">
                    <span className="font-medium text-foreground md:hidden">Lend: </span>
                    {route.lend}
                  </td>
                  <td className="text-copy-sm text-muted-foreground md:px-4 md:py-3.5">
                    <span className="font-medium text-foreground md:hidden">Borrow: </span>
                    {route.borrow}
                  </td>
                  <td className="md:px-4 md:py-3.5">
                    <StatusBadge tone={route.tone}>{route.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-copy-sm mt-4 text-muted-foreground">
          Compound III is the proposed third protocol and still needs
          confirmation. Protocol names describe planned integrations, not
          partnerships or endorsements.
        </p>
      </div>
    </section>
  )
}
