import { Link } from "@tanstack/react-router"
import { AppSidebar } from "./app-sidebar"

type Props = {
  children: React.ReactNode
}

export function AppLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <a
        href="#main-content"
        className="sr-only fixed top-2 left-2 z-[60] rounded-md bg-background p-3 text-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <AppSidebar />
      {/* Content — top padding on mobile for fixed header; no padding on desktop */}
      <main
        id="main-content"
        tabIndex={-1}
        className="min-w-0 flex-1 pt-14 outline-none lg:pt-0"
      >
        <div className="border-b border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-6">
          Cross-chain lending is in development. Current lending views use the
          existing Stellar integration.{" "}
          <Link
            to="/legacy"
            className="font-medium text-primary underline underline-offset-2"
          >
            Manage Stellar positions
          </Link>
        </div>
        {children}
      </main>
    </div>
  )
}
