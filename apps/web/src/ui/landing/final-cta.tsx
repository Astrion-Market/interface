import { Button } from "@workspace/ui/components/button"

export function FinalCTA() {
  return (
    <section className="final-glow relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="relative mx-auto max-w-[720px] text-center">
        <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
          Ready to start
        </p>
        <h2 className="text-display-compact mt-3 text-foreground">
          Serious on-chain finance.<br className="hidden sm:block" />
          <span className="text-primary">Starts here.</span>
        </h2>
        <p className="text-copy mx-auto mt-5 max-w-[440px] text-muted-foreground">
          Supply assets, borrow against collateral, and participate in
          Stellar's foundational credit layer.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="default"
            className="h-12 gap-2 px-6 text-label"
            onClick={() => { window.location.href = "/dashboard" }}
          >
            Launch App <span>→</span>
          </Button>
          <Button variant="outline" className="h-12 px-6 text-label"
            onClick={() => { window.location.href = "/markets" }}>
            Browse Markets
          </Button>
        </div>
        <p className="text-copy-sm mt-6 text-muted-foreground/50">
          Non-custodial · On-chain · Soroban native
        </p>
      </div>
    </section>
  )
}
