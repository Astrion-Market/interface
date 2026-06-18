type Props = {
  type: "core" | "isolated"
}

export function MarketBadge({ type }: Props) {
  if (type === "core") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        Core Market
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Isolated Risk
    </span>
  )
}
