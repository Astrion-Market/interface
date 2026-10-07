import { useId, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { shortenIdentifier } from "../../lib/amounts"

// Long account, contract, or market identifiers. Shortened by default, with
// the full value always available to screen readers and one keypress away.
export function AddressText({
  value,
  label = "address",
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const short = shortenIdentifier(value)
  const canExpand = short !== value

  return (
    <span className={cn("inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1", className)}>
      <span
        id={id}
        className={cn(
          "font-mono-num text-[12.5px] text-foreground",
          expanded && "break-all"
        )}
        title={value}
      >
        {expanded || !canExpand ? (
          value
        ) : (
          <>
            <span aria-hidden="true">{short}</span>
            <span className="sr-only">{value}</span>
          </>
        )}
      </span>
      {canExpand && (
        <button
          type="button"
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="text-label-xs rounded-sm text-primary underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {expanded ? `Shorten ${label}` : `Show full ${label}`}
        </button>
      )}
    </span>
  )
}
