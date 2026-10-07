import { LineIcon } from "./illustrations"
import type { IconName } from "./illustrations"

const BENEFITS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "home", title: "Stellar in, Stellar out", body: "Fund and get paid in Stellar USDC." },
  { icon: "eye", title: "See the full route", body: "Every leg, fee, and signature up front." },
  { icon: "gauge", title: "Risk in plain view", body: "Health and liquidity beside every action." },
  { icon: "clock", title: "Track every transfer", body: "Progress survives reloads and restarts." },
]

export function Features() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            Why Astrion
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">Clear before you sign.</h2>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6CB6FF]/20 to-[#22D3EE]/10 text-primary">
                <LineIcon name={icon} className="size-6" />
              </span>
              <h3 className="text-heading-card mt-5 text-foreground">{title}</h3>
              <p className="text-copy-sm mt-1 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
