import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { PRIMARY_NAV_ITEMS } from "../features/lending/navigation"
import { ConnectWalletButton } from "../features/wallet/connect-wallet-button"
import { ThemeToggle } from "./theme-toggle"

function AstrionMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      width={size}
      height={size}
      fill="none"
      className="pointer-events-none shrink-0"
    >
      <defs>
        <linearGradient id="nl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6CB6FF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="ng" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(2 2)">
        <circle cx="26" cy="26" r="24" fill="url(#ng)" />
        {/* Main orbital ring */}
        <ellipse
          cx="26"
          cy="26"
          rx="20"
          ry="20"
          stroke="rgba(77,168,255,0.40)"
          strokeWidth="1.2"
        />
        {/* Tilted equatorial ring */}
        <ellipse
          cx="26"
          cy="26"
          rx="20"
          ry="8"
          stroke="url(#nl)"
          strokeWidth="1.4"
          transform="rotate(-22 26 26)"
        />
        {/* Constellation lines */}
        <path
          d="M11 18 L26 26 L41 14 M26 26 L34 40 M26 26 L16 36"
          stroke="url(#nl)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.9"
        />
        <g fill="url(#nl)">
          {/* Large 4-point star top-right */}
          <path d="M41 7 L43.0 13.8 L49 15 L43.0 16.2 L41 23 L39.0 16.2 L33 15 L39.0 13.8 Z" />
          {/* Small 4-point star top-left */}
          <path d="M11 13 L12.0 16.8 L15 18 L12.0 19.2 L11 23 L10.0 19.2 L7 18 L10.0 16.8 Z" />
          {/* Centre node */}
          <circle cx="26" cy="26" r="2.8" />
          {/* Bottom-right small star */}
          <path d="M34 37 L34.8 40.2 L37 41 L34.8 41.8 L34 45 L33.2 41.8 L31 41 L33.2 40.2 Z" />
          {/* Outer nodes */}
          <circle cx="16" cy="36" r="1.5" />
          <circle cx="44" cy="32" r="1.3" opacity="0.8" />
        </g>
      </g>
    </svg>
  )
}

function Logo() {
  return (
    <Link
      to="/"
      className="flex cursor-pointer items-center gap-2.5 tracking-[-0.02em] transition-opacity hover:opacity-80"
    >
      <AstrionMark size={30} />
      <span className="font-mono-num text-[17px] font-medium tracking-[0.02em] text-foreground">
        Astrion
      </span>
    </Link>
  )
}

export function Navbar({ variant }: { variant: "landing" | "app" }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isApp = variant === "app"

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false)
    }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div
        className={`mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 ${isApp ? "h-14" : "h-16 max-w-330"}`}
      >
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {PRIMARY_NAV_ITEMS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ includeSearch: false }}
              className="text-[13px] text-muted-foreground hover:text-foreground"
              activeProps={{
                className: "font-medium text-foreground",
                "aria-current": "page",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isApp ? (
            <ConnectWalletButton />
          ) : (
            <Link
              to="/dashboard"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Launch app
            </Link>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 max-w-[85vw] p-5">
              <SheetTitle>Astrion navigation</SheetTitle>
              <SheetDescription>
                Explore lending markets and manage positions.
              </SheetDescription>
              <nav aria-label="Primary" className="mt-4 flex flex-col gap-2">
                {PRIMARY_NAV_ITEMS.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    activeOptions={{ includeSearch: false }}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    activeProps={{
                      className: "bg-accent text-foreground",
                      "aria-current": "page",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <nav aria-label="Stellar" className="mt-3 border-t border-border pt-3">
                <Link
                  to="/legacy"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm text-muted-foreground"
                >
                  Stellar positions
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
