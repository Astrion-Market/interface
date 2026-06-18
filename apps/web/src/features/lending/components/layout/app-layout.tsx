import { AppSidebar } from "./app-sidebar"

type Props = {
  children: React.ReactNode
}

export function AppLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <AppSidebar />
      {/* Content — top padding on mobile for fixed header; no padding on desktop */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
