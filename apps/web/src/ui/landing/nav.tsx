import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { ConnectWalletButton } from "../../features/wallet/connect-wallet-button"
import { ThemeToggle } from "../theme-toggle"

function Logo() {
  return (
    <a
      href="/"
      className="flex cursor-pointer items-center gap-2.5 tracking-[-0.02em] transition-opacity hover:opacity-80"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 56 56"
        width="30"
        height="30"
        fill="none"
        className="pointer-events-none shrink-0"
      >
        <defs>
          <linearGradient id="lnl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6CB6FF" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <radialGradient id="lng" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(2 2)">
          <circle cx="26" cy="26" r="24" fill="url(#lng)" />
          <ellipse
            cx="26"
            cy="26"
            rx="20"
            ry="20"
            stroke="rgba(77,168,255,0.40)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="26"
            cy="26"
            rx="20"
            ry="8"
            stroke="url(#lnl)"
            strokeWidth="1.4"
            transform="rotate(-22 26 26)"
          />
          <path
            d="M11 18 L26 26 L41 14 M26 26 L34 40 M26 26 L16 36"
            stroke="url(#lnl)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <g fill="url(#lnl)">
            <path d="M41 7 L43.0 13.8 L49 15 L43.0 16.2 L41 23 L39.0 16.2 L33 15 L39.0 13.8 Z" />
            <path d="M11 13 L12.0 16.8 L15 18 L12.0 19.2 L11 23 L10.0 19.2 L7 18 L10.0 16.8 Z" />
            <circle cx="26" cy="26" r="2.8" />
            <path d="M34 37 L34.8 40.2 L37 41 L34.8 41.8 L34 45 L33.2 41.8 L31 41 L33.2 40.2 Z" />
            <circle cx="16" cy="36" r="1.5" />
            <circle cx="44" cy="32" r="1.3" opacity="0.8" />
          </g>
        </g>
      </svg>
      <span className="font-mono-num text-[17px] font-medium tracking-[0.02em] text-foreground">
        Astrion
      </span>
    </a>
  )
}

const NAV_LINKS = [
  { label: "Markets", href: "/markets" },
  { label: "Analytics", href: "/analytics" },
  { label: "Governance", href: "/governance" },
  { label: "Docs", href: "#" },
]

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-[13.5px] font-normal text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectWalletButton placement="header" />
          <Button
            variant="default"
            className="hidden h-[38px] gap-2 px-4 text-[13.5px] sm:inline-flex"
            onClick={() => {
              window.location.href = "/dashboard"
            }}
          >
            Launch app
            <span>→</span>
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="block rounded py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <ConnectWalletButton placement="sidebar" />
          </div>
          <Button
            variant="default"
            className="mt-3 w-full gap-2"
            onClick={() => {
              window.location.href = "/dashboard"
            }}
          >
            Launch app →
          </Button>
        </div>
      )}
    </nav>
  )
}
