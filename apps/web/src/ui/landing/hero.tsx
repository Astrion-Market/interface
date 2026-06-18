import { Button } from "@workspace/ui/components/button"

function OrbitalBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ob-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6CB6FF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="ob-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft ambient glow centred on the right (where mockup sits) */}
      <ellipse cx="860" cy="310" rx="420" ry="340" fill="url(#ob-glow)" />

      {/* Outer orbital ring */}
      <ellipse
        cx="860" cy="310" rx="320" ry="320"
        stroke="url(#ob-grad)" strokeWidth="0.6" opacity="0.07"
      />

      {/* Tilted orbital A — main equatorial ring (matches logo motif) */}
      <ellipse
        cx="860" cy="310" rx="300" ry="110"
        stroke="url(#ob-grad)" strokeWidth="0.8" opacity="0.10"
        transform="rotate(-22 860 310)"
      />

      {/* Tilted orbital B */}
      <ellipse
        cx="860" cy="310" rx="220" ry="290"
        stroke="url(#ob-grad)" strokeWidth="0.6" opacity="0.06"
        transform="rotate(18 860 310)"
      />

      {/* Inner accent ring */}
      <ellipse
        cx="860" cy="310" rx="130" ry="50"
        stroke="url(#ob-grad)" strokeWidth="0.7" opacity="0.09"
        transform="rotate(-22 860 310)"
      />

      {/* Constellation connection lines */}
      <g stroke="url(#ob-grad)" strokeWidth="0.5" opacity="0.12" strokeLinecap="round">
        <line x1="860" y1="310" x2="630" y2="170" />
        <line x1="860" y1="310" x2="1050" y2="175" />
        <line x1="860" y1="310" x2="1000" y2="460" />
        <line x1="860" y1="310" x2="720" y2="430" />
        <line x1="630" y1="170" x2="1050" y2="175" />
      </g>

      {/* Constellation nodes — large 4-pointed stars */}
      {/* Top-right star */}
      <path
        d="M1050 175 L1052.6 182.8 L1060 175 L1052.6 167.2 Z
           M1050 175 L1042.2 172.4 L1050 165 L1057.8 172.4 Z"
        fill="url(#ob-grad)" opacity="0.45"
      />
      {/* Top-left star */}
      <path
        d="M630 170 L632.2 176.2 L638 170 L632.2 163.8 Z
           M630 170 L623.8 167.8 L630 162 L636.2 167.8 Z"
        fill="url(#ob-grad)" opacity="0.35"
      />
      {/* Bottom-right star */}
      <path
        d="M1000 460 L1001.8 465.4 L1007 460 L1001.8 454.6 Z
           M1000 460 L994.6 458.2 L1000 453 L1005.4 458.2 Z"
        fill="url(#ob-grad)" opacity="0.30"
      />

      {/* Small orbital nodes — circles */}
      <circle cx="860" cy="310" r="3.5" fill="url(#ob-grad)" opacity="0.55" />
      <circle cx="630" cy="170" r="2.2" fill="url(#ob-grad)" opacity="0.40" />
      <circle cx="1050" cy="175" r="1.8" fill="url(#ob-grad)" opacity="0.35" />
      <circle cx="1000" cy="460" r="1.6" fill="url(#ob-grad)" opacity="0.28" />
      <circle cx="720" cy="430" r="1.4" fill="url(#ob-grad)" opacity="0.25" />
      <circle cx="760" cy="175" r="1.2" fill="url(#ob-grad)" opacity="0.20" />
      <circle cx="980" cy="250" r="1.0" fill="url(#ob-grad)" opacity="0.18" />
      <circle cx="730" cy="390" r="0.9" fill="url(#ob-grad)" opacity="0.15" />

      {/* Faint far-field dots — left side */}
      <circle cx="180" cy="120" r="1.1" fill="#6CB6FF" opacity="0.08" />
      <circle cx="80"  cy="300" r="0.9" fill="#22D3EE" opacity="0.06" />
      <circle cx="240" cy="490" r="1.0" fill="#6CB6FF" opacity="0.07" />
      <circle cx="350" cy="200" r="0.8" fill="#22D3EE" opacity="0.05" />
    </svg>
  )
}

