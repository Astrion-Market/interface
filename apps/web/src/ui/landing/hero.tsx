import { Link } from "react-router"
import { Button } from "@workspace/ui/components/button"
import { RouteIllustration } from "./illustrations"

function OrbitalBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ob-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6CB6FF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="ob-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft ambient glow centred on the right (where mockup sits) */}
      <ellipse cx="860" cy="310" rx="420" ry="340" fill="url(#ob-glow)" />

      {/* Outer orbital ring */}
      <ellipse
        cx="860" cy="310" rx="320" ry="320"
        stroke="url(#ob-grad)" strokeWidth="0.6" opacity="0.07"
      />

      {/* Tilted orbital A: main equatorial ring (matches logo motif) */}
      <ellipse
        cx="860" cy="310" rx="300" ry="110"
        stroke="url(#ob-grad)" strokeWidth="0.8" opacity="0.10"
        transform="rotate(-22 860 310)"
      />

      {/* Tilted orbital B */}
      <ellipse
        cx="860" cy="310" rx="220" ry="290"
        stroke="url(#ob-grad)" strokeWidth="0.6" opacity="0.06"
        transform="rotate(18 860 310)"
      />

      {/* Inner accent ring */}
      <ellipse
        cx="860" cy="310" rx="130" ry="50"
        stroke="url(#ob-grad)" strokeWidth="0.7" opacity="0.09"
        transform="rotate(-22 860 310)"
      />

      {/* Constellation connection lines */}
      <g stroke="url(#ob-grad)" strokeWidth="0.5" opacity="0.12" strokeLinecap="round">
        <line x1="860" y1="310" x2="630" y2="170" />
        <line x1="860" y1="310" x2="1050" y2="175" />
        <line x1="860" y1="310" x2="1000" y2="460" />
        <line x1="860" y1="310" x2="720" y2="430" />
        <line x1="630" y1="170" x2="1050" y2="175" />
      </g>

      {/* Constellation nodes: large 4-pointed stars */}
      {/* Top-right star */}
      <path
        d="M1050 175 L1052.6 182.8 L1060 175 L1052.6 167.2 Z
           M1050 175 L1042.2 172.4 L1050 165 L1057.8 172.4 Z"
        fill="url(#ob-grad)" opacity="0.45"
      />
      {/* Top-left star */}
      <path
        d="M630 170 L632.2 176.2 L638 170 L632.2 163.8 Z
           M630 170 L623.8 167.8 L630 162 L636.2 167.8 Z"
        fill="url(#ob-grad)" opacity="0.35"
      />
      {/* Bottom-right star */}
      <path
        d="M1000 460 L1001.8 465.4 L1007 460 L1001.8 454.6 Z
           M1000 460 L994.6 458.2 L1000 453 L1005.4 458.2 Z"
        fill="url(#ob-grad)" opacity="0.30"
      />

      {/* Small orbital nodes: circles */}
      <circle cx="860" cy="310" r="3.5" fill="url(#ob-grad)" opacity="0.55" />
      <circle cx="630" cy="170" r="2.2" fill="url(#ob-grad)" opacity="0.40" />
      <circle cx="1050" cy="175" r="1.8" fill="url(#ob-grad)" opacity="0.35" />
      <circle cx="1000" cy="460" r="1.6" fill="url(#ob-grad)" opacity="0.28" />
      <circle cx="720" cy="430" r="1.4" fill="url(#ob-grad)" opacity="0.25" />
      <circle cx="760" cy="175" r="1.2" fill="url(#ob-grad)" opacity="0.20" />
      <circle cx="980" cy="250" r="1.0" fill="url(#ob-grad)" opacity="0.18" />
      <circle cx="730" cy="390" r="0.9" fill="url(#ob-grad)" opacity="0.15" />

      {/* Faint far-field dots: left side */}
      <circle cx="180" cy="120" r="1.1" fill="#6CB6FF" opacity="0.08" />
      <circle cx="80"  cy="300" r="0.9" fill="#22D3EE" opacity="0.06" />
      <circle cx="240" cy="490" r="1.0" fill="#6CB6FF" opacity="0.07" />
      <circle cx="350" cy="200" r="0.8" fill="#22D3EE" opacity="0.05" />
    </svg>
  )
}

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
      <OrbitalBackground />

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left: copy */}
          <div>
            <span className="font-mono-num text-label-xs inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 uppercase text-muted-foreground backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" style={{ animation: "pulseDot 2.4s ease-in-out infinite" }} />
              In development · Testnet today
            </span>

            <h1 className="text-display-compact font-trading mt-6 text-foreground">
              Lend across chains.<br />
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(115deg, #6CB6FF 0%, #22D3EE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Bring your liquidity home.
              </span>
            </h1>

            <p className="text-copy mt-5 max-w-[460px] text-muted-foreground sm:text-[17px]">
              Lend into Aave, Morpho, and Compound from your Stellar wallet.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="default"
                className="h-11 gap-2 px-5 text-label"
                nativeButton={false}
                render={<Link to="/dashboard" />}
              >
                Open the app <span aria-hidden="true">→</span>
              </Button>
              <Button
                variant="outline"
                className="h-11 px-5 text-label"
                nativeButton={false}
                render={<a href="#how-it-works" />}
              >
                How it works
              </Button>
            </div>
          </div>

          {/* Right: route illustration */}
          <div className="flex justify-center lg:justify-end">
            <RouteIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}
