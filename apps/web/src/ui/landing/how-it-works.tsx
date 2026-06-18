const STEPS = [
  {
    num: "01",
    title: "Supply Collateral",
    body: "Deposit XLM, USDC, BTC, or EURC. Your assets start earning supply APY immediately while serving as borrowing collateral.",
    terminal: [
      { t: "→ deposit 10,000 USDC" },
      { t: "→ tx confirmed · 1 block" },
      { t: "→ earning 4.2% APY", ok: true },
      { t: "▸ collateral active", ok: true },
    ],
  },
  {
    num: "02",
    title: "Borrow Against It",
    body: "Select a borrow asset, review your projected health factor and liquidation price, then confirm in a single transaction.",
    terminal: [
      { t: "→ collateral: 10,000 USDC" },
      { t: "→ borrow: 5,000 EURC @ 5.1%" },
      { t: "→ health factor: 2.40", ok: true },
      { t: "▸ position open", ok: true },
    ],
  },
  {
    num: "03",
    title: "Monitor & Manage",
    body: "Watch your health factor in real time. Repay, supply more, or withdraw — all with the same single-click UX.",
    terminal: [
      { t: "→ health factor: 1.85" },
      { t: "→ liq. price: $0.078 XLM" },
      { t: "→ repay 1,000 EURC", ok: true },
      { t: "▸ health factor: 2.14", ok: true },
    ],
  },
]

function Terminal({ lines }: { lines: { t: string; ok?: boolean }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="font-mono-num ml-2 text-[9px] text-muted-foreground/50">astrion · cli</span>
      </div>
      <div className="space-y-1 p-3">
        {lines.map(({ t, ok }, i) => (
          <p key={i} className={`font-mono-num text-[11px] ${ok ? "text-emerald-400" : "text-muted-foreground"}`}>
            {t}
          </p>
        ))}
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12">
          <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[36px]">
            Three steps to on-chain credit.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ num, title, body, terminal }) => (
            <div key={num} className="flex flex-col gap-4 rounded-lg border border-border p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono-num flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[12px] font-bold text-primary">
                  {num}
                </span>
                <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              <Terminal lines={terminal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