function HealthMeter({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 30
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const progress = Math.min(value / 3, 1) * arc
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 80 80" className="h-16 w-16" style={{ transform: "rotate(135deg)" }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" className="text-muted/30" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="font-mono-num -mt-5 text-[11px]" style={{ color }}>{label}</span>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <span className="font-mono-num text-[10px] text-muted-foreground">astrion · dashboard</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {[
          { label: "Net Worth",   value: "$24,850",  accent: "text-foreground" },
          { label: "Supplied",    value: "$30,000",  accent: "text-primary" },
          { label: "Borrowed",    value: "$5,150",   accent: "text-foreground" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`font-mono-num mt-0.5 text-[13px] font-semibold tabular-nums ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Health factor gauges */}
      <div className="flex items-center justify-around border-b border-border px-4 py-3">
        <HealthMeter value={2.4} label="2.40 Safe" color="#10b981" />
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Positions</p>
          {[
            { symbol: "USDC", type: "Supply",     apy: "4.2%", color: "text-emerald-400" },
            { symbol: "XLM",  type: "Collateral", apy: "2.8%", color: "text-primary" },
            { symbol: "BTC",  type: "Borrow",     apy: "5.1%", color: "text-amber-400" },
          ].map(({ symbol, type, apy, color }) => (
            <div key={symbol} className="flex items-center gap-3">
              <span className={`font-mono-num text-[10px] font-medium ${color}`}>{symbol}</span>
              <span className="text-[9px] text-muted-foreground">{type}</span>
              <span className={`font-mono-num ml-auto text-[10px] tabular-nums ${color}`}>{apy}</span>
            </div>
          ))}
        </div>
        <HealthMeter value={1.2} label="1.20 Risk" color="#f59e0b" />
      </div>

      {/* Mini market row */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {[
          { symbol: "USDC", badge: "Core",     supplyApy: "4.2%",  utilization: 68, badgeColor: "text-primary border-primary/20 bg-primary/8" },
          { symbol: "AQUA", badge: "Isolated", supplyApy: "14.8%", utilization: 42, badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/8" },
        ].map(({ symbol, badge, supplyApy, utilization, badgeColor }) => (
          <div key={symbol} className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[11px] font-medium">{symbol}</span>
              <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${badgeColor}`}>{badge}</span>
            </div>
            <p className="font-mono-num mt-1 text-[13px] font-semibold text-emerald-400">{supplyApy}</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${utilization}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
      <OrbitalBackground />

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left — copy */}
          <div>
            <span className="font-mono-num inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" style={{ animation: "pulseDot 2.4s ease-in-out infinite" }} />
              Stellar · Soroban · Testnet
            </span>

            <h1
              className="font-trading mt-6 font-semibold leading-[1.05] tracking-[-0.03em] text-foreground"
              style={{ fontSize: "clamp(40px, 4.8vw, 70px)" }}
            >
              The credit layer<br />
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(115deg, #6CB6FF 0%, #22D3EE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                for Stellar.
              </span>
            </h1>

            <p className="mt-5 max-w-[460px] text-[16px] leading-[1.65] text-muted-foreground">
              Supply assets and earn yield. Borrow against collateral.
              Astrion is a hybrid lending protocol — institutional-grade,
              built on Soroban.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="default"
                className="h-11 gap-2 px-5 text-[13.5px] font-medium"
                onClick={() => { window.location.href = "/dashboard" }}
              >
                Launch App <span>→</span>
              </Button>
              <Button variant="outline" className="h-11 px-5 text-[13.5px]">
                View Markets
              </Button>
            </div>

            <div className="font-mono-num mt-8 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground/70">
              <span><span className="font-medium text-foreground">—</span> TVL</span>
              <span className="h-3 w-px bg-border" />
              <span><span className="font-medium text-foreground">—</span> Markets</span>
              <span className="h-3 w-px bg-border" />
              <span><span className="font-medium text-foreground">Non-custodial</span></span>
              <span className="h-3 w-px bg-border" />
              <span><span className="font-medium text-foreground">Soroban</span> native</span>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div
            className="flex justify-center lg:justify-end"
            style={{ animation: "floatUp 5s ease-in-out infinite" }}
          >
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
