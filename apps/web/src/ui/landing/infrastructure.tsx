const TRUST = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Audited Contracts",
    body: "All protocol contracts go through third-party security audits before deployment. Audit reports are public.",
    stat: "Audits: —",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Non-Custodial",
    body: "The protocol never holds your funds. You interact directly with on-chain contracts; only you control withdrawals.",
    stat: "Self-custody",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
    title: "Stellar Native",
    body: "Built for Soroban — Stellar's smart contract platform. Sub-5s finality, low fees, and a proven validator network.",
    stat: "Soroban",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    title: "Open Source",
    body: "The full protocol — contracts, frontend, SDK — is open source and publicly verifiable on GitHub.",
    stat: "Apache 2.0",
  },
]

export function Infrastructure() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12">
          <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Security &amp; Trust
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[36px]">
            Built to be trusted.
          </h2>
          <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-muted-foreground">
            Every decision in Astrion's design prioritizes safety.
            From isolated market boundaries to oracle transparency — the system is built to fail gracefully.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon, title, body, stat }) => (
            <div key={title} className="group flex flex-col gap-4 rounded-lg border border-border p-5 transition-colors hover:border-primary/30 hover:bg-primary/3">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary">
                  {icon}
                </div>
                <span className="font-mono-num text-[10px] text-muted-foreground/60">{stat}</span>
              </div>
              <div>
                <h3 className="mb-1.5 text-[14px] font-semibold text-foreground">{title}</h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
