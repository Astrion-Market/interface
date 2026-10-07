import { FlowStrip } from "./illustrations"

const FLOWS = [
  {
    title: "Lend",
    caption: "Earn once your supply lands on Base.",
    steps: [
      { icon: "wallet", text: "USDC on Stellar" },
      { icon: "bridge", text: "Bridge via CCTP" },
      { icon: "bank", text: "Supply on Base" },
    ],
  },
  {
    title: "Borrow",
    caption: "Collateral and debt stay on Base.",
    steps: [
      { icon: "lock", text: "Collateral on Base" },
      { icon: "coins", text: "Borrow USDC" },
      { icon: "home", text: "Receive on Stellar" },
    ],
  },
] as const

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            How it will work
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">Two routes. Three steps each.</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {FLOWS.map(({ title, caption, steps }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-heading-card text-foreground">{title}</h3>
                <p className="text-copy-sm text-muted-foreground">{caption}</p>
              </div>
              <FlowStrip label={`${title} steps`} steps={[...steps]} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
