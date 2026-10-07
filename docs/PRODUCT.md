# Cross-chain lending product scope

Status: interface direction established on 2026-10-07. Cross-chain routes below
are planned, not implemented or enabled by this documentation change.

## Purpose

Give Stellar users a clear way to access lending markets on Base and Ethereum,
receive borrowed USDC on Stellar, and manage repayment and withdrawal. The product
centers on discovering a market, understanding collateral and costs, signing with
the right wallet, and following each transaction through completion or recovery.

The first release target is Base with Aave V3, followed by Morpho Blue and
Compound III. Maintainers confirmed Compound III as the third integration on
2026-10-07. Ethereum follows the Base integration gates. Protocol and chain support is always specific to a
market, asset, action, and environment.

## Current capability

The app already contains Stellar Wallets Kit connection/signing and Soroban
isolated-market readers and writes. The configured lending environment defaults
to Stellar testnet, with custom test assets and a mock oracle. Existing landing
and feature screens still contain the earlier core/isolated product language and
some illustrative data.

There is no implemented cross-chain route, EVM wallet session, or execution
integration with these three EVM protocols in the current interface. This source
inventory does not assert that a configured testnet deployment is live or that an
existing screen has passed a production readiness review.

## Capability matrix

All six combinations below are **planned**. The status describes Astrion's
integration, not whether the external protocol exists on the chain. Individual
market addresses, parameters, and supported actions require verification.

| Protocol/version | Execution chain | Proposed lending product                            | Proposed borrowing product                    | Astrion status            |
| ---------------- | --------------- | --------------------------------------------------- | --------------------------------------------- | ------------------------- |
| Aave V3          | Base            | Supply native USDC to an approved reserve           | Borrow USDC against approved collateral       | Planned first alpha route |
| Morpho Blue      | Base            | Supply USDC as the loan asset in an approved market | Post that market's collateral and borrow USDC | Planned after first route |
| Compound III     | Base            | Supply native USDC to an approved USDC-base Comet   | Post eligible collateral and borrow base USDC | Planned after first route |
| Aave V3          | Ethereum        | Supply native USDC to an approved reserve           | Borrow USDC against approved collateral       | Planned after Base gates  |
| Morpho Blue      | Ethereum        | Supply USDC as the loan asset in an approved market | Post that market's collateral and borrow USDC | Planned after Base gates  |
| Compound III     | Ethereum        | Supply native USDC to an approved USDC-base Comet   | Post eligible collateral and borrow base USDC | Planned after Base gates  |

