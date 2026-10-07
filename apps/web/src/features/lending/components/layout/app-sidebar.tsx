import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { ConnectWalletButton } from "../../../wallet/connect-wallet-button"
import { EvmConnectButton } from "../../../wallet/evm/evm-connect-button"
import { PRIMARY_NAV_ITEMS } from "../../navigation"
import { IS_STELLAR_TESTNET, STELLAR_NETWORK_LABEL } from "../../lib/network"

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

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              activeOptions={{ includeSearch: false }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{
                className: "bg-accent font-medium text-foreground",
                "aria-current": "page",
              }}
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d={item.iconPath} />
              </svg>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <nav
        aria-label="Stellar and settings"
        className="space-y-1 border-t border-border px-3 py-3 text-[12px]"
      >
        <Link
          to="/legacy"
          onClick={onNavClick}
          className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          activeProps={{
            className: "bg-accent text-foreground",
            "aria-current": "page",
          }}
        >
          Stellar positions
        </Link>
        {IS_STELLAR_TESTNET && (
          <Link
            to="/faucet"
            onClick={onNavClick}
            className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            activeProps={{
              className: "bg-accent text-foreground",
              "aria-current": "page",
            }}
          >
            Testnet faucet
          </Link>
        )}
        <Link
          to="/settings"
          onClick={onNavClick}
          className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          activeProps={{
            className: "bg-accent text-foreground",
            "aria-current": "page",
          }}
        >
          Settings
        </Link>
      </nav>
      <div className="space-y-2 border-t border-border px-3 py-3">
        <p className="px-2 text-[11px] text-muted-foreground">
          {STELLAR_NETWORK_LABEL}
        </p>
        <ConnectWalletButton placement="sidebar" />
        <EvmConnectButton />
      </div>
    </>
  )
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false)
    }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <Logo />
        </div>
        <SidebarContent />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <ConnectWalletButton placement="mobile" />
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </SheetTrigger>
          </div>
        </div>
        <SheetContent side="left" className="w-72 max-w-[85vw]">
          <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
            <Logo />
          </div>
          <SheetTitle className="sr-only">Astrion navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Markets, positions, activity, and Stellar account tools.
          </SheetDescription>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
