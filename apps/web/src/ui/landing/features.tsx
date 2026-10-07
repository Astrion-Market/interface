import { StatusBadge } from "@workspace/ui/components/status-badge"
import { DataFreshness } from "../../features/lending/components/primitives/data-freshness"
import { RiskStatus } from "../../features/lending/components/primitives/risk-status"

// Fixed reference time so the illustrative freshness label is stable.
const EXAMPLE_NOW = Date.parse("2026-10-07T12:00:00Z")

function RiskVisual() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background/60 p-4">
      <RiskStatus
        level="attention"
        metric={{ label: "Health factor", value: "1.32" }}
        reason="Example: a 20% collateral price drop reaches liquidation."
      />
      <DataFreshness updatedAt={new Date(EXAMPLE_NOW - 60_000)} source="Aave" now={EXAMPLE_NOW} />
    </div>
  )
}

function TrackingVisual() {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background/60 p-4">
      <StatusBadge tone="success">Borrow confirmed on Base</StatusBadge>
      <StatusBadge tone="pending">Transfer to Stellar pending</StatusBadge>
      <StatusBadge tone="attention">Debt is live</StatusBadge>
    </div>
  )
}

const BENEFITS = [
  {
    eyebrow: "Access",
    title: "Start and finish on Stellar",
    body: "Fund lending positions with Stellar USDC and receive borrowed or withdrawn USDC back in your Stellar wallet.",
  },
  {
    eyebrow: "Clarity",
    title: "See the whole route before you sign",
    body: "Each review lists the source, the lending market, the receiving chain, estimated fees, who pays gas, and every signature required.",
  },
  {
    eyebrow: "Risk",
    title: "Risk beside the action",
    body: "Collateral type, protocol health measures, available liquidity, and the age of that data sit next to the amount you enter.",
    visual: <RiskVisual />,
  },
  {
    eyebrow: "Tracking",
    title: "Transfers you can follow",
    body: "Each leg is tracked from observed chain events and survives reloads, so you always know the next step if something stalls.",
    visual: <TrackingVisual />,
  },
]

export function Features() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 max-w-[640px]">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            Why Astrion
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">
            Cross-chain lending you can read before you sign.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {BENEFITS.map(({ eyebrow, title, body, visual }) => (
            <div
              key={title}
              className="flex flex-col gap-4 bg-background p-6 lg:p-8"
            >
              <div>
                <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
                  {eyebrow}
                </p>
                <h3 className="text-heading-card mt-1 text-foreground">{title}</h3>
                <p className="text-copy-sm mt-2 text-muted-foreground">{body}</p>
              </div>
              {visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
