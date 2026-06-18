const COLORS: Record<string, { bg: string; text: string }> = {
  XLM:  { bg: "bg-sky-500/15",    text: "text-sky-400" },
  USDC: { bg: "bg-blue-500/15",   text: "text-blue-400" },
  EURC: { bg: "bg-indigo-500/15", text: "text-indigo-400" },
  BTC:  { bg: "bg-amber-500/15",  text: "text-amber-400" },
  ETH:  { bg: "bg-violet-500/15", text: "text-violet-400" },
  AQUA: { bg: "bg-cyan-500/15",   text: "text-cyan-400" },
  yBTC: { bg: "bg-orange-500/15", text: "text-orange-400" },
}

type Props = {
  symbol: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-10 w-10 text-[13px]",
}

export function AssetIcon({ symbol, size = "md" }: Props) {
  const color = COLORS[symbol] ?? { bg: "bg-muted", text: "text-muted-foreground" }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${color.bg} ${color.text} ${sizeMap[size]}`}
    >
      {symbol.slice(0, 2)}
    </span>
  )
}
