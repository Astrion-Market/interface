import { cn } from "@workspace/ui/lib/utils"
import { CHAINS } from "../../lib/identity"
import { ChainBadge, ProtocolBadge, protocolLabel } from "./identity-badge"
import type { ChainId, ExecutionChainId, ProtocolId } from "../../lib/identity"

export type RouteLeg =
  | { kind: "origin"; chain: ChainId; asset: string }
  | {
      kind: "destination"
      chain: ExecutionChainId
      protocol: ProtocolId
      action: "Lend" | "Borrow" | "Repay" | "Withdraw"
    }
  | { kind: "receive"; chain: ChainId; asset: string }

const LEG_LABEL: Record<RouteLeg["kind"], string> = {
  origin: "From",
  destination: "Lending market",
  receive: "Receive",
}

// "Stellar USDC → Aave V3 on Base → receive USDC on Stellar"
export function describeRoute(legs: Array<RouteLeg>) {
  return legs
    .map((leg) => {
      if (leg.kind === "origin") return `${CHAINS[leg.chain].label} ${leg.asset}`
      if (leg.kind === "destination")
        return `${protocolLabel(leg.protocol)} on ${CHAINS[leg.chain].label}`
      return `receive ${leg.asset} on ${CHAINS[leg.chain].label}`
    })
    .join(" → ")
}

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="flex items-center justify-center text-muted-foreground @max-md:h-3 @max-md:rotate-90 @md:px-1"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </span>
  )
}

function LegContent({ leg }: { leg: RouteLeg }) {
  if (leg.kind === "destination") {
    return (
      <>
        <ProtocolBadge protocol={leg.protocol} chain={leg.chain} />
        <span className="text-copy-sm text-muted-foreground">{leg.action}</span>
      </>
    )
  }
  return (
    <>
      <ChainBadge chain={leg.chain} />
      <span className="font-mono-num text-copy-sm text-muted-foreground">
        {leg.asset}
      </span>
    </>
  )
}

export function RouteSummary({
  legs,
  note,
  className,
}: {
  legs: Array<RouteLeg>
  // Explains which legs apply, e.g. that lending has no return transfer.
  note?: React.ReactNode
  className?: string
}) {
  const sentence = describeRoute(legs)
  return (
    <figure className={cn("@container rounded-lg border border-border bg-card p-3", className)}>
      <figcaption className="sr-only">Route: {sentence}</figcaption>
      <ol
        aria-hidden="true"
        className="flex flex-col items-stretch gap-1 @md:flex-row @md:items-center"
      >
        {legs.map((leg, index) => (
          <li key={`${leg.kind}-${index}`} className="contents">
            {index > 0 && <Arrow />}
            <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-md bg-muted/50 px-3 py-2">
              <span className="text-label-xs text-muted-foreground uppercase">
                {LEG_LABEL[leg.kind]}
              </span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <LegContent leg={leg} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {note && (
        <p className="text-copy-sm mt-2 px-1 text-muted-foreground">{note}</p>
      )}
    </figure>
  )
}
