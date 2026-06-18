import { Button } from "@workspace/ui/components/button"

export function FinalCTA() {
  return (
    <section className="final-glow relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="relative mx-auto max-w-[720px] text-center">
        <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Ready to start
        </p>
        <h2 className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[48px]">
          Serious on-chain finance.<br className="hidden sm:block" />
          <span className="text-primary">Starts here.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
          Supply assets, borrow against collateral, and participate in
          Stellar's foundational credit layer.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="default"
            className="h-12 gap-2 px-6 text-[14px] font-medium"
            onClick={() => { window.location.href = "/dashboard" }}
          >
            Launch App <span>→</span>
          </Button>
          <Button variant="outline" className="h-12 px-6 text-[14px]"
            onClick={() => { window.location.href = "/markets" }}>
            Browse Markets
          </Button>
        </div>
        <p className="mt-6 text-[12px] text-muted-foreground/50">
          Non-custodial · On-chain · Soroban native
        </p>
      </div>
    </section>
  )
}