Version scope is intentional: Aave V4, Morpho vault supply, Morpho fixed-rate
products, and Compound V2 are separate integration decisions. Discovery APIs must
not automatically enable a market returned in a search result. The official
[Aave](https://aave.com/docs/resources/addresses),
[Morpho](https://docs.morpho.org/developers/contracts/addresses/), and
[Compound](https://docs.compound.finance/#networks) deployment registries are
inputs to verification, not a substitute for it.

### Route and action scope

The following applies to each approved execution chain and protocol combination:

| Journey             | Source and destination                                          | Execution and wallet requirement                                    | Completion evidence                                           |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| Lend from Stellar   | Stellar native USDC → Base/Ethereum account → lending market    | Stellar transfer signature plus EVM authorization to supply         | Confirmed destination supply position                         |
| Borrow to Stellar   | Collateral on Base/Ethereum → USDC debt there → USDC on Stellar | EVM collateral/borrow authorization and a valid Stellar recipient   | Confirmed debt position and separate Stellar delivery receipt |
| Repay from Stellar  | Stellar native USDC → account holding EVM debt → repayment      | Stellar transfer signature plus EVM repayment authorization         | Refreshed protocol debt after confirmed repayment             |
| Withdraw to Stellar | EVM supply position → USDC on EVM → Stellar                     | EVM withdrawal/transfer authorization and a valid Stellar recipient | Confirmed withdrawal and separate Stellar delivery receipt    |
| Start on EVM        | Existing EVM collateral or supply → USDC on Stellar             | EVM owner authorization; no preceding Stellar deposit required      | The same borrow/withdraw and delivery checks                  |

These journeys are targets, not currently available actions. Returning USDC to
Stellar does not move collateral or debt. Depositing into a Stellar-native lending
protocol from EVM is a future destination-adapter decision.

## Wallets, collateral, and transport

The planned initial alpha requires a Stellar wallet and a user-controlled EVM
wallet. The EVM wallet owns the proposed account containing the lending position.
Show required signers and account addresses before a source transfer. A bridge or
a linked address does not authorize a later borrow or withdrawal.

Users starting with only Stellar USDC can use the planned lending flow. The
initial borrowing flow requires eligible collateral already held on the EVM
chain. Converting Stellar USDC into a different collateral asset needs an explicit
swap, quote, and separate approval of market exposure; it is outside the initial
alpha. XLM is not automatically eligible EVM collateral.

Protocol behavior must remain visible:

- Aave collateral enablement and available borrowing depend on the reserve and
  account configuration. Support specific risk modes only after integration
  checks. [Aave Pool operations](https://aave.com/docs/aave-v3/smart-contracts/pool).
- Morpho Blue tracks loan supply separately from collateral and debt for each
  market. Supplying the loan asset does not create collateral.
  [Morpho Blue model](https://docs.morpho.org/learn/concepts/blue/).
- Compound III nets base supply against base debt; separate collateral earns no
  supply interest. The minimum borrow and collateral constraints belong to the
  selected Comet. [Compound collateral model](https://docs.compound.finance/collateral-and-borrowing/).

Circle CCTP is the selected transport direction for native USDC. Stellar documents
CCTP support, and Circle lists Stellar, Base, and Ethereum. Astrion must still
implement and verify its own routes, gas handling, and recovery. No transfer time
or fee is guaranteed here. [Stellar CCTP guide](https://developers.stellar.org/docs/tokens/cross-chain-transfers),
[Circle chain capabilities](https://developers.circle.com/cctp/concepts/supported-chains-and-domains).

## Experience requirements

1. Show the funding chain, lending chain, protocol/market, receiving chain, and
   position owner before signing. State where collateral and debt remain.
2. Separate supplied assets, posted collateral, debt, wallet balances, and funds
   in transit. Never count the same funds twice or merge independent positions
   into a global borrowing allowance.
3. Identify each required signature, fee currency, gas payer, quote expiry, and
   minimum result where applicable. Keep APR/APY separate from one-time costs
   and incentive estimates; timestamp market data.
4. Use confirmed destination state to report action completion. A successful
   borrow with pending payout still has live debt and liquidation exposure.
5. Preserve operation progress through reloads and disconnects. Offer the next
   correct action for a delayed transfer or failed protocol action.
6. Distinguish missing, stale, partial, and zero data. A failed debt read must
   never imply that a user has no debt or is safe.
7. Preserve access to existing positions during navigation changes. Reuse the
   app's themes and components, with readable mobile layouts and keyboard access.

## Delivery stages

| Stage                | Interface outcome                                                | Evidence needed to advance                                                                       |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Direction            | README, scope, and architecture aligned                          | Explicit current/target capability boundary; this documentation increment                        |
| Discovery foundation | Navigation, visual primitives, revised landing, scoped models    | Labeled fixtures, accessible screens, network-safe query identities                              |
| Transport alpha      | Both wallets, route preflight, quote review, operation tracking  | Verified canonical-USDC transfers both ways on testnets and owner-controlled destination         |
| Lending alpha        | Aave Base supply/borrow/repay/withdraw, then additional adapters | Per-action tests, protocol fork evidence, clearly identified testnet components, recovery drills |
| Reviewed pilot       | Approved Base mainnet routes with limits and monitoring          | Reviewed contracts, reconciled positions/receipts, direct owner exits, operational readiness     |
| Expanded release     | Approved Ethereum and additional protocol routes                 | Equivalent release gates per route, measured fees, maintained deployment records                 |

Documentation, a visual mock, a testnet transfer, a fork test, and a mainnet
transaction are different evidence. Never combine separate demonstrations into a
claim that a complete production lifecycle has run. Contracts/API work is a
dependency for write-enabled stages; its implementation is outside this interface
increment.

The next funding wave can support integration completion, recovery, independent
review, and staged rollout. Dates and award terms remain unspecified. Publish
deliverables and verification results rather than projected TVL or raw commit
counts. Naming a funding program or protocol does not imply sponsorship.

## Deferred work and open decisions

- Confirm the exact approved markets, liquidity requirements, and risk modes on
  each execution chain.
- Reconcile the proposed account ownership, transaction schemas, and recovery
  API with the contracts implementation before enabling writes.
- Set route limits, gas sponsorship policy, application fees if any, operating
  ownership, and independent review scope before a mainnet pilot.
- Stellar-only authorization needs a separate account/messaging design and
  security review. It is not included in the dual-wallet alpha completion claim.
- Additional collateral bridges, explicit collateral swaps, curated vaults, and
  Stellar-native lending destinations need their own acceptance criteria.
- Trading, token rewards, referrals, and governance are outside this lending
  revamp's initial scope, although their existing screens remain in the code.

Public copy should focus on access and usability. Existing Stellar lending
projects include [Blend](https://docs.blend.capital/); liquidity comparisons need
dated evidence. Avoid blanket claims of absent competition, guaranteed safety,
instant transfers, highest yield, or live integrations without supporting data.
