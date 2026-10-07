import { StatusBadge } from "@workspace/ui/components/status-badge"
import type { StatusTone } from "@workspace/ui/components/status-badge"

const STATUS: Array<{ label: string; tone: StatusTone; badge: string; body: string }> = [
  {
    label: "Today",
    tone: "neutral",
    badge: "Stellar testnet",
    body: "The app runs Astrion's earlier Stellar lending markets on testnet with test assets. Cross-chain routes are not live yet.",
  },
  {
    label: "First route",
    tone: "pending",
    badge: "In development",
    body: "Lend Stellar USDC into Aave V3 on Base, then add borrowing, repayment, and withdrawal back to Stellar.",
  },
  {
    label: "You will need",
    tone: "attention",
    badge: "Two wallets",
    body: "A Stellar wallet and an EVM wallet you control. The EVM wallet owns the account that holds your lending position.",
  },
]

export function AlphaStatus() {
  return (
    <section aria-label="Product status" className="px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 overflow-hidden border border-border bg-card md:grid-cols-3">
          {STATUS.map(({ label, tone, badge, body }, i) => (
            <div
              key={label}
              className={`p-6 sm:p-8 ${i < STATUS.length - 1 ? "border-b border-border md:border-b-0 md:border-r" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
                  {label}
                </p>
                <StatusBadge tone={tone}>{badge}</StatusBadge>
              </div>
              <p className="text-copy-sm mt-3 text-foreground/85">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
