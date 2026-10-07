import { cn } from "@workspace/ui/lib/utils"
import { CHAINS, PROTOCOLS } from "../../lib/identity"
import type { ChainId, ProtocolId } from "../../lib/identity"

const SIZE = {
  sm: { mark: "size-4 text-[7px]", text: "text-[12px]" },
  md: { mark: "size-5 text-[8px]", text: "text-[13px]" },
}

function Mark({ mark, className }: { mark: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-mono-num inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase",
        className
      )}
    >
      {mark}
    </span>
  )
}

export function ChainBadge({
  chain,
  size = "md",
  className,
}: {
  chain: ChainId
  size?: keyof typeof SIZE
  className?: string
}) {
  const identity = CHAINS[chain]
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Mark mark={identity.mark} className={cn(identity.markClass, SIZE[size].mark)} />
      <span className={cn("font-medium text-foreground", SIZE[size].text)}>
        {identity.label}
      </span>
    </span>
  )
}

export function ProtocolBadge({
  protocol,
  chain,
  size = "md",
  className,
}: {
  protocol: ProtocolId
  // When set, reads "Aave V3 on Base".
  chain?: ChainId
  size?: keyof typeof SIZE
  className?: string
}) {
  const identity = PROTOCOLS[protocol]
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Mark mark={identity.mark} className={cn(identity.markClass, SIZE[size].mark)} />
      <span className={cn("font-medium text-foreground", SIZE[size].text)}>
        {identity.label} {identity.version}
        {chain && (
          <span className="font-normal text-muted-foreground">
            {" "}
            on {CHAINS[chain].label}
          </span>
        )}
      </span>
    </span>
  )
}

export function protocolLabel(protocol: ProtocolId) {
  const { label, version } = PROTOCOLS[protocol]
  return `${label} ${version}`
}
