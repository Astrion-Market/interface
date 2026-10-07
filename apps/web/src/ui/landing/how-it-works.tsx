import { RouteSummary } from "../../features/lending/components/primitives/route-summary"
import type { RouteLeg } from "../../features/lending/components/primitives/route-summary"

const FLOWS: Array<{
  title: string
  summary: string
  legs: Array<RouteLeg>
  steps: Array<{ title: string; body: string }>
}> = [
  {
    title: "Lend from Stellar",
    summary: "Start with USDC in your Stellar wallet.",
    legs: [
      { kind: "origin", chain: "stellar", asset: "USDC" },
      { kind: "destination", chain: "base", protocol: "aave-v3", action: "Lend" },
    ],
    steps: [
      {
        title: "Choose a market",
        body: "Pick an approved market and see its variable rate, available liquidity, and when that data was last read.",
      },
      {
        title: "Review the route and costs",
        body: "See each leg, the estimated bridge and network fees, who pays gas, and which wallet signs each step.",
      },
      {
        title: "Sign and follow progress",
        body: "Sign on Stellar, then follow the transfer and the supply. Your supply earns the market rate once it is confirmed on Base, not while bridging.",
      },
    ],
  },
  {
    title: "Borrow to Stellar",
    summary: "Use eligible collateral you already hold on Base.",
    legs: [
      { kind: "origin", chain: "base", asset: "Collateral" },
      { kind: "destination", chain: "base", protocol: "aave-v3", action: "Borrow" },
      { kind: "receive", chain: "stellar", asset: "USDC" },
    ],
    steps: [
      {
        title: "Post collateral on Base",
        body: "Supply approved collateral to the market. XLM in your Stellar wallet is not usable as collateral there.",
      },
      {
        title: "Borrow USDC",
        body: "Check your health factor and liquidation point before your EVM wallet signs the borrow.",
      },
      {
        title: "Receive on Stellar",
        body: "USDC is sent to the Stellar address you confirm. Your debt is live, and accrues interest, while that transfer is pending.",
      },
    ],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 max-w-[640px]">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            How it will work
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">
            Lending and borrowing are different routes.
          </h2>
          <p className="text-copy mt-4 text-muted-foreground">
            Every review screen shows where your funds start, which market they
            reach, and where anything comes back. These flows are planned and
            not yet available.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {FLOWS.map(({ title, summary, legs, steps }) => (
            <article key={title} className="flex flex-col gap-5 rounded-lg border border-border p-5 sm:p-6">
              <div>
                <h3 className="text-heading-card text-foreground">{title}</h3>
                <p className="text-copy-sm mt-1 text-muted-foreground">{summary}</p>
              </div>
              <RouteSummary legs={legs} />
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                    <span
                      aria-hidden="true"
                      className="font-mono-num flex size-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[12px] font-semibold text-primary"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-label text-foreground">{step.title}</p>
                      <p className="text-copy-sm mt-0.5 text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <p className="text-copy-sm mt-6 max-w-[720px] text-muted-foreground">
          Collateral and debt stay on the lending chain. Sending USDC back to
          Stellar does not move them. Repaying from Stellar and withdrawing to
          Stellar follow the same route review.
        </p>
      </div>
    </section>
  )
}
