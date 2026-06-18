import { Button } from "@workspace/ui/components/button"

const CORE_MARKETS = [
  { symbol: "USDC", name: "USD Coin",    supplyApy: "—", borrowApy: "—", util: 0 },
  { symbol: "XLM",  name: "Stellar",     supplyApy: "—", borrowApy: "—", util: 0 },
  { symbol: "BTC",  name: "Bitcoin",     supplyApy: "—", borrowApy: "—", util: 0 },
  { symbol: "EURC", name: "Euro Coin",   supplyApy: "—", borrowApy: "—", util: 0 },
]

const ISOLATED_MARKETS = [
  { symbol: "AQUA", name: "Aquarius",    supplyApy: "—", borrowApy: "—", util: 0 },
  { symbol: "yBTC", name: "Yield BTC",   supplyApy: "—", borrowApy: "—", util: 0 },
]

function MarketRow({
  symbol, name, supplyApy, borrowApy, util, type,
}: {
  symbol: string; name: string; supplyApy: string; borrowApy: string; util: number; type: "core" | "isolated"
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
        type === "core" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"
      }`}>
        {symbol.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-foreground">{symbol}</p>
        <p className="text-[10px] text-muted-foreground">{name}</p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="font-mono-num text-[11px] text-emerald-400">{supplyApy}</p>
        <p className="text-[9px] text-muted-foreground">Supply APY</p>
      </div>
      <div className="text-right">
        <p className="font-mono-num text-[11px] text-amber-400">{borrowApy}</p>
        <p className="text-[9px] text-muted-foreground">Borrow APY</p>
      </div>
      <div className="hidden w-16 sm:block">
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${util}%` }} />
        </div>
        <p className="font-mono-num mt-0.5 text-[9px] text-muted-foreground">{util}%</p>
      </div>
    </div>
  )
}

export function Markets() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Markets
            </p>
            <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[36px]">
              Core &amp; Isolated markets.
            </h2>
          </div>
          <Button variant="outline" className="h-9 px-4 text-[12px]"
            onClick={() => { window.location.href = "/markets" }}>
            View all markets →
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Core markets */}
          <div className="overflow-hidden rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 border-b border-blue-500/20 bg-blue-500/5 px-4 py-3">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400" />
              <p className="text-[12px] font-semibold text-blue-400">Core Markets</p>
              <span className="ml-auto font-mono-num text-[10px] text-muted-foreground">Shared liquidity · Blue chip assets</span>
            </div>
            {CORE_MARKETS.map((m) => (
              <MarketRow key={m.symbol} {...m} type="core" />
            ))}
          </div>

          {/* Isolated markets */}
          <div className="overflow-hidden rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
              <p className="text-[12px] font-semibold text-amber-400">Isolated Markets</p>
              <span className="ml-auto font-mono-num text-[10px] text-muted-foreground">Independent risk</span>
            </div>
            {ISOLATED_MARKETS.map((m) => (
              <MarketRow key={m.symbol} {...m} type="isolated" />
            ))}
            <div className="border-t border-amber-500/10 bg-amber-500/5 px-4 py-3">
              <p className="text-[11px] text-amber-400/70">
                More isolated markets will be added via governance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
