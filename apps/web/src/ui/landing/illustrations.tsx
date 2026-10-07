import { CHAINS, PROTOCOLS } from "../../features/lending/lib/identity"
import type { ProtocolId } from "../../features/lending/lib/identity"

// Hero diagram: Stellar USDC travels through Circle CCTP to lending markets
// on Base/Ethereum and back home. Motion is dropped for reduced-motion users.
const MARKETS: Array<{ id: ProtocolId; y: number; color: string }> = [
  { id: "aave-v3", y: 96, color: "#9391F7" },
  { id: "morpho-blue", y: 210, color: "#2470FF" },
  { id: "compound-v3", y: 324, color: "#00D395" },
]

const OUT = (y: number) => `M118 210 C 220 210, 250 ${y}, 352 ${y}`
const HOME = "M352 96 C 300 20, 120 40, 92 172"

export function RouteIllustration() {
  return (
    <svg
      viewBox="0 0 520 420"
      role="img"
      aria-label="Illustration: USDC moves from Stellar through Circle CCTP into Aave, Morpho, or Compound on Base and Ethereum, and back to Stellar."
      className="h-auto w-full max-w-[520px] text-foreground"
    >
      <defs>
        <linearGradient id="ri-line" x1="0" x2="1">
          <stop offset="0%" stopColor="#6CB6FF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="ri-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Lending chains panel */}
      <rect x="330" y="40" width="176" height="340" rx="18" className="fill-card stroke-border" strokeWidth="1" />
      <text x="418" y="68" textAnchor="middle" className="fill-muted-foreground font-mono-num" fontSize="11" letterSpacing="1.5">
        BASE · ETHEREUM
      </text>

      {/* Return path to Stellar */}
      <path d={HOME} fill="none" stroke="url(#ri-line)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.7" />
      <text x="196" y="44" textAnchor="middle" className="fill-muted-foreground" fontSize="12">
        USDC back to Stellar
      </text>

      {/* Outbound paths */}
      {MARKETS.map((m) => (
        <path key={m.id} d={OUT(m.y)} fill="none" stroke="url(#ri-line)" strokeWidth="1.75" opacity="0.85" />
      ))}

      {/* Bridge pill */}
      <g transform="translate(236 210)">
        <rect x="-40" y="-15" width="80" height="30" rx="15" className="fill-background stroke-border" strokeWidth="1" />
        <text y="4.5" textAnchor="middle" className="fill-foreground font-mono-num" fontSize="12" fontWeight="600">
          CCTP
        </text>
      </g>

      {/* Stellar node */}
      <circle cx="80" cy="210" r="70" fill="url(#ri-glow)" />
      <circle cx="80" cy="210" r="38" className="fill-foreground" />
      <text x="80" y="215" textAnchor="middle" className="fill-background font-mono-num" fontSize="15" fontWeight="700">
        {CHAINS.stellar.mark.toUpperCase()}
      </text>
      <text x="80" y="272" textAnchor="middle" className="fill-foreground" fontSize="14" fontWeight="600">
        Stellar
      </text>
      <text x="80" y="290" textAnchor="middle" className="fill-muted-foreground font-mono-num" fontSize="12">
        USDC
      </text>

      {/* Protocol nodes */}
      {MARKETS.map((m) => (
        <g key={m.id} transform={`translate(352 ${m.y})`}>
          <rect x="0" y="-24" width="138" height="48" rx="12" className="fill-background stroke-border" strokeWidth="1" />
          <circle cx="24" cy="0" r="12" fill={m.color} opacity="0.18" />
          <circle cx="24" cy="0" r="5" fill={m.color} />
          <text x="44" y="5" className="fill-foreground" fontSize="14" fontWeight="600">
            {PROTOCOLS[m.id].label}
          </text>
        </g>
      ))}

      {/* Moving USDC */}
      <g className="motion-reduce:hidden">
        {MARKETS.map((m, i) => (
          <circle key={m.id} r="4.5" fill="#22D3EE">
            <animateMotion dur="3.6s" begin={`${i * 1.2}s`} repeatCount="indefinite" path={OUT(m.y)} />
          </circle>
        ))}
        <circle r="3.5" fill="#6CB6FF">
          <animateMotion dur="4.2s" begin="0.6s" repeatCount="indefinite" path={HOME} />
        </circle>
      </g>
    </svg>
  )
}

// Small line icons used by the flow strips and benefit tiles.
const ICONS = {
  wallet: "M3 7h15a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm0 0 2.5-3H17v3M16.5 13.5h.01",
  bridge: "M2 16h20M4 16V9m16 7V9M4 9c3 0 5 3 8 3s5-3 8-3M8 16v-3m8 3v-3",
  bank: "M3 10 12 4l9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  coins: "M9 7a5 3 0 1 0 0 .01M4 7v4c0 1.7 2.2 3 5 3s5-1.3 5-3V7m-1 6.5c.6.3 1.3.5 2 .5 2.8 0 5-1.3 5-3V7m-10 8v2c0 1.7 2.2 3 5 3s5-1.3 5-3v-4",
  home: "M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  gauge: "M4 18a8 8 0 1 1 16 0M12 18l4-6",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3",
  wallets: "M2 8h13v10H2zM6 8V5h13v10h-4M11.5 13h.01",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  wave: "M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
} as const

export type IconName = keyof typeof ICONS

export function LineIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-5"}
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

export function FlowStrip({
  steps,
  label,
}: {
  steps: Array<{ icon: IconName; text: string }>
  label: string
}) {
  return (
    <ol aria-label={label} className="flex items-start">
      {steps.map((step, i) => (
        <li key={step.text} className={i > 0 ? "flex flex-1 items-start" : "flex items-start"}>
          {i > 0 && (
            <span aria-hidden="true" className="mt-6 h-px flex-1 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
          )}
          <div className="flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-28">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <LineIcon name={step.icon} className="size-6" />
            </span>
            <span className="text-label leading-snug text-foreground">{step.text}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
