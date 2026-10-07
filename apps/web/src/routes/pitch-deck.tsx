import { Link } from "react-router"
import type { Route } from "./+types/pitch-deck"

export const meta: Route.MetaFunction = ({ matches }) => [
  ...matches[0].meta.filter((tag) => !("title" in tag)),
  { title: "Pitch deck: coming soon · Astrion" },
]

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(108,182,255,0.16) 0%, rgba(45,212,191,0.08) 42%, transparent 70%)",
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-8 sm:px-8">
        <Link
          to="/"
          className="font-mono-num text-label inline-flex w-fit items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Astrion
        </Link>

        <div className="mt-16">
          <span className="font-mono-num text-label-xs inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1 uppercase text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Coming soon
          </span>
          <h1 className="text-display-compact mt-5 text-foreground">Pitch deck</h1>
          <p className="text-copy mt-5 max-w-xl text-muted-foreground">
            We&apos;re updating the deck for the cross-chain alpha. Until it&apos;s ready, the product scope and
            current status are public.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/docs"
              className="text-label rounded-md bg-primary px-4 py-2.5 text-primary-foreground transition-opacity hover:opacity-90"
            >
              How it works
            </Link>
            <Link
              to="/video-demo"
              className="text-label rounded-md border border-border px-4 py-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              Video demo
            </Link>
            <Link
              to="/"
              className="text-label rounded-md border border-border px-4 py-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
