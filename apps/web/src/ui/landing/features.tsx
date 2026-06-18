/* Features grid — inspired by dense product feature grids with bordered cells */

function HealthVisual() {
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      {[
        { value: 2.4, color: "#10b981", label: "Safe" },
        { value: 1.3, color: "#f59e0b", label: "Moderate" },
        { value: 0.9, color: "#ef4444", label: "Danger" },
      ].map(({ value, color, label }) => {
        const r = 22, circ = 2 * Math.PI * r, arc = circ * 0.75
        const progress = Math.min(value / 3, 1) * arc
        return (
          <div key={label} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 56 56" className="h-12 w-12" style={{ transform: "rotate(135deg)" }}>
              <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="4"
                strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" className="text-muted/20" />
              <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
                strokeDasharray={`${progress} ${circ}`} strokeLinecap="round" />
            </svg>
            <span className="font-mono-num -mt-3 text-[10px] font-medium" style={{ color }}>{value.toFixed(1)}</span>
            <span className="text-[9px] text-muted-foreground">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function MarketVisual() {
  return (
    <div className="space-y-2 px-1">
      {[
        { symbol: "USDC", type: "Core",     supplyApy: "4.2%",  util: 68, border: "border-blue-500/20",  badge: "text-blue-400 bg-blue-500/10" },
        { symbol: "XLM",  type: "Core",     supplyApy: "2.8%",  util: 52, border: "border-blue-500/20",  badge: "text-blue-400 bg-blue-500/10" },
        { symbol: "AQUA", type: "Isolated", supplyApy: "14.8%", util: 38, border: "border-amber-500/20", badge: "text-amber-400 bg-amber-500/10" },
      ].map(({ symbol, type, supplyApy, util, border, badge }) => (
        <div key={symbol} className={`flex items-center gap-3 rounded border ${border} p-2`}>
          <span className="font-mono-num w-10 text-[11px] font-semibold text-foreground">{symbol}</span>
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${badge}`}>{type}</span>
          <div className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${util}%` }} />
            </div>
          </div>
          <span className="font-mono-num text-[11px] text-emerald-400">{supplyApy}</span>
        </div>
      ))}
    </div>
  )
}

function OracleVisual() {
  return (
    <div className="space-y-2">
      {[
        { provider: "DIA Oracle",       status: "Live", updated: "2s ago",  ok: true },
        { provider: "Band Protocol",    status: "Live", updated: "5s ago",  ok: true },
        { provider: "Reflector Oracle", status: "Live", updated: "12s ago", ok: true },
      ].map(({ provider, status, updated, ok }) => (
        <div key={provider} className="flex items-center justify-between rounded border border-border p-2">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
            <span className="text-[11px] text-foreground">{provider}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-num text-[10px] text-emerald-400">{status}</span>
            <span className="font-mono-num text-[10px] text-muted-foreground">{updated}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function BorrowVisual() {
  return (
    <div className="space-y-2.5 px-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Borrow flow</div>
      {[
        { step: "01", text: "Select collateral", done: true },
        { step: "02", text: "Choose borrow asset", done: true },
        { step: "03", text: "Review risk preview", done: false },
        { step: "04", text: "Confirm transaction", done: false },
      ].map(({ step, text, done }) => (
        <div key={step} className="flex items-center gap-2.5">
          <span className={`font-mono-num flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-medium ${done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>
            {done ? "✓" : step}
          </span>
          <span className={`text-[11px] ${done ? "text-foreground" : "text-muted-foreground"}`}>{text}</span>
        </div>
      ))}
    </div>
  )
}

const SMALL_FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Non-Custodial",
    body: "Your keys, your collateral. Positions settle on-chain; no centralized custody or withdrawal queues.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Capital Efficient",
    body: "Core markets share deep liquidity for better rates. Isolated markets contain risk without limiting growth.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Transparent Risk",
    body: "Every position shows liquidation price, health factor, and APY in real time. No hidden parameters.",
  },
]

export function Features() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        {/* Section label */}
        <div className="mb-10">
          <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Why Astrion
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[36px]">
            Institutional-grade lending.<br className="hidden sm:block" /> Designed for Soroban.
          </h2>
        </div>

        {/* Big feature grid — inspired by the screenshot grid */}
        <div className="overflow-hidden border border-border">
          {/* Row 1: 2 large cells */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Health Factor */}
            <div className="border-b border-border p-6 sm:border-r lg:p-8">
              <p className="font-mono-num mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Health Factor System
              </p>
              <h3 className="mb-4 text-[18px] font-semibold text-foreground">
                Always know your liquidation risk
              </h3>
              <HealthVisual />
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
                A color-coded gauge shows your position's safety at a glance.
                Green is safe. Amber is a warning. Red means act now.
              </p>
            </div>

            {/* Markets */}
            <div className="border-b border-border p-6 lg:p-8">
              <p className="font-mono-num mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Hybrid Markets
              </p>
              <h3 className="mb-4 text-[18px] font-semibold text-foreground">
                Core + Isolated markets
              </h3>
              <MarketVisual />
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
                Stable assets share deep liquidity in Core markets.
                Volatile or experimental assets live in isolated pools — failure stays contained.
              </p>
            </div>
          </div>

          {/* Row 2: 2 cells */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Oracle */}
            <div className="border-b border-border p-6 sm:border-r lg:p-8">
              <p className="font-mono-num mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Oracle Transparency
              </p>
              <h3 className="mb-4 text-[18px] font-semibold text-foreground">
                Price feeds, always visible
              </h3>
              <OracleVisual />
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
                Every market displays its oracle provider, last update time, and confidence score.
                No hidden price sources.
              </p>
            </div>

            {/* Borrow flow */}
            <div className="border-b border-border p-6 lg:p-8">
              <p className="font-mono-num mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Guided Borrow Flow
              </p>
              <h3 className="mb-4 text-[18px] font-semibold text-foreground">
                4-step borrow with risk preview
              </h3>
              <BorrowVisual />
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
                Step 3 shows liquidation price, health factor impact, and stress scenarios
                before you sign a single transaction.
              </p>
            </div>
          </div>

          {/* Row 3: 3 small feature cells */}
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {SMALL_FEATURES.map(({ icon, title, body }, i) => (
              <div
                key={title}
                className={`p-6 lg:p-8 ${i < SMALL_FEATURES.length - 1 ? "border-b sm:border-b-0 sm:border-r border-border" : ""}`}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                  {icon}
                </div>
                <h4 className="mb-2 text-[15px] font-semibold text-foreground">{title}</h4>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
