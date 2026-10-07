import { StatusBadge } from "@workspace/ui/components/status-badge"
import { ChainBadge, ProtocolBadge } from "../../features/lending/components/primitives/identity-badge"
import type { StatusTone } from "@workspace/ui/components/status-badge"
import type { ExecutionChainId, ProtocolId } from "../../features/lending/lib/identity"

// Mirrors the capability matrix in docs/PRODUCT.md. Every cell is planned.
const CHAIN_COLUMNS: Array<ExecutionChainId> = ["base", "ethereum"]
const MATRIX: Array<{
  protocol: ProtocolId
  status: Record<ExecutionChainId, { text: string; tone: StatusTone }>
}> = [
  {
    protocol: "aave-v3",
    status: {
      base: { text: "First", tone: "pending" },
      ethereum: { text: "After Base", tone: "neutral" },
    },
  },
  {
    protocol: "morpho-blue",
    status: {
      base: { text: "Planned", tone: "neutral" },
      ethereum: { text: "After Base", tone: "neutral" },
    },
  },
  {
    protocol: "compound-v3",
    status: {
      base: { text: "Proposed", tone: "neutral" },
      ethereum: { text: "Proposed", tone: "neutral" },
    },
  },
]

export function Markets() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            Planned markets
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">
            Three protocols.<br />Base first.
          </h2>
          <p className="text-copy-sm mt-4 max-w-[360px] text-muted-foreground">
            Planned integrations, not partnerships. Live rates appear once each market ships.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <caption className="sr-only">Planned protocol and chain support</caption>
            <thead>
              <tr className="border-b border-border">
                <td className="px-4 py-3 sm:px-6" />
                {CHAIN_COLUMNS.map((chain) => (
                  <th key={chain} scope="col" className="px-3 py-3 text-left font-normal sm:px-6">
                    <ChainBadge chain={chain} size="sm" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MATRIX.map(({ protocol, status }) => (
                <tr key={protocol}>
                  <th scope="row" className="px-4 py-4 text-left font-normal sm:px-6">
                    <ProtocolBadge protocol={protocol} />
                  </th>
                  {CHAIN_COLUMNS.map((chain) => (
                    <td key={chain} className="px-3 py-4 sm:px-6">
                      <StatusBadge tone={status[chain].tone}>{status[chain].text}</StatusBadge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
