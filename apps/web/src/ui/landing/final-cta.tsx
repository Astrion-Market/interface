import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

export function FinalCTA() {
  return (
    <section className="final-glow relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="relative mx-auto max-w-[720px] text-center">
        <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
          Follow the alpha
        </p>
        <h2 className="text-display-compact mt-3 text-foreground">
          Lend across chains.<br className="hidden sm:block" />{" "}
          <span className="text-primary">From Stellar.</span>
        </h2>
        <p className="text-copy mx-auto mt-5 max-w-[460px] text-muted-foreground">
          Try the current app on Stellar testnet, read how the cross-chain
          routes will work, or help build them on GitHub.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="default"
            className="h-12 gap-2 px-6 text-label"
            nativeButton={false}
            render={<Link to="/dashboard" />}
          >
            Open the app <span aria-hidden="true">→</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 px-6 text-label"
            nativeButton={false}
            render={<Link to="/docs" />}
          >
            Learn how it works
          </Button>
        </div>
        <p className="text-copy-sm mt-6 text-muted-foreground">
          In development · Testnet today · Not available on mainnet
        </p>
      </div>
    </section>
  )
}
