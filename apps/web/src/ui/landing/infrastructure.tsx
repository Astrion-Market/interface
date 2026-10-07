import { LineIcon } from "./illustrations"
import type { IconName } from "./illustrations"

const RISKS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "flask", title: "Alpha software", body: "Security review comes before mainnet." },
  { icon: "lock", title: "Positions stay on EVM", body: "Liquidation can happen mid-transfer." },
  { icon: "clock", title: "Transfers take time", body: "Times and fees are estimates." },
  { icon: "wave", title: "Rates move", body: "APY is variable; fees are separate." },
  { icon: "link", title: "Contract risk", body: "Protocols, CCTP, and Astrion can fail." },
  { icon: "wallets", title: "Two wallets", body: "Stellar-only signing comes later." },
]

export function Risks() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            Before you start
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">Know the risks.</h2>
        </div>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {RISKS.map(({ icon, title, body }) => (
            <li key={title} className="flex items-start gap-4 bg-background p-5">
              <span className="mt-0.5 text-attention">
                <LineIcon name={icon} />
              </span>
              <div>
                <h3 className="text-label text-foreground">{title}</h3>
                <p className="text-copy-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
