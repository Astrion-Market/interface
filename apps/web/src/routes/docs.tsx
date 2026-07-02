import { Link, createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"

export const Route = createFileRoute("/docs")({ component: Page })

function Page() {
  return (
    <AppLayout>
      <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
        <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col justify-center">
          <div className="font-mono-num text-label-xs inline-flex w-fit items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1 uppercase text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Documentation
          </div>

          <h1 className="text-display-compact mt-6 max-w-3xl text-foreground">
            Docs are coming soon.
          </h1>

          <p className="text-copy mt-5 max-w-2xl text-muted-foreground">
            We are preparing protocol guides, market references, integration
            notes, and developer examples for Astrion. Until then, you can keep
            exploring the live app surfaces.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Browse markets",
                body: "Review available lending markets.",
                to: "/markets" as const,
              },
              {
                label: "Open dashboard",
                body: "See wallet and position views.",
                to: "/dashboard" as const,
              },
              {
                label: "View analytics",
                body: "Inspect protocol-level metrics.",
                to: "/analytics" as const,
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/20"
              >
                <span className="text-label block text-foreground">
                  {item.label}
                </span>
                <span className="text-copy-sm mt-2 block text-muted-foreground">
                  {item.body}
                </span>
                <span className="mt-4 inline-flex text-sm text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppLayout>
  )
}
