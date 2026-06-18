import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { ConnectWalletButton } from "../../../wallet/connect-wallet-button"

type NavItem = {
  label: string
  to?:
    | "/dashboard"
    | "/markets"
    | "/portfolio"
    | "/isolated-markets"
    | "/analytics"
    | "/faucet"
    | "/governance"
    | "/settings"
    | "/brand"
  icon: React.ReactNode
  comingSoon?: boolean
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Markets",
    to: "/markets",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    to: "/portfolio",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    label: "Isolated Markets",
    to: "/isolated-markets",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Governance",
    to: "/governance",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    label: "Faucet",
    to: "/faucet",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2v6" />
        <path d="M8 8h8" />
        <path d="M7 14a5 5 0 0 0 10 0c0-3-5-8-5-8s-5 5-5 8z" />
      </svg>
    ),
  },
  {
    label: "Docs",
    comingSoon: true,
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Brand",
    to: "/brand",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
]

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 56 56"
        width="28"
        height="28"
        fill="none"
      >
        <defs>
          <linearGradient id="sl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6CB6FF" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <radialGradient id="sg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(2 2)">
          <circle cx="26" cy="26" r="24" fill="url(#sg)" />
          <ellipse
            cx="26"
            cy="26"
            rx="20"
            ry="20"
            stroke="rgba(77,168,255,0.40)"
            strokeWidth="1.2"
            fill="none"
          />
          <ellipse
            cx="26"
            cy="26"
            rx="20"
            ry="8"
            stroke="url(#sl)"
            strokeWidth="1.4"
            fill="none"
            transform="rotate(-22 26 26)"
          />
          <path
            d="M11 18 L26 26 L41 14 M26 26 L34 40 M26 26 L16 36"
            stroke="url(#sl)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <g fill="url(#sl)">
            <path d="M41 7 L43.0 13.8 L49 15 L43.0 16.2 L41 23 L39.0 16.2 L33 15 L39.0 13.8 Z" />
            <path d="M11 13 L12.0 16.8 L15 18 L12.0 19.2 L11 23 L10.0 19.2 L7 18 L10.0 16.8 Z" />
            <circle cx="26" cy="26" r="2.8" />
            <path d="M34 37 L34.8 40.2 L37 41 L34.8 41.8 L34 45 L33.2 41.8 L31 41 L33.2 40.2 Z" />
            <circle cx="16" cy="36" r="1.5" />
            <circle cx="44" cy="32" r="1.3" opacity="0.8" />
          </g>
        </g>
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Astrion
      </span>
    </Link>
  )
}

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  if (item.comingSoon) {
    return (
      <button
        onClick={() => {
          toast.info("Coming soon")
          onClick?.()
        }}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
      >
        <span className="shrink-0 opacity-60">{item.icon}</span>
        {item.label}
      </button>
    )
  }
  return (
    <Link
      to={item.to!}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{
        className:
          "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] bg-accent text-foreground font-medium",
      }}
    >
      <span className="shrink-0">{item.icon}</span>
      {item.label}
    </Link>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} onClick={onNavClick} />
          ))}
        </div>
      </nav>

      {/* Bottom: wallet + network */}
      <div className="space-y-1 border-t border-border px-2 py-3">
        <div className="flex items-center gap-2 rounded-md px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-muted-foreground">
            Stellar Testnet
          </span>
        </div>
        <ConnectWalletButton placement="sidebar" />
        <Link
          to="/settings"
          onClick={onNavClick}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          activeProps={{
            className:
              "flex w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-[12px] font-medium text-foreground",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </Link>
      </div>
    </>
  )
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Logo />
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <ConnectWalletButton placement="mobile" />
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-background shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo />
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
