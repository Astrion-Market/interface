const FOOTER_COLS = [
  {
    heading: "Protocol",
    links: [
      { label: "Dashboard",  href: "/dashboard" },
      { label: "Markets",    href: "/markets" },
      { label: "Portfolio",  href: "/portfolio" },
      { label: "Analytics",  href: "/analytics" },
      { label: "Governance", href: "/governance" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Contracts",     href: "#" },
      { label: "SDK",           href: "#" },
      { label: "Bug Bounty",    href: "#" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Twitter / X", href: "#" },
      { label: "Discord",     href: "#" },
      { label: "Telegram",    href: "#" },
      { label: "Blog",        href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",    href: "#" },
      { label: "Careers",  href: "#" },
      { label: "Security", href: "#" },
      { label: "Terms",    href: "#" },
      { label: "Privacy",  href: "#" },
    ],
  },
]

const SOCIALS = [
  {
    label: "X",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4l16 16M20 4 4 20" />
      </svg>
    ),
  },
  {
    label: "Discord",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="12" r="1" /><circle cx="16" cy="12" r="1" />
        <path d="M5 7s2-2 7-2 7 2 7 2 2 5 2 9-3 5-3 5l-1-2s-2 1-5 1-5-1-5-1l-1 2s-3-1-3-5 2-9 2-9z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="m22 3-10 18-3-8-8-3 21-7z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.4c3-.3 6.2-1.5 6.2-6.7a5.2 5.2 0 0 0-1.4-3.6 5 5 0 0 0-.1-3.6s-1.2-.4-3.8 1.4a13 13 0 0 0-7 0C6.4 3 5.2 3.4 5.2 3.4a5 5 0 0 0-.1 3.6A5.2 5.2 0 0 0 3.7 10.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.4V22" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-border bg-muted/10 pt-12">

      {/* ── Nav columns + social icons ─────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-8 pb-12 sm:flex-row sm:items-start sm:justify-between">

            {/* Nav columns grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 sm:gap-x-12 lg:gap-x-16">
              {FOOTER_COLS.map(({ heading, links }) => (
                <div key={heading}>
                  <h5 className="font-mono-num mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground">
                    {heading}
                  </h5>
                  <ul className="space-y-0.5">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <a
                          href={href}
                          className="block py-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Social icons — top right */}
            <div className="flex shrink-0 items-start gap-2">
              {SOCIALS.map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {icon}
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Full-width wordmark ────────────────────────── */}
      {/*
        SVG approach: viewBox width == textLength, so the text always
        fills exactly 100% of the SVG. `width="100%"` + no max-width
        container = genuine full-viewport fill.
      */}
      <div className="select-none border-t border-border" aria-hidden="true">
        <svg
          viewBox="0 0 1000 168"
          width="100%"
          className="block"
          preserveAspectRatio="none"
        >
          <text
            x="0"
            y="152"
            fontSize="184"
            fontWeight="700"
            fontFamily="Geist Variable, sans-serif"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.65"
            opacity="0.07"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
          >
            Astrion
          </text>
        </svg>
      </div>

      {/* ── Bottom bar ─────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="font-mono-num flex flex-col gap-2 border-t border-border py-5 text-[10.5px] uppercase tracking-widest text-muted-foreground/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="h-[5px] w-[5px] rounded-full bg-emerald-400" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
              <span>All Systems Normal</span>
            </div>
            <span>© 2026 Astrion Labs — All rights reserved</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
