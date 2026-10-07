import { Link } from "react-router"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { AppLayout } from "../features/lending/components/layout/app-layout"

const TOPICS: Array<{ id: string; title: string; body: Array<string> }> = [
  {
    id: "where",
    title: "Where your money lives",
    body: [
      "Lending positions live on Base or Ethereum, in an execution account your EVM wallet owns.",
      "Your Stellar wallet sends and receives USDC. It never signs for the lending chain.",
    ],
  },
  {
    id: "debt",
    title: "Collateral and debt stay put",
    body: [
      "Collateral and debt stay on the lending chain. Sending borrowed USDC to Stellar doesn't move them.",
      "Each market (or Aave account) has its own risk. Positions elsewhere never add borrowing capacity.",
    ],
  },
  {
    id: "transit",
    title: "Liquidation can happen mid-transfer",
    body: [
      "Your debt is live as soon as a borrow confirms, even while USDC is on its way to Stellar.",
      "If prices move, the position can be liquidated during that time. Keep a margin.",
    ],
  },
  {
    id: "rates",
    title: "Rates move; fees don't count as APY",
    body: [
      "Supply and borrow rates are variable and change with market use.",
      "Bridge and network fees are one-time costs shown on the review screen, separate from the rate.",
    ],
  },
  {
    id: "bridge",
    title: "Transfers depend on Circle CCTP",
    body: [
      "USDC moves by burning on one chain and minting on the other after Circle attests the burn.",
      "Attestation usually takes minutes. Times and fees are estimates, not promises.",
    ],
  },
  {
    id: "cancel",
    title: "A burn can't be cancelled",
    body: [
      "Once the source transfer confirms, the USDC will be minted on the other side. Closing the app doesn't stop it.",
      "If the next step fails, your USDC waits in your execution account. Nothing is lost.",
    ],
  },
  {
    id: "recovery",
    title: "When something goes wrong",
    body: [
      "Open the operation in Activity. Each problem shows one recommended next step.",
      "Retries never repeat a confirmed burn or lending action. An attested transfer can be submitted by anyone, including you.",
      "Your EVM wallet can always act directly on your execution account, without Astrion.",
    ],
  },
]

export default function Page() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <header className="space-y-2">
          <StatusBadge tone="attention">Cross-chain alpha in development</StatusBadge>
          <h1 className="text-heading-page">Learn</h1>
          <p className="text-copy text-muted-foreground">What to know before lending or borrowing across chains.</p>
        </header>

        <nav aria-label="Topics">
          <ul className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="text-copy-sm rounded-md border border-border px-2.5 py-1 hover:border-primary/50">
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          {TOPICS.map((t) => (
            <section key={t.id} id={t.id} className="scroll-mt-20 space-y-2">
              <h2 className="text-heading-card">{t.title}</h2>
              <ul className="text-copy list-disc space-y-1 pl-5 text-foreground/85">
                {t.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-copy-sm text-muted-foreground">
          <Link to="/activity" className="text-primary underline-offset-4 hover:underline">
            Activity and recovery
          </Link>
          {" · "}
          <Link to="/legacy" className="text-primary underline-offset-4 hover:underline">
            Existing Stellar positions
          </Link>
          {" · "}
          <Link to="/brand" className="text-primary underline-offset-4 hover:underline">
            Brand resources
          </Link>
        </p>
      </div>
    </AppLayout>
  )
}
