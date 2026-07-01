import { Link } from "@tanstack/react-router"

function AstrionMark({ size = 32 }: { size?: number }) {
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
        <linearGradient id="nf-nl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6CB6FF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="nf-ng" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(2 2)">
        <circle cx="26" cy="26" r="24" fill="url(#nf-ng)" />
        <ellipse cx="26" cy="26" rx="20" ry="20" stroke="rgba(77,168,255,0.40)" strokeWidth="1.2" />
        <ellipse cx="26" cy="26" rx="20" ry="8" stroke="url(#nf-nl)" strokeWidth="1.4" transform="rotate(-22 26 26)" />
        <path d="M11 18 L26 26 L41 14 M26 26 L34 40 M26 26 L16 36" stroke="url(#nf-nl)" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
        <g fill="url(#nf-nl)">
          <path d="M41 7 L43.0 13.8 L49 15 L43.0 16.2 L41 23 L39.0 16.2 L33 15 L39.0 13.8 Z" />
          <path d="M11 13 L12.0 16.8 L15 18 L12.0 19.2 L11 23 L10.0 19.2 L7 18 L10.0 16.8 Z" />
          <circle cx="26" cy="26" r="2.8" />
          <path d="M34 37 L34.8 40.2 L37 41 L34.8 41.8 L34 45 L33.2 41.8 L31 41 L33.2 40.2 Z" />
          <circle cx="16" cy="36" r="1.5" />
          <circle cx="44" cy="32" r="1.3" opacity="0.8" />
        </g>
      </g>
    </svg>
  )
}

const LINKS = [
  {
    label: "Go home",
    to: "/",
    desc: "Return to the Astrion landing page",
    tone: "bg-[#6CB6FF]",
  },
  {
    label: "Go to markets",
    to: "/markets",
    desc: "Browse supply and borrow markets",
    tone: "bg-[#2DD4BF]",
  },
  {
    label: "Open trade",
    to: "/trade",
    desc: "Swap and route supported assets",
    tone: "bg-[#F59E0B]",
  },
  {
    label: "View dashboard",
    to: "/dashboard",
    desc: "Check balances and active positions",
    tone: "bg-[#A78BFA]",
  },
] as const

export function NotFound() {
  return (
    <main className="font-trading relative min-h-svh overflow-hidden bg-background text-foreground antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/80 via-cyan-300/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-36 h-[430px] w-[430px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(108,182,255,0.18) 0%, rgba(45,212,191,0.10) 38%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-24 top-44 h-28 w-28 rotate-12 border border-primary/15"
      />

      <div className="relative flex min-h-svh flex-col items-start justify-start px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12">
        <Link
          to="/"
          aria-label="Go to Astrion home"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <AstrionMark />
          <span className="font-mono-num text-[17px] font-medium tracking-normal text-foreground">
            Astrion
          </span>
        </Link>

        <section className="mt-12 w-full max-w-[640px] sm:mt-16 lg:mt-20">
          <div className="font-mono-num inline-flex h-7 items-center gap-2 rounded-md border border-border/80 bg-background/75 px-2.5 text-[11px] uppercase tracking-normal text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            Route missing
          </div>

          <p className="mt-7 font-mono-num text-[13px] uppercase tracking-normal text-muted-foreground">
            Error 404
          </p>

          <h1 className="mt-3 max-w-[560px] text-[54px] font-semibold leading-[0.94] tracking-normal text-foreground sm:text-[72px] lg:text-[88px]">
            Page not found.
          </h1>

          <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-muted-foreground sm:text-base">
            The page you opened is not here anymore, or the URL is a little off.
            Pick a useful place to continue.
          </p>

          <nav
            aria-label="404 quick links"
            className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group min-h-[82px] rounded-lg border border-border bg-background/70 p-4 shadow-sm backdrop-blur transition-colors hover:border-primary/50 hover:bg-muted/25"
              >
                <span className="flex h-full items-start justify-between gap-4">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[14px] font-medium text-foreground">
                      <span className={`h-2 w-2 rounded-full ${link.tone}`} />
                      {link.label}
                    </span>
                    <span className="mt-2 block text-[12px] leading-5 text-muted-foreground">
                      {link.desc}
                    </span>
                  </span>
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:border-primary/60 group-hover:text-primary">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
            <span>Need another path?</span>
            <Link
              to="/earn"
              className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Go to earn
            </Link>
            <Link
              to="/portfolio"
              className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Go to portfolio
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
