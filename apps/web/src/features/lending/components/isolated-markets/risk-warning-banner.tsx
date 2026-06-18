export function RiskWarningBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/8 p-4">
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="mt-0.5 shrink-0 text-amber-400"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-amber-400">Isolated Market Risk</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Isolated markets use separate liquidity pools, borrow caps, and liquidation rules from Core Markets.
          Each market carries independent risk — a failure in one does not affect the rest of the protocol.
          Carefully review the risk parameters before supplying or borrowing.
        </p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-400/60" />
            Lower liquidity depth than Core Markets
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-400/60" />
            Separate liquidation thresholds and penalties
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-400/60" />
            Borrow caps may limit available liquidity
          </li>
        </ul>
      </div>
    </div>
  )
}
