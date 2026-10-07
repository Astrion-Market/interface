import { LineIcon } from "./illustrations"
import type { IconName } from "./illustrations"

const STATUS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "flask", title: "Testnet today", body: "Cross-chain routes aren't live yet." },
  { icon: "route", title: "Aave on Base first", body: "Morpho and Compound follow." },
  { icon: "wallets", title: "Two wallets", body: "Stellar plus an EVM wallet." },
]

export function AlphaStatus() {
  return (
    <section aria-label="Product status" className="px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <ul className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
          {STATUS.map(({ icon, title, body }) => (
            <li key={title} className="flex items-center gap-4 bg-card p-5 sm:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LineIcon name={icon} />
              </span>
              <div>
                <p className="text-label text-foreground">{title}</p>
                <p className="text-copy-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
