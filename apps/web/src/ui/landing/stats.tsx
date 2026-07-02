const STATS = [
  { label: "Total Value Locked",  value: "—",  sub: "At protocol launch" },
  { label: "Active Markets",      value: "—",  sub: "Core + Isolated" },
  { label: "Total Suppliers",     value: "—",  sub: "Unique wallets" },
  { label: "Protocol Revenue",    value: "—",  sub: "Lifetime fees" },
]

export function Stats() {
  return (
    <section className="px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-2 overflow-hidden border border-border bg-card lg:grid-cols-4">
          {STATS.map(({ label, value, sub }, i) => (
            <div
              key={label}
              className={`p-6 sm:p-8 ${
                i < STATS.length - 1 ? "border-b border-border lg:border-b-0 lg:border-r" : ""
              } ${i % 2 === 0 && i < 2 ? "max-lg:border-r" : ""}`}
            >
              <p className="font-mono-num text-label-xs flex items-center gap-2 uppercase text-muted-foreground">
                <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                {label}
              </p>
              <p className="text-number-lg mt-3 text-foreground">
                {value}
              </p>
              <p className="text-copy-sm mt-1.5 text-muted-foreground/60">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
