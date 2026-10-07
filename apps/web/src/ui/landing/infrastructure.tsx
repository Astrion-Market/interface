const RISKS = [
  {
    title: "Alpha software",
    body: "Cross-chain routes are in development. Each route goes through testnet and fork testing first, and mainnet routes need an independent security review.",
  },
  {
    title: "Two wallets",
    body: "The alpha needs a Stellar wallet and an EVM wallet. Managing a position with Stellar signatures alone is a separate, later project.",
  },
  {
    title: "Positions live on the lending chain",
    body: "Collateral and debt stay on Base or Ethereum. Liquidation can happen there while a transfer to Stellar is still pending.",
  },
  {
    title: "Transfers take time",
    body: "Bridge transfers wait for attestation. Times and fees vary; Astrion shows estimates before you sign, not promises.",
  },
  {
    title: "Rates change",
    body: "Supply and borrow rates are variable. A one-time bridge or network fee is shown separately and is not part of the APY.",
  },
  {
    title: "Smart contract risk",
    body: "You rely on the lending protocol, Circle CCTP, and Astrion's own contracts. Any of them can fail or be paused.",
  },
]

export function Risks() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 max-w-[640px]">
          <p className="font-mono-num text-label-xs uppercase text-muted-foreground">
            Before you start
          </p>
          <h2 className="text-heading-section mt-2 text-foreground">
            What to know about the risks.
          </h2>
          <p className="text-copy mt-4 text-muted-foreground">
            Cross-chain lending adds steps, and each step adds risk. Astrion
            keeps them visible instead of hiding them behind one button.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RISKS.map(({ title, body }) => (
            <li key={title} className="rounded-lg border border-border p-5">
              <h3 className="text-label text-foreground">{title}</h3>
              <p className="text-copy-sm mt-1.5 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
