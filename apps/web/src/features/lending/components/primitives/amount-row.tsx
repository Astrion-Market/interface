import { cn } from "@workspace/ui/lib/utils"
import { formatUnits } from "../../lib/amounts"
import { ChainBadge } from "./identity-badge"
import type { ChainId } from "../../lib/identity"

// A <dl> of label/amount pairs. Put AmountRow children inside.
export function AmountList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <dl className={cn("divide-y divide-border rounded-lg border border-border", className)}>
      {children}
    </dl>
  )
}

export function AmountRow({
  label,
  raw,
  decimals,
  symbol,
  chain,
  hint,
  emphasis = false,
  maxFractionDigits,
}: {
  label: React.ReactNode
  raw: bigint | null
  decimals: number
  symbol: string
  chain?: ChainId
  hint?: React.ReactNode
  emphasis?: boolean
  maxFractionDigits?: number
}) {
  const formatted = raw === null ? null : formatUnits(raw, decimals, { maxFractionDigits })
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-3 py-2.5">
      <dt className="min-w-0">
        <span className="text-copy-sm text-muted-foreground">{label}</span>
        {hint && (
          <span className="text-label-xs mt-0.5 block font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </dt>
      <dd className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 text-right">
        {formatted === null ? (
          <span className="text-copy-sm text-muted-foreground">Not available</span>
        ) : (
          <span
            className={cn(
              "font-mono-num break-all text-foreground",
              emphasis ? "text-[15px] font-semibold" : "text-[13px]"
            )}
          >
            {formatted.text}
            {formatted.truncated && (
              <span className="text-muted-foreground" title="More digits hidden; value rounded toward zero">
                …
              </span>
            )}{" "}
            <span className="text-muted-foreground">{symbol}</span>
          </span>
        )}
        {chain && <ChainBadge chain={chain} size="sm" />}
      </dd>
    </div>
  )
}
