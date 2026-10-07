import { Button } from "@workspace/ui/components/button"
import { EmptyState, ErrorState } from "@workspace/ui/components/state-panel"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { StepTimeline } from "@workspace/ui/components/step-timeline"
import { ThemeToggle } from "../../../../ui/theme-toggle"
import { convertDecimals } from "../../lib/amounts"
import { CHAIN_IDS, PROTOCOL_IDS } from "../../lib/identity"
import { AddressText } from "./address-text"
import { AmountList, AmountRow } from "./amount-row"
import { DataFreshness } from "./data-freshness"
import { ChainBadge, ProtocolBadge } from "./identity-badge"
import { RiskStatus } from "./risk-status"
import { RouteSummary } from "./route-summary"
import type { TimelineStep } from "@workspace/ui/components/step-timeline"

// Every value on this page is a fixture for design review. Nothing here is
// read from a chain, and none of it describes a live market or position.

const NOW = Date.parse("2026-10-07T12:00:00Z")
const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000)

const IDENTIFIERS = [
  {
    label: "Stellar account",
    value: "GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ",
  },
  {
    label: "Soroban contract",
    value: "CCMO7GBSI5NNSU4DGTW4X2G6EEVIECQABIGKIUR55YRJ4VVMYN2ODSYL",
  },
  { label: "EVM address", value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
  {
    label: "Morpho market ID",
    value: "0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836",
  },
]

// 1,250.1234567 USDC on Stellar (7 decimals) bridged at CCTP's 6 decimals.
const STELLAR_SEND = 12_501_234_567n
const BRIDGED = convertDecimals(STELLAR_SEND, 7, 6)

const BORROW_STEPS: Array<TimelineStep> = [
  {
    id: "authorize",
    label: "Authorize borrow",
    description: "EVM wallet signs the borrow on Aave V3 on Base.",
    status: "complete",
  },
  {
    id: "borrow",
    label: "Borrow opened on Base",
    description: "Debt and collateral stay on Base.",
    status: "complete",
  },
  {
    id: "burn",
    label: "Send USDC to Stellar",
    description: "Borrow opened; transfer to Stellar pending. Your debt is live and accrues interest.",
    status: "current",
    detail: <StatusBadge tone="pending">Waiting for attestation</StatusBadge>,
  },
  {
    id: "mint",
    label: "Receive on Stellar",
    description: "USDC arrives at the Stellar recipient you confirmed.",
    status: "pending",
  },
]

const RECOVERY_STEPS: Array<TimelineStep> = [
  { id: "sign", label: "Stellar transfer signed", status: "complete" },
  { id: "attest", label: "Bridge attestation", status: "complete" },
  {
    id: "supply",
    label: "Supply on Aave V3",
    description: "The market rejected the supply. Your USDC is in your Base account.",
    status: "failed",
    detail: (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline">
          Retry supply
        </Button>
        <Button size="sm" variant="ghost">
          Return USDC to Stellar
        </Button>
      </div>
    ),
  },
  { id: "return", label: "Return transfer", status: "skipped" },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="text-heading-card text-foreground">{title}</h2>
      {description && (
        <p className="text-copy-sm mt-1 max-w-prose text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function ReviewCard() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-heading-card">Review: lend USDC</h3>
        <StatusBadge tone="neutral">Example</StatusBadge>
      </div>
      <RouteSummary
        legs={[
          { kind: "origin", chain: "stellar", asset: "USDC" },
          { kind: "destination", chain: "base", protocol: "aave-v3", action: "Lend" },
        ]}
        note="Lending has no return transfer. Supply starts earning after it is confirmed on Base, not while bridging."
      />
      <AmountList>
        <AmountRow label="You send" raw={STELLAR_SEND} decimals={7} symbol="USDC" chain="stellar" emphasis />
        <AmountRow
          label="Bridged"
          hint="CCTP uses six decimals"
          raw={BRIDGED.amount}
          decimals={6}
          symbol="USDC"
          chain="base"
        />
        <AmountRow
          label="Stays in your Stellar wallet"
          hint="Below six-decimal precision"
          raw={BRIDGED.remainder}
          decimals={7}
          symbol="USDC"
        />
      </AmountList>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DataFreshness updatedAt={minutesAgo(1)} source="Aave" now={NOW} />
        <Button>Continue</Button>
      </div>
    </div>
  )
}

export function PrimitivesGallery() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label-xs text-muted-foreground uppercase">Design review</p>
          <h1 className="text-heading-page mt-1">Cross-chain lending primitives</h1>
          <p className="text-copy-sm mt-2 max-w-prose text-muted-foreground">
            Fixture data only. Check each section in light and dark themes, at phone
            width, and with the keyboard (Tab through every control).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-copy-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </header>

      <Section
        title="Typography and spacing"
        description="Use these text styles instead of ad hoc sizes. Numbers use tabular mono figures. Spacing follows the 4px Tailwind scale: 2 inside controls, 3 to 4 between related items, 6 to 8 between sections."
      >
        <div className="space-y-3">
          <p className="text-heading-page">text-heading-page: Markets</p>
          <p className="text-heading-card">text-heading-card: Aave V3 on Base</p>
          <p className="text-copy">text-copy: Supply earns the market&apos;s variable rate after destination execution.</p>
          <p className="text-copy-sm text-muted-foreground">text-copy-sm: Secondary explanations and hints.</p>
          <p className="text-label">text-label: Field and row labels</p>
          <p className="text-label-xs text-muted-foreground uppercase">text-label-xs: Eyebrows</p>
          <p className="font-mono-num text-[15px]">font-mono-num: 1,250.1234567 USDC</p>
          <div className="flex items-end gap-3 pt-2" aria-label="Spacing scale">
            {[1, 2, 3, 4, 6, 8].map((step) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <span className="block bg-primary/60" style={{ width: step * 4, height: step * 4 }} />
                <span className="font-mono-num text-[11px] text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Status"
        description="Every tone pairs color with a distinct icon shape and a text label."
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Confirmed</StatusBadge>
          <StatusBadge tone="attention">Needs attention</StatusBadge>
          <StatusBadge tone="risk">Action required</StatusBadge>
          <StatusBadge tone="pending">Pending</StatusBadge>
          <StatusBadge tone="neutral">Not started</StatusBadge>
        </div>
      </Section>

      <Section title="Chain and protocol identity" description="Marks are decorative; the name is always written out.">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {CHAIN_IDS.map((chain) => (
            <ChainBadge key={chain} chain={chain} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {PROTOCOL_IDS.map((protocol) => (
            <ProtocolBadge key={protocol} protocol={protocol} chain="base" />
          ))}
        </div>
      </Section>

      <Section
        title="Route summary"
        description="Shown above every review screen: origin, lending destination, and where funds are received."
      >
        <div className="space-y-4">
          <RouteSummary
            legs={[
              { kind: "origin", chain: "stellar", asset: "USDC" },
              { kind: "destination", chain: "base", protocol: "aave-v3", action: "Lend" },
            ]}
            note="Lend from Stellar: no return leg."
          />
          <RouteSummary
            legs={[
              { kind: "origin", chain: "base", asset: "cbETH collateral" },
              { kind: "destination", chain: "base", protocol: "morpho-blue", action: "Borrow" },
              { kind: "receive", chain: "stellar", asset: "USDC" },
            ]}
            note="Collateral and debt remain on Base. Liquidation can happen while delivery to Stellar is pending."
          />
        </div>
      </Section>

      <Section
        title="Amounts"
        description="Exact integer formatting. Seven-decimal Stellar and six-decimal EVM amounts are never rounded through floating point."
      >
        <AmountList className="max-w-xl">
          <AmountRow label="Stellar balance" raw={98_765_432_101_234_567n} decimals={7} symbol="USDC" chain="stellar" />
          <AmountRow label="Base balance" raw={4_000_000_000_001n} decimals={6} symbol="USDC" chain="base" />
          <AmountRow label="Smallest Stellar unit" raw={1n} decimals={7} symbol="USDC" />
          <AmountRow label="Shown to 2 places" hint="Ellipsis means digits are hidden" raw={1_999_999n} decimals={6} symbol="USDC" maxFractionDigits={2} />
          <AmountRow label="Debt" hint="Read failed: not shown as zero" raw={null} decimals={6} symbol="USDC" />
        </AmountList>
      </Section>

      <Section title="Long identifiers" description="Shortened in place; the full value is in the accessible name and one button press away.">
        <dl className="grid gap-3">
          {IDENTIFIERS.map(({ label, value }) => (
            <div key={label} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-copy-sm text-muted-foreground">{label}</dt>
              <dd className="min-w-0">
                <AddressText value={value} label={label.toLowerCase()} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Data freshness">
        <div className="flex flex-wrap gap-2">
          <DataFreshness updatedAt={minutesAgo(0.5)} source="Aave" now={NOW} />
          <DataFreshness updatedAt={minutesAgo(42)} source="Morpho" now={NOW} />
          <DataFreshness updatedAt={minutesAgo(3)} state="partial" now={NOW} />
          <DataFreshness updatedAt={minutesAgo(90)} state="unavailable" source="Compound" now={NOW} />
          <DataFreshness updatedAt={null} now={NOW} />
        </div>
      </Section>

      <Section title="Risk status" description="Protocol-native measures per position. Missing data is never shown as healthy.">
        <div className="grid gap-4 sm:grid-cols-2">
          <RiskStatus level="healthy" metric={{ label: "Health factor", value: "2.41" }} />
          <RiskStatus level="attention" metric={{ label: "Health factor", value: "1.32" }} reason="A 20% drop in cbETH would reach the liquidation threshold." />
          <RiskStatus level="at-risk" metric={{ label: "LLTV used", value: "94.1%" }} reason="Repay or add collateral now." />
          <RiskStatus level="unknown" reason="Debt could not be read from Base. Treat this position as at risk until it refreshes." />
        </div>
      </Section>

      <Section title="Pending-step timeline" description="Driven by observed chain events. The current step is marked for assistive technology.">
        <div className="grid gap-8 md:grid-cols-2">
          <StepTimeline steps={BORROW_STEPS} aria-label="Borrow to Stellar progress" />
          <StepTimeline steps={RECOVERY_STEPS} aria-label="Lend from Stellar progress" />
        </div>
      </Section>

      <Section title="Empty and error states">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            title="No positions yet"
            description="Positions appear here after a supply or borrow is confirmed on the lending chain."
            action={<Button variant="outline">Browse markets</Button>}
          />
          <ErrorState
            title="Couldn't load positions on Base"
            description="Your balances and debt may be incomplete. This is not the same as having no positions."
            action={<Button variant="outline">Try again</Button>}
          />
        </div>
      </Section>

      <Section title="Phone width" description="The same review card in a 360px frame.">
        <div className="max-w-[360px] rounded-2xl border border-dashed border-border p-2">
          <ReviewCard />
        </div>
      </Section>
    </div>
  )
}
