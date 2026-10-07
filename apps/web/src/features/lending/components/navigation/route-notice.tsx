import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

export function RouteNotice({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link
          to="/markets"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse markets
        </Link>
        <Link
          to="/legacy"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Manage Stellar positions
        </Link>
      </div>
    </section>
  )
}

export function ArchivedFeature({ title }: { title: string }) {
  return (
    <RouteNotice title={`${title} is outside the lending preview`}>
      <p>
        Astrion is focusing on lending, borrowing, and transfers between Stellar
        and EVM lending markets. This earlier product area is no longer active
        here.
      </p>
      <p>
        Existing Stellar lending positions remain accessible for repayment and
        withdrawal.
      </p>
    </RouteNotice>
  )
}
