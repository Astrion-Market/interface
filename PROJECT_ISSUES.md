# Astrion Interface Backlog - 100 Review Issues

Generated from `implementations.md`, the current frontend, and the sibling `../contracts` Soroban workspace. The contract repo currently has production-ready oracle and interest-rate-model contracts, while `core-pool`, `market`, `market-factory`, and `liquidation-engine` are still scaffolded. These issues are written so they can be copied into GitHub issues after review.

## Wallet, Network, and App Foundation

### 001. Add Stellar wallet provider abstraction
- Area: Wallet
- Priority: P0
- Summary: Create a wallet provider layer that can connect, disconnect, expose account state, and sign Soroban transactions.
- Acceptance: Supports connected, disconnected, pending, and error states; exposes `publicKey`, `walletName`, and `signTransaction`; replaces dummy Connect buttons in the navbar and app sidebar.

### 002. Integrate Freighter wallet connection
- Area: Wallet
- Priority: P0
- Summary: Implement Freighter as the first wallet connector.
- Acceptance: Detects installed Freighter, opens connect flow, stores selected address in app state, and shows a helpful toast if Freighter is missing.

### 003. Add wallet connector registry
- Area: Wallet
- Priority: P1
- Summary: Build a registry so Freighter, xBull, Albedo, and future wallets can share one interface.
- Acceptance: Connectors implement a shared TypeScript interface; wallet modal lists available connectors; unavailable connectors are disabled with a reason.

### 004. Add wallet persistence and reconnect behavior
- Area: Wallet
- Priority: P1
- Summary: Persist the last selected wallet and attempt safe reconnect on page load.
- Acceptance: Reconnect never prompts unexpectedly; stale sessions clear cleanly; account state survives refresh when wallet still authorizes the app.

### 005. Add wallet account switch detection
- Area: Wallet
- Priority: P1
- Summary: Detect when the user switches accounts in their wallet.
- Acceptance: UI updates account display; React Query invalidates account-scoped queries; stale balances and positions are not shown as current.

### 006. Add wallet disconnect flow
- Area: Wallet
- Priority: P1
- Summary: Provide a full disconnect action in the wallet UI.
- Acceptance: Clears wallet state, account-scoped query cache, and persisted connector choice; routes remain usable in read-only mode.

### 007. Add wallet address display component
- Area: Wallet
- Priority: P2
- Summary: Create a reusable account display with shortened G-address, copy action, and explorer link.
- Acceptance: Appears in navbar/sidebar; copy uses existing toast style; explorer link respects selected network.

### 008. Add wallet connection modal
- Area: Wallet
- Priority: P1
- Summary: Replace simple Connect buttons with a modal listing wallet options.
- Acceptance: Modal handles connector selection, loading, missing wallet, and connection failure states; mobile and desktop layouts work.

### 009. Add network configuration model
- Area: Network
- Priority: P0
- Summary: Define typed network configs for Stellar testnet and mainnet.
- Acceptance: Config includes network passphrase, RPC URL, Horizon URL, explorer base URL, contract addresses, and token IDs.

### 010. Add Stellar testnet/mainnet toggle
- Area: Network
- Priority: P0
- Summary: Replace hard-coded "Stellar Mainnet" with a real selected-network control.
- Acceptance: Users can switch testnet/mainnet; selected network persists; switching invalidates network-scoped queries.

### 011. Gate mainnet actions behind deployment readiness
- Area: Network
- Priority: P0
- Summary: Prevent users from sending mainnet contract writes before contracts are configured and audited.
- Acceptance: Mainnet write buttons are disabled unless mainnet contract addresses are present and feature flag is enabled.

### 012. Add network mismatch warnings
- Area: Network
- Priority: P1
- Summary: Warn when connected wallet network does not match the selected app network.
- Acceptance: Write actions are blocked; user sees clear testnet/mainnet mismatch copy; read-only views still load from selected RPC.

### 013. Add typed contract address registry
- Area: Contracts
- Priority: P0
- Summary: Create a registry for core pool, oracle adapter, rate model, market factory, isolated markets, and liquidation engine addresses.
- Acceptance: Registry is keyed by network; addresses are validated; missing addresses return typed configuration errors.

### 014. Add deployment metadata file
- Area: Contracts
- Priority: P1
- Summary: Track contract IDs, WASM hashes, deployment ledger, and version per network.
- Acceptance: Frontend imports metadata from one source; metadata can represent undeployed contracts without crashing the app.

### 015. Add feature flags for scaffolded contract surfaces
- Area: App Foundation
- Priority: P0
- Summary: Gate UI that depends on scaffolded contracts.
- Acceptance: Supply, borrow, repay, withdraw, isolated markets, and liquidations can be enabled per network independently.

### 016. Add global app Zustand store
- Area: State
- Priority: P0
- Summary: Introduce Zustand for app-wide wallet, network, settings, and feature flag state.
- Acceptance: Dependency is added; store is typed; selectors avoid unnecessary rerenders; persisted slices use explicit versioning.

### 017. Migrate trade state to Zustand
- Area: State
- Priority: P1
- Summary: Replace `useTradeState` local `useState` plus localStorage with a Zustand slice.
- Acceptance: Existing trade behavior is preserved; storage key migration from `astrion-trade-state-v2` is handled; selectors are exported.

### 018. Add lending Zustand slice
- Area: State
- Priority: P1
- Summary: Store lending UI preferences such as selected market filters, collateral toggles, and modal state.
- Acceptance: Markets, portfolio, dashboard, and isolated markets share predictable state without prop drilling.

### 019. Add network-scoped React Query keys
- Area: Data
- Priority: P0
- Summary: Standardize query keys for wallet, network, contract, and market dimensions.
- Acceptance: Lending and trade keys include selected network; account queries include wallet address; switching network/account invalidates correctly.

### 020. Add app-level error boundary
- Area: App Foundation
- Priority: P1
- Summary: Add a route-safe error boundary for wallet, RPC, query, and render failures.
- Acceptance: Errors show recovery actions; error details are logged in development; users are not left with a blank page.

## Soroban Client and Contract Hooks

### 021. Add Stellar SDK dependencies
- Area: Soroban
- Priority: P0
- Summary: Add the official Stellar SDK package needed for Soroban RPC calls and transaction building.
- Acceptance: Package is installed; TypeScript can import Soroban RPC and transaction APIs; build remains green.

### 022. Create Soroban RPC client factory
- Area: Soroban
- Priority: P0
- Summary: Build a client factory from selected network config.
- Acceptance: Returns RPC client, network passphrase, and transaction helpers; testnet/mainnet endpoints are isolated.

### 023. Add account loading helper
- Area: Soroban
- Priority: P0
- Summary: Load source account data for transaction building.
- Acceptance: Handles unfunded testnet accounts, RPC failure, and stale sequence errors with typed errors.

### 024. Add transaction build helper
- Area: Soroban
- Priority: P0
- Summary: Build Soroban contract invocation transactions from contract ID, method, and args.
- Acceptance: Supports fee config, timeout, simulation, prepared transaction, wallet signing, and submission.

### 025. Add transaction polling helper
- Area: Soroban
- Priority: P0
- Summary: Poll submitted Soroban transactions until success, failure, or timeout.
- Acceptance: Returns final result XDR and status; shows retryable timeout errors; exposes transaction hash for explorer links.

### 026. Add contract argument encoding utilities
- Area: Soroban
- Priority: P0
- Summary: Create typed utilities for Address, i128, u32, u64, bool, BytesN, Vec, Map, and Symbol args.
- Acceptance: Encoding helpers are covered by unit tests; hooks do not hand-roll ScVal conversions.

### 027. Add contract result decoding utilities
- Area: Soroban
- Priority: P0
- Summary: Decode common Soroban results into TypeScript domain types.
- Acceptance: Supports `Result<T, E>` patterns, options, structs, maps, vectors, and i128 string conversion.

### 028. Add `useContractRead` hook
- Area: Hooks
- Priority: P0
- Summary: Implement a React Query hook for Soroban contract reads.
- Acceptance: Accepts network, contract ID, method, args, decoder, and query options; returns typed data; handles disabled queries when config is missing.

### 029. Add `useContractWrite` hook
- Area: Hooks
- Priority: P0
- Summary: Implement a mutation hook for Soroban writes with wallet signing.
- Acceptance: Uses React Query mutation; simulates, signs, submits, polls, and invalidates query keys; surfaces loading/success/error states.

### 030. Add toaster lifecycle to `useContractWrite`
- Area: Hooks
- Priority: P0
- Summary: Standardize Sonner toasts for transaction lifecycle.
- Acceptance: Shows pending wallet signature, submitting, confirmed, failed, and timed-out states; success toast links to network explorer.

### 031. Add write preflight validation
- Area: Hooks
- Priority: P0
- Summary: Block writes when wallet, network, contract address, args, or feature flags are invalid.
- Acceptance: Invalid writes never open wallet signing; user sees specific inline and toast feedback.

### 032. Add transaction error mapper
- Area: Soroban
- Priority: P1
- Summary: Map Soroban, wallet, RPC, and contract errors to user-friendly messages.
- Acceptance: Handles rejected signature, insufficient balance, missing trustline, bad auth, paused market, stale oracle, and health factor errors.

### 033. Add contract error enum mapping
- Area: Contracts
- Priority: P1
- Summary: Map Rust contract error codes from core pool, market, oracle adapter, and rate model to frontend messages.
- Acceptance: Known errors display specific messages; unknown errors include safe debug metadata in development.

### 034. Add transaction history store
- Area: Transactions
- Priority: P1
- Summary: Track recent user transactions locally.
- Acceptance: Stores hash, type, network, status, submitted time, and involved assets; renders after refresh.

### 035. Add transaction activity panel
- Area: Transactions
- Priority: P2
- Summary: Let users inspect pending and recent transactions.
- Acceptance: Panel shows status, explorer links, retry/poll action, and clear history action.

### 036. Add idempotent query invalidation strategy
- Area: Data
- Priority: P1
- Summary: Centralize which reads refresh after each write.
- Acceptance: Supply refreshes balances, market state, portfolio, and dashboard; borrow/repay/withdraw/liquidation invalidate correct scopes.

### 037. Add optimistic UI policy
- Area: Data
- Priority: P2
- Summary: Decide where optimistic updates are safe and where confirmation is required.
- Acceptance: Contract writes default to confirmed updates; low-risk UI state can update optimistically; policy is documented.

### 038. Add RPC health check query
- Area: Network
- Priority: P1
- Summary: Check selected RPC availability and ledger freshness.
- Acceptance: Displays degraded status; disables writes if RPC is stale; supports manual retry.

### 039. Add Soroban simulation display metadata
- Area: Transactions
- Priority: P2
- Summary: Capture simulated fee and resource usage before signing.
- Acceptance: Confirmation dialogs show estimated fee; failed simulation blocks signing with useful feedback.

### 040. Add generated contract clients workflow
- Area: Contracts
- Priority: P1
- Summary: Define whether to use generated bindings or handwritten method wrappers.
- Acceptance: Chosen approach is documented; generated files are ignored or committed intentionally; wrappers expose typed frontend methods.

## Lending Protocol Reads

### 041. Replace mock market data with core pool reads
- Area: Lending Data
- Priority: P0
- Summary: Load market config and state from `CorePool` when deployed.
- Acceptance: Markets page reads `get_market_config` and `get_market_state`; mock data is only fallback/dev mode.

### 042. Add market list read strategy
- Area: Lending Data
- Priority: P0
- Summary: The core pool TODO mentions MarketList enumeration; frontend needs a read path.
- Acceptance: Frontend can list core markets from contract, deployment metadata, or indexer; source of truth is documented.

### 043. Add WAD math formatting utilities
- Area: Lending Data
- Priority: P0
- Summary: Convert WAD-scaled i128 values into percentages, USD values, and token balances.
- Acceptance: Handles large integers safely; no floating math in protocol calculations; display rounding is consistent.

### 044. Add token metadata registry
- Area: Assets
- Priority: P0
- Summary: Define token symbol, name, decimals, icon, contract ID, and network availability.
- Acceptance: Asset icons, forms, tables, and contract args all use the same metadata.

### 045. Add Stellar token balance reads
- Area: Wallet
- Priority: P0
- Summary: Read connected wallet token balances for supported assets.
- Acceptance: Balances are network-scoped; missing trustlines are represented; supply/repay forms use live balances.

### 046. Add trustline detection
- Area: Wallet
- Priority: P1
- Summary: Detect whether wallet has trustlines for Stellar classic assets where needed.
- Acceptance: UI explains missing trustline; actions requiring balances are disabled until resolved.

### 047. Add `useMarkets` lending hook
- Area: Hooks
- Priority: P0
- Summary: Build a high-level hook for normalized market cards and tables.
- Acceptance: Combines configs, states, token metadata, oracle prices, and APYs into one typed view model.

### 048. Add `useMarket` hook
- Area: Hooks
- Priority: P1
- Summary: Load one market by asset ID for detail and action modals.
- Acceptance: Returns config, state, utilization, liquidity, caps, oracle status, and risk params.

### 049. Add utilization calculation from contract state
- Area: Lending Data
- Priority: P0
- Summary: Compute utilization from scaled supply, scaled borrow, and current indexes.
- Acceptance: Matches interest-rate-model formula; zero supply is handled; display updates after accrual.

### 050. Add APY read from interest-rate-model
- Area: Lending Data
- Priority: P1
- Summary: Call `get_rates` for each active market.
- Acceptance: Markets show live borrow and supply APY; zero-supply markets show a safe placeholder.

### 051. Add oracle price read via oracle-adapter
- Area: Oracle
- Priority: P0
- Summary: Read `get_price` for supported assets and expose freshness/source metadata.
- Acceptance: Markets show price, last updated, stale state, and oracle source; stale prices block risky writes.

### 052. Add oracle health indicators
- Area: Oracle
- Priority: P1
- Summary: Surface stale, missing, or invalid oracle states in UI.
- Acceptance: Market cards and action dialogs show warnings; health factor calculations do not silently use bad prices.

### 053. Add user supply balance reads
- Area: Portfolio
- Priority: P0
- Summary: Use `get_supply_balance` for each supported core market.
- Acceptance: Portfolio and dashboard show connected user's live supplied balances; disconnected state remains clean.

### 054. Add user borrow balance reads
- Area: Portfolio
- Priority: P0
- Summary: Use `get_borrow_balance` for each supported core market.
- Acceptance: Portfolio and dashboard show live debt; borrow balances update after repay and accrual.

### 055. Add user health factor read
- Area: Portfolio
- Priority: P0
- Summary: Use `get_health_factor` for dashboard, portfolio, and action checks.
- Acceptance: No-debt users show safe state; risky positions show color-coded warnings; failed reads are visible.

### 056. Add collateral enabled state reads
- Area: Portfolio
- Priority: P1
- Summary: Expose whether each supplied asset is enabled as collateral.
- Acceptance: Portfolio table and action modals reflect on-chain collateral state; toggles invalidate health factor.

### 057. Add portfolio summary aggregation
- Area: Portfolio
- Priority: P1
- Summary: Aggregate supplied value, borrowed value, net worth, and weighted APY from live reads.
- Acceptance: Dashboard and portfolio summary no longer depend on `MOCK_POSITIONS`.

### 058. Add available liquidity display
- Area: Markets
- Priority: P1
- Summary: Compute available liquidity from total real supply minus total real borrow.
- Acceptance: Borrow and withdraw forms enforce available liquidity; market cards display liquidity consistently.

### 059. Add supply and borrow cap display
- Area: Markets
- Priority: P1
- Summary: Display cap usage for markets with configured caps.
- Acceptance: Cards and dialogs show cap progress; writes are blocked when projected totals exceed caps.

### 060. Add protocol reserves display
- Area: Analytics
- Priority: P2
- Summary: Show protocol reserves once core pool state supports it.
- Acceptance: Analytics page includes reserves by asset and USD total.

## Lending Writes and User Flows

### 061. Add supply action modal
- Area: Lending Writes
- Priority: P0
- Summary: Build a modal for supplying an asset to the core pool.
- Acceptance: Validates amount, balance, market active state, supply cap, and wallet connection; calls `useContractWrite`.

### 062. Add withdraw action modal
- Area: Lending Writes
- Priority: P0
- Summary: Build a modal for withdrawing supplied assets.
- Acceptance: Validates supplied balance, liquidity, collateral status, and projected health factor; writes to `withdraw`.

### 063. Add borrow action modal
- Area: Lending Writes
- Priority: P0
- Summary: Build a modal for borrowing from the core pool.
- Acceptance: Validates collateral, borrow cap, liquidity, projected health factor, and oracle freshness; writes to `borrow`.

### 064. Add repay action modal
- Area: Lending Writes
- Priority: P0
- Summary: Build a modal for repaying debt.
- Acceptance: Supports repay exact amount and max repay; validates wallet balance; writes to `repay`.

### 065. Add enable collateral action
- Area: Lending Writes
- Priority: P1
- Summary: Implement collateral enable flow.
- Acceptance: Calls `enable_collateral`; updates portfolio; explains increased borrowing power.

### 066. Add disable collateral action
- Area: Lending Writes
- Priority: P1
- Summary: Implement collateral disable flow with health factor protection.
- Acceptance: Shows projected health factor; blocks unsafe disable; calls `disable_collateral`.

### 067. Add max amount helpers
- Area: Forms
- Priority: P1
- Summary: Add max buttons for supply, withdraw, borrow, and repay.
- Acceptance: Max values respect balance, liquidity, caps, health factor buffers, and token decimals.

### 068. Add form amount parser
- Area: Forms
- Priority: P0
- Summary: Parse user decimal input into token base units safely.
- Acceptance: Rejects invalid decimals; respects token precision; never uses unsafe JavaScript number math for contract amounts.

### 069. Add projected position preview
- Area: Forms
- Priority: P1
- Summary: Show before/after supply, borrow, APY, and health factor in action dialogs.
- Acceptance: Preview updates live with amount input; warnings appear for high-risk outcomes.

### 070. Add transaction confirmation summary
- Area: Forms
- Priority: P1
- Summary: Add final confirmation details before wallet signing.
- Acceptance: Shows action, asset, amount, network, contract, estimated fee, health factor impact, and oracle freshness.

### 071. Add post-transaction success state
- Area: UX
- Priority: P2
- Summary: Give users clear next steps after successful supply/borrow/repay/withdraw.
- Acceptance: Success toasts link to explorer; modal can close or view portfolio; query refresh is visible.

### 072. Add action-level disabled reasons
- Area: UX
- Priority: P1
- Summary: Replace generic disabled buttons with explicit reasons.
- Acceptance: Buttons explain connect wallet, wrong network, paused market, missing contract, stale oracle, insufficient balance, or health risk.

### 073. Add paused market handling
- Area: Lending Writes
- Priority: P1
- Summary: Respect core pool and market paused state once readable.
- Acceptance: Mutating actions are disabled while paused; users can still inspect positions.

### 074. Add supply/borrow table actions
- Area: Lending UI
- Priority: P1
- Summary: Wire market card and active position table buttons to real action modals.
- Acceptance: Existing toast-only buttons are replaced with modals and write hooks.

### 075. Add portfolio row actions
- Area: Portfolio
- Priority: P1
- Summary: Connect supply and borrow positions tables to withdraw, repay, and collateral actions.
- Acceptance: Row actions open prefilled modals with the correct asset and current balances.

### 076. Add health factor risk thresholds
- Area: Risk
- Priority: P1
- Summary: Define shared thresholds for safe, caution, danger, and liquidatable states.
- Acceptance: Dashboard, portfolio, dialogs, and gauge use identical thresholds and labels.

### 077. Add liquidation price estimate
- Area: Risk
- Priority: P2
- Summary: Estimate price movement needed to reach health factor below 1.
- Acceptance: Position details show approximate liquidation risk for single and multi-collateral positions.

### 078. Add borrow power calculation
- Area: Risk
- Priority: P1
- Summary: Compute current and remaining borrowing power.
- Acceptance: Borrow modal and dashboard show borrowing power from collateral values and LTVs.

### 079. Add collateral usage explanation in UI
- Area: UX
- Priority: P2
- Summary: Clarify which supplied assets count as collateral without lengthy instructional copy.
- Acceptance: Compact tooltips and icons explain collateral-enabled state.

### 080. Add testnet faucet helper links
- Area: Developer UX
- Priority: P2
- Summary: Help testers fund accounts and get test assets.
- Acceptance: Testnet-only UI links to friendbot or project faucet docs; hidden on mainnet.

## Isolated Markets and Factory

### 081. Add isolated market address registry
- Area: Isolated Markets
- Priority: P0
- Summary: Track deployed isolated market contract IDs by network and pair.
- Acceptance: `IsolatedMarketsPage` can list deployed pairs even before on-chain factory enumeration exists.

### 082. Add isolated market reads
- Area: Isolated Markets
- Priority: P0
- Summary: Read `get_market_config`, `get_market_state`, and `get_user_position` from isolated market contracts.
- Acceptance: Isolated market rows show live config, totals, rates, and user position.

### 083. Add isolated market health factor read
- Area: Isolated Markets
- Priority: P1
- Summary: Use isolated market `get_health_factor` for user positions.
- Acceptance: Isolated positions display health independently from core pool health.

### 084. Add isolated market supply flow
- Area: Isolated Markets
- Priority: P1
- Summary: Supply collateral to an isolated market.
- Acceptance: Modal validates collateral asset, supply cap, wallet balance, and calls isolated `supply`.

### 085. Add isolated market withdraw flow
- Area: Isolated Markets
- Priority: P1
- Summary: Withdraw collateral from an isolated market.
- Acceptance: Validates position balance, liquidity, and projected isolated health factor.

### 086. Add isolated market borrow flow
- Area: Isolated Markets
- Priority: P1
- Summary: Borrow debt asset from an isolated market.
- Acceptance: Validates debt liquidity design, borrow cap, oracle prices, and health factor.

### 087. Add isolated market repay flow
- Area: Isolated Markets
- Priority: P1
- Summary: Repay isolated market debt.
- Acceptance: Supports self and on-behalf-of repayment if contract supports it; invalidates isolated position and market state.

### 088. Add isolated market liquidation view
- Area: Liquidations
- Priority: P2
- Summary: List isolated positions that are below health factor 1 when indexer/data source is available.
- Acceptance: Shows repay amount, collateral to seize, bonus, and risk warnings.

### 089. Add liquidate action hook
- Area: Liquidations
- Priority: P2
- Summary: Implement a write wrapper for isolated market `liquidate`.
- Acceptance: Validates liquidator wallet balance, repay amount, close factor, and target health factor.

### 090. Add market factory admin UI plan
- Area: Admin
- Priority: P3
- Summary: Document and design the admin-only isolated market deployment flow.
- Acceptance: Issue or doc covers required config, admin auth, deployment metadata update, and risk review steps.

## Trade, Earn, Referrals, Analytics, and Quality

### 091. Replace dummy trade order functions with guarded unavailable state
- Area: Trade
- Priority: P1
- Summary: `stellar.ts` currently returns fake transaction hashes for GMX-like flows.
- Acceptance: Fake writes are disabled outside demo mode; UI cannot present dummy hashes as real transactions.

### 092. Split lending Soroban client from trade placeholder client
- Area: Architecture
- Priority: P1
- Summary: Avoid mixing lending protocol contract calls with future perps/trade abstractions.
- Acceptance: Lending hooks live under lending data/lib paths; trade placeholder remains isolated and clearly marked.

### 093. Add account-aware trade queries
- Area: Trade
- Priority: P2
- Summary: Replace hard-coded `"stellar-mainnet"` and dummy account values in trade hooks.
- Acceptance: Positions, orders, markets, and token prices use selected network and connected wallet.

### 094. Add earn data wallet integration
- Area: Earn
- Priority: P2
- Summary: Replace mock wallet balances and dummy claim flows in earn feature.
- Acceptance: Earn hooks use connected account; claim buttons are disabled until real contracts exist.

### 095. Add referrals wallet integration
- Area: Referrals
- Priority: P2
- Summary: Replace placeholder account handling in referrals pages.
- Acceptance: Referral stats and distributions are scoped to connected wallet; claim flows cannot emit fake tx hashes.

### 096. Replace empty mock lending datasets with intentional fixtures
- Area: Data
- Priority: P2
- Summary: `MOCK_MARKETS` is empty and positions/governance are static placeholders.
- Acceptance: Development fixtures are realistic, clearly named, and never used when live contract mode is enabled.

### 097. Add analytics live data hooks
- Area: Analytics
- Priority: P2
- Summary: Power protocol stats from live market reads.
- Acceptance: TVL, borrowed, utilization, revenue/reserves, and unique suppliers have documented data sources or explicit unavailable states.

### 098. Add governance unavailable/live boundary
- Area: Governance
- Priority: P2
- Summary: Governance UI uses mock proposals and toast-only interactions.
- Acceptance: Mock governance is labeled as coming soon or wired to a real governance source; vote actions cannot imply on-chain success.

### 099. Add unit tests for math and formatting utilities
- Area: Testing
- Priority: P1
- Summary: Cover WAD formatting, token parsing, health factor display, and query key builders.
- Acceptance: Tests cover large values, zero values, decimal precision, and unsafe input.

### 100. Add integration smoke tests for critical user flows
- Area: Testing
- Priority: P1
- Summary: Add smoke tests for connect wallet, switch network, read markets, and open action modal.
- Acceptance: Tests run in CI or documented local command; mock wallet/RPC providers make flows deterministic.

## Detailed Source Reference Matrix

Use this section when turning the backlog into GitHub issues. Line numbers refer to the current workspace at the time this file was generated.

#### Issue 001 - Add Stellar wallet provider abstraction
- Evidence: `apps/web/src/ui/Navbar.tsx:128` has a static Connect button; `apps/web/src/features/lending/components/layout/app-sidebar.tsx:169` has a toast-only wallet button; `apps/web/src/features/trade/components/trade-panel/ConfirmationDialog.tsx:41` and `:52` pass dummy accounts.
- Likely files: add `apps/web/src/features/wallet/*`; update `Navbar.tsx`, `app-sidebar.tsx`, and trade/lending action call sites.
- Detail: This should be the root interface for account state, signing, wallet metadata, and wallet errors. Other wallet issues should compose around this provider rather than each component calling wallet APIs directly.

#### Issue 002 - Integrate Freighter wallet connection
- Evidence: no Freighter dependency or connector exists in `apps/web/package.json:14`; wallet UI is placeholder-only in `Navbar.tsx:128` and `app-sidebar.tsx:169`.
- Likely files: `apps/web/package.json`, `apps/web/src/features/wallet/connectors/freighter.ts`, wallet modal/provider files.
- Detail: Freighter should be the first concrete connector because it covers the most common Stellar browser-wallet flow and can sign Soroban XDR.

#### Issue 003 - Add wallet connector registry
- Evidence: current UI has one generic Connect action in `Navbar.tsx:128`; no connector abstraction exists in the source tree.
- Likely files: `apps/web/src/features/wallet/connectors/index.ts`, `apps/web/src/features/wallet/types.ts`.
- Detail: The registry prevents Freighter-specific code from leaking into every component and keeps xBull/Albedo additions small later.

#### Issue 004 - Add wallet persistence and reconnect behavior
- Evidence: the app already uses localStorage for theme in `apps/web/src/routes/__root.tsx:149` and trade state in `apps/web/src/features/trade/hooks/useTradeState.ts:81`; wallet state currently has no equivalent.
- Likely files: wallet Zustand slice, provider bootstrap, connector registry.
- Detail: Persist connector choice, not private data. Reconnect should be quiet and reversible, with no surprise signing prompts.

#### Issue 005 - Add wallet account switch detection
- Evidence: account-specific hooks default to dummy accounts in `apps/web/src/features/trade/hooks/useOrders.ts:50` and `apps/web/src/features/trade/hooks/usePositions.ts:73`.
- Likely files: wallet provider, query key helpers, account-scoped hooks.
- Detail: Account changes must invalidate positions, balances, orders, portfolio, earn, and referral queries.

#### Issue 006 - Add wallet disconnect flow
- Evidence: existing Connect buttons have no connected state or disconnect path in `Navbar.tsx:128` and `app-sidebar.tsx:169`.
- Likely files: wallet provider/store, wallet modal, account display.
- Detail: Disconnect should clear wallet-scoped cache while preserving network and non-sensitive UI preferences.

#### Issue 007 - Add wallet address display component
- Evidence: no reusable address component exists; UI only exposes generic Connect buttons at `Navbar.tsx:128` and `app-sidebar.tsx:169`.
- Likely files: `apps/web/src/features/wallet/components/account-button.tsx`, `apps/web/src/features/wallet/components/address-copy.tsx`.
- Detail: Include shortened address, copy action, explorer link, and connected wallet name.

#### Issue 008 - Add wallet connection modal
- Evidence: `Navbar.tsx:128` is a direct button without modal state; `app-sidebar.tsx:169` only emits `toast.info("Coming soon")`.
- Likely files: wallet modal component plus navbar/sidebar integration.
- Detail: Modal should expose installed, unavailable, connecting, error, and connected states for desktop/mobile.

#### Issue 009 - Add network configuration model
- Evidence: `apps/web/src/features/trade/hooks/useTokenPrices.ts:6`, `useMarketsInfo.ts:28`, `useOrders.ts:54`, and `usePositions.ts:77` hard-code `stellar-mainnet`.
- Likely files: `apps/web/src/config/networks.ts`, `apps/web/src/features/network/*`.
- Detail: Config should include Stellar network passphrase, RPC URL, Horizon URL, explorer URL, contract registry, and token IDs.

#### Issue 010 - Add Stellar testnet/mainnet toggle
- Evidence: `apps/web/src/features/lending/components/layout/app-sidebar.tsx:164` displays static "Stellar Mainnet"; contracts README documents testnet deployment commands at `../contracts/README.md:190`.
- Likely files: network store, sidebar network selector, query keys.
- Detail: Toggle must persist and invalidate network-scoped queries. Writes should clearly show selected network before signing.

#### Issue 011 - Gate mainnet actions behind deployment readiness
- Evidence: contracts README says code is pre-audit at `../contracts/README.md:264`; core pool and isolated market are scaffolded at `../contracts/README.md:49` and `:50`.
- Likely files: feature flags, action modals, `useContractWrite`.
- Detail: Until mainnet contract IDs and launch flags exist, mainnet writes must be disabled even if wallet connection works.

#### Issue 012 - Add network mismatch warnings
- Evidence: network is currently UI text only at `app-sidebar.tsx:164`; wallet network state does not exist.
- Likely files: wallet provider, network store, global banner or action-level warning.
- Detail: Wrong network should block writes but allow reads from the app-selected RPC.

#### Issue 013 - Add typed contract address registry
- Evidence: contract interactions are TODO/dummy in `apps/web/src/features/trade/lib/stellar.ts:2`; implementations plan is explicitly Soroban-based in `implementations.md:3`.
- Likely files: `apps/web/src/config/contracts.ts`, `apps/web/src/config/networks.ts`.
- Detail: Registry should cover core pool, oracle adapter, interest-rate-model, market factory, isolated markets, and liquidation engine.

#### Issue 014 - Add deployment metadata file
- Evidence: contracts README deployment flow records WASM upload/deploy steps at `../contracts/README.md:190`; frontend has no metadata file.
- Likely files: `apps/web/src/config/deployments.ts` or `deployments/*.json`.
- Detail: Track contract ID, WASM hash, ledger, deployer/admin, and version per network so UI can prove what it is talking to.

#### Issue 015 - Add feature flags for scaffolded contract surfaces
- Evidence: `../contracts/README.md:63` says scaffolded contracts contain TODOs; core-pool user functions return placeholders after TODO blocks, e.g. `../contracts/contracts/core-pool/src/lib.rs:172`.
- Likely files: feature flag config, route/action guards.
- Detail: Read-only pages can ship before writes; supply/borrow/repay/withdraw/liquidation should be independently gated.

#### Issue 016 - Add global app Zustand store
- Evidence: `apps/web/package.json:14` dependency list has React Query and Sonner but no `zustand`; trade state is local React state in `useTradeState.ts:96`.
- Likely files: `apps/web/package.json`, `apps/web/src/store/*`.
- Detail: Store wallet/network/UI preferences in small slices with selectors and persisted versioning.

#### Issue 017 - Migrate trade state to Zustand
- Evidence: `apps/web/src/features/trade/hooks/useTradeState.ts:81` reads localStorage directly; `:96` creates local component state; `:8` comments that the current pattern needs migration.
- Likely files: `apps/web/src/features/trade/store/trade-store.ts`, `useTradeState.ts`, trade components.
- Detail: Preserve `astrion-trade-state-v2` migration so existing local selections are not lost.

#### Issue 018 - Add lending Zustand slice
- Evidence: lending filters and action state are component-local or absent; implementation plan lists pages and shared components in `implementations.md:43`, `:54`, `:66`, and `:77`.
- Likely files: `apps/web/src/features/lending/store/lending-store.ts`.
- Detail: Store selected market, filters, modal state, and collateral UI choices without mixing them into contract read cache.

#### Issue 019 - Add network-scoped React Query keys
- Evidence: root QueryClient exists at `apps/web/src/routes/__root.tsx:7`; trade query keys use hard-coded mainnet in `useOrders.ts:54` and `usePositions.ts:77`.
- Likely files: `apps/web/src/lib/query-keys.ts`, `apps/web/src/features/trade/lib/query-keys.ts`, new lending query keys.
- Detail: Every query key that can change by network or account must include those dimensions.

#### Issue 020 - Add app-level error boundary
- Evidence: root route defines `notFoundComponent` in `apps/web/src/routes/__root.tsx:135` but no route error boundary is visible.
- Likely files: `apps/web/src/routes/__root.tsx`, shared error UI.
- Detail: Catch render/query/RPC failures and provide retry actions without blank-screening the app.

#### Issue 021 - Add Stellar SDK dependencies
- Evidence: `apps/web/package.json:14-29` has no Stellar SDK dependency; `stellar.ts:11` links the Stellar SDK docs but uses no SDK.
- Likely files: `apps/web/package.json`, lockfile, Soroban client helpers.
- Detail: Pick the current official Stellar JS SDK package and wire types through the client factory.

#### Issue 022 - Create Soroban RPC client factory
- Evidence: `stellar.ts:54-59` describes prepare/send/poll flow as TODO; no shared RPC client exists.
- Likely files: `apps/web/src/lib/soroban/client.ts`, network config.
- Detail: Factory should be deterministic from selected network and easy to mock in tests.

#### Issue 023 - Add account loading helper
- Evidence: transaction flow TODOs require account preparation at `stellar.ts:54`; wallet/account data is currently dummy at `ConfirmationDialog.tsx:41`.
- Likely files: Soroban client helpers and wallet provider.
- Detail: Must handle unfunded testnet accounts and stale sequence numbers explicitly.

#### Issue 024 - Add transaction build helper
- Evidence: `stellar.ts:54-59`, `:76-80`, and `:154-160` outline repeated build/sign/send logic.
- Likely files: `apps/web/src/lib/soroban/transactions.ts`.
- Detail: Centralize contract invoke transaction building so hooks and features do not duplicate XDR handling.

#### Issue 025 - Add transaction polling helper
- Evidence: `stellar.ts:58` and `:80` explicitly say to poll until success/failure.
- Likely files: Soroban transaction helpers and `useContractWrite`.
- Detail: Return hash, status, result, error, and explorer URL. Timeout must not be treated as confirmed success.

#### Issue 026 - Add contract argument encoding utilities
- Evidence: contract methods accept Soroban types like `Address`, `BytesN`, `i128`, and structs in `../contracts/contracts/core-pool/src/lib.rs:73`, `:172`, `:268`, `:318`.
- Likely files: `apps/web/src/lib/soroban/scval.ts`.
- Detail: No action modal should manually create ScVals; all encoding should be typed and tested.

#### Issue 027 - Add contract result decoding utilities
- Evidence: core-pool views return `Result<i128, PoolError>` and `Option<MarketState>` at `../contracts/contracts/core-pool/src/lib.rs:426`, `:473`, `:478`.
- Likely files: `apps/web/src/lib/soroban/decode.ts`, contract wrapper files.
- Detail: Decode i128 as strings or bigint internally, then format for UI.

#### Issue 028 - Add `useContractRead` hook
- Evidence: React Query is installed at `apps/web/package.json:18`; root QueryClient is configured at `__root.tsx:7`; no generic contract read hook exists.
- Likely files: `apps/web/src/hooks/use-contract-read.ts` or `apps/web/src/lib/soroban/react-query.ts`.
- Detail: Must support disabled state for missing contracts and decode functions per method.

#### Issue 029 - Add `useContractWrite` hook
- Evidence: all current write-like functions in `stellar.ts:53`, `:75`, `:97`, `:113`, `:123`, and `:149` are async dummy functions with toasts.
- Likely files: `apps/web/src/hooks/use-contract-write.ts`, Soroban transactions helper.
- Detail: Use React Query mutation, wallet signing, prepared tx submission, polling, and cache invalidation.

#### Issue 030 - Add toaster lifecycle to `useContractWrite`
- Evidence: Sonner Toaster is mounted at `__root.tsx:171`; dummy transaction functions already use loading/success toasts in `stellar.ts:61`, `:66`, `:88`, `:104`.
- Likely files: `use-contract-write.ts`, toast helper.
- Detail: Standardize signature requested, submitting, confirmed, failed, and timeout states.

#### Issue 031 - Add write preflight validation
- Evidence: dummy writes can run with `"GDUMMY...STELLAR"` at `ConfirmationDialog.tsx:41` and `:52`.
- Likely files: `use-contract-write.ts`, action modals.
- Detail: Validate wallet, network, contract ID, feature flag, amount, oracle freshness, and simulation before opening wallet signing.

#### Issue 032 - Add transaction error mapper
- Evidence: current dummy functions only show success toasts, e.g. `stellar.ts:66` and `:88`; no failure mapper exists.
- Likely files: `apps/web/src/lib/soroban/errors.ts`.
- Detail: Map wallet rejection, RPC failure, auth failure, insufficient balance, missing trustline, stale oracle, paused market, and health factor errors.

#### Issue 033 - Add contract error enum mapping
- Evidence: contracts expose typed errors in `../contracts/contracts/core-pool/src/errors.rs`, `market/src/errors.rs`, `oracle-adapter/src/errors.rs`, and `interest-rate-model/src/errors.rs`.
- Likely files: `apps/web/src/lib/contracts/errors.ts`.
- Detail: Give every known contract error a user-facing message and preserve raw code for debugging.

#### Issue 034 - Add transaction history store
- Evidence: write functions return hashes like `"DUMMY_TX_HASH"` in `stellar.ts:71`, `:93`, `:109`, `:119`, and `:134`, but nothing records them.
- Likely files: transaction Zustand slice and activity UI.
- Detail: Store network, hash, action type, status, timestamp, and affected assets locally.

#### Issue 035 - Add transaction activity panel
- Evidence: app has no transaction UI beyond toasts at `__root.tsx:171`.
- Likely files: shared transaction components and navbar/sidebar integration.
- Detail: Useful for long Soroban polling and refresh recovery.

#### Issue 036 - Add idempotent query invalidation strategy
- Evidence: React Query is present at `__root.tsx:7`, but dummy write functions have no query invalidation.
- Likely files: contract write hook, query key helpers.
- Detail: Each write should invalidate the exact market/account/dashboard keys it can affect.

#### Issue 037 - Add optimistic UI policy
- Evidence: all blockchain writes are currently fake-success flows in `stellar.ts:66`, `:88`, `:104`, `:118`, and `:131`.
- Likely files: docs or code comments near write hook; action modal behavior.
- Detail: Financial state should generally update after confirmation; form-only UI can update optimistically.

#### Issue 038 - Add RPC health check query
- Evidence: network config does not exist; selected RPC freshness is not checked before reads or writes.
- Likely files: network hooks, status indicator.
- Detail: Check latest ledger and RPC reachability; block writes if stale or down.

#### Issue 039 - Add Soroban simulation display metadata
- Evidence: transaction TODOs mention `prepareTransaction` at `stellar.ts:55`, which depends on simulation/preparation.
- Likely files: Soroban transaction helper, confirmation dialogs.
- Detail: Show estimated fee/resource usage before signature so users know what wallet will ask them to sign.

#### Issue 040 - Add generated contract clients workflow
- Evidence: contracts use Soroban public methods across `core-pool/src/lib.rs`, `oracle-adapter/src/lib.rs`, and `interest-rate-model/src/lib.rs`; frontend has no binding strategy.
- Likely files: scripts or generated client folder, README docs.
- Detail: Decide generated bindings vs handwritten wrappers before many hooks are written.

#### Issue 041 - Replace mock market data with core pool reads
- Evidence: `apps/web/src/features/lending/data/mock-markets.ts:3` is an empty array; `markets-page.tsx:4` imports it; core-pool exposes `get_market_state` at `../contracts/contracts/core-pool/src/lib.rs:473` and `get_market_config` at `:478`.
- Likely files: lending data hooks, markets page, market card.
- Detail: Use contract reads when deployed; keep mock fixtures only behind development mode.

#### Issue 042 - Add market list read strategy
- Evidence: core-pool `add_market` TODO says to append to `MarketList` at `../contracts/contracts/core-pool/src/lib.rs:132`; no public list view exists yet.
- Likely files: contract wrapper, deployment metadata, market listing hook.
- Detail: Until contract enumeration lands, use deployment metadata as the frontend source of market IDs.

#### Issue 043 - Add WAD math formatting utilities
- Evidence: contracts README defines WAD math at `../contracts/README.md:150`; core-pool balances and health factor use WAD at `core-pool/src/lib.rs:426`.
- Likely files: `apps/web/src/lib/math/wad.ts`, formatting utilities.
- Detail: Keep protocol math in bigint/string space; convert to display strings at the edge.

#### Issue 044 - Add token metadata registry
- Evidence: lending `Market` type has `symbol`, `name`, `oracle`, caps, and risk fields at `apps/web/src/features/lending/types/lending.ts:3`; trade has separate token data under `apps/web/src/features/trade/data/tokens.ts`.
- Likely files: `apps/web/src/config/tokens.ts`, `AssetIcon` call sites.
- Detail: One registry should drive labels, decimals, icons, contract IDs, and network availability.

#### Issue 045 - Add Stellar token balance reads
- Evidence: supply/repay contract calls transfer tokens in `../contracts/contracts/core-pool/src/lib.rs:206` and `:343`; frontend has no wallet balance hook.
- Likely files: wallet hooks, asset hooks, supply/repay modals.
- Detail: Balance reads are required for max buttons and disabled reasons.

#### Issue 046 - Add trustline detection
- Evidence: Stellar classic assets may require trustlines; current app has no wallet/account layer and no token-balance error distinction.
- Likely files: wallet balance hooks, action disabled reasons.
- Detail: Missing trustline should be clear and separate from zero balance.

#### Issue 047 - Add `useMarkets` lending hook
- Evidence: implementation plan lists MarketsPage and MarketCard at `implementations.md:58-59`; data is currently empty at `mock-markets.ts:3`.
- Likely files: `apps/web/src/features/lending/hooks/use-markets.ts`.
- Detail: Compose configs, states, prices, APYs, caps, and token metadata into one UI model.

#### Issue 048 - Add `useMarket` hook
- Evidence: action modals need one asset's config/state; core-pool exposes per-asset views at `core-pool/src/lib.rs:473` and `:478`.
- Likely files: `apps/web/src/features/lending/hooks/use-market.ts`.
- Detail: Use this for market detail, action dialogs, and row-level refresh.

#### Issue 049 - Add utilization calculation from contract state
- Evidence: interest-rate model computes utilization in `../contracts/contracts/interest-rate-model/src/lib.rs:111`; core-pool state stores scaled totals and indexes per TODO at `core-pool/src/lib.rs:121-129`.
- Likely files: lending math utilities, market hooks.
- Detail: Compute real total borrow/supply before deriving utilization.

#### Issue 050 - Add APY read from interest-rate-model
- Evidence: rate model exposes `get_rates` at `../contracts/contracts/interest-rate-model/src/lib.rs:104`; core-pool accrual TODO calls the rate model at `core-pool/src/lib.rs:548`.
- Likely files: contract wrappers, `useMarkets`.
- Detail: Zero-supply markets should not error the page; show placeholder or configured initial rate.

#### Issue 051 - Add oracle price read via oracle-adapter
- Evidence: oracle adapter exposes `get_price` at `../contracts/contracts/oracle-adapter/src/lib.rs:119`; contracts README says CorePool should call it at `../contracts/README.md:180`.
- Likely files: oracle hook, market hook, health/risk utilities.
- Detail: Return price, timestamp, source, staleness, and user-facing status.

#### Issue 052 - Add oracle health indicators
- Evidence: oracle adapter checks stale and invalid prices at `oracle-adapter/src/lib.rs:145` and `:151`.
- Likely files: MarketCard, action dialogs, OracleStatus component.
- Detail: Stale or missing oracle data should block borrow/withdraw/liquidation-risk actions.

#### Issue 053 - Add user supply balance reads
- Evidence: core-pool exposes `get_supply_balance` at `../contracts/contracts/core-pool/src/lib.rs:454`; portfolio data is empty at `mock-positions.ts:3`.
- Likely files: portfolio hooks, dashboard hooks.
- Detail: Read for each configured market and aggregate into positions.

#### Issue 054 - Add user borrow balance reads
- Evidence: core-pool exposes `get_borrow_balance` at `../contracts/contracts/core-pool/src/lib.rs:465`; dashboard currently imports mock positions at `dashboard-page.tsx:1`.
- Likely files: portfolio/dashboard hooks.
- Detail: Borrow balances must update after accrual and repay writes.

#### Issue 055 - Add user health factor read
- Evidence: core-pool exposes `get_health_factor` at `../contracts/contracts/core-pool/src/lib.rs:426`; plan includes `HealthFactorGauge` at `implementations.md:35`.
- Likely files: portfolio summary, dashboard summary, health factor gauge.
- Detail: Show no-debt as safe/infinite without displaying raw `i128::MAX`.

#### Issue 056 - Add collateral enabled state reads
- Evidence: core-pool has `enable_collateral` at `core-pool/src/lib.rs:369` and `disable_collateral` at `:388`; `Position` type has `collateralEnabled` at `lending.ts:23`.
- Likely files: portfolio hooks and tables.
- Detail: If contract lacks a direct per-user state view, add/read via account view or event/indexer plan.

#### Issue 057 - Add portfolio summary aggregation
- Evidence: `PortfolioSummary` is planned at `implementations.md:71`; current positions data is empty at `mock-positions.ts:3`.
- Likely files: `portfolio-summary.tsx`, portfolio hooks.
- Detail: Aggregate supplied USD, borrowed USD, net worth, APY, and health from live reads.

#### Issue 058 - Add available liquidity display
- Evidence: core-pool TODO computes available liquidity in withdraw and borrow at `core-pool/src/lib.rs:239` and `:289`; `Market` type already has `availableLiquidity` at `lending.ts:13`.
- Likely files: market hook, market card, action modals.
- Detail: Same calculation should power display and write validation.

#### Issue 059 - Add supply and borrow cap display
- Evidence: cap enforcement TODOs are at `core-pool/src/lib.rs:192` and `:284`; `Market` type includes `borrowCap` at `lending.ts:19`.
- Likely files: market hook/cards/dialogs.
- Detail: Show cap usage and block projected cap violations before signing.

#### Issue 060 - Add protocol reserves display
- Evidence: core-pool state initializes `protocol_reserves` at `core-pool/src/lib.rs:126` and accrual updates it at `:564`.
- Likely files: analytics hooks, `protocol-stats-bar.tsx`.
- Detail: Display per-asset reserves and USD total once state reads are live.

#### Issue 061 - Add supply action modal
- Evidence: core-pool `supply` starts at `core-pool/src/lib.rs:172`; current market/action buttons are toast-only in `market-card.tsx:1` and related lending components.
- Likely files: supply modal, market card/table actions, `useContractWrite`.
- Detail: Validate amount, active market, cap, balance, oracle/network, and wallet.

#### Issue 062 - Add withdraw action modal
- Evidence: core-pool `withdraw` starts at `core-pool/src/lib.rs:221`; TODO includes liquidity and health factor checks at `:239` and `:244`.
- Likely files: withdraw modal, portfolio tables.
- Detail: Preview post-withdraw health factor before signing.

#### Issue 063 - Add borrow action modal
- Evidence: core-pool `borrow` starts at `core-pool/src/lib.rs:268`; TODO includes borrow cap, liquidity, and health factor at `:284`, `:289`, `:294`.
- Likely files: borrow modal, market actions.
- Detail: Borrow should be disabled if no collateral or stale oracle data.

#### Issue 064 - Add repay action modal
- Evidence: core-pool `repay` starts at `core-pool/src/lib.rs:318`; TODO supports `on_behalf_of` at `:331`.
- Likely files: repay modal, borrow positions table.
- Detail: Support max repay and cap actual repay to debt.

#### Issue 065 - Add enable collateral action
- Evidence: core-pool `enable_collateral` starts at `core-pool/src/lib.rs:369`; `Position` type has `collateralEnabled` at `lending.ts:23`.
- Likely files: portfolio table toggle, collateral action hook.
- Detail: Update borrowing power and health factor after confirmation.

#### Issue 066 - Add disable collateral action
- Evidence: core-pool `disable_collateral` starts at `core-pool/src/lib.rs:388`; TODO requires projected health factor check at `:393`.
- Likely files: portfolio table toggle, action confirmation dialog.
- Detail: Must block unsafe disable before wallet signing and handle contract rejection.

#### Issue 067 - Add max amount helpers
- Evidence: forms need balances and caps from supply/withdraw/borrow/repay TODOs at `core-pool/src/lib.rs:192`, `:239`, `:284`, and `:331`.
- Likely files: form utilities and action modals.
- Detail: Max borrow should include a safety buffer; max repay should not exceed wallet balance or current debt.

#### Issue 068 - Add form amount parser
- Evidence: contract amounts are `i128` at `core-pool/src/lib.rs:172`, `:221`, `:268`, and `:318`; UI types currently use display strings/numbers in `lending.ts`.
- Likely files: `apps/web/src/lib/amounts.ts`.
- Detail: Parse decimal strings to base units using token decimals; avoid unsafe number math for contract args.

#### Issue 069 - Add projected position preview
- Evidence: health factor and balance math are defined in core-pool TODOs at `core-pool/src/lib.rs:426-447`.
- Likely files: action modals, risk utilities.
- Detail: Before/after health factor, supplied, borrowed, APY, and cap usage should update with typed input.

#### Issue 070 - Add transaction confirmation summary
- Evidence: `ConfirmationDialog.tsx:41-58` has a trade confirmation flow with dummy account and TODO price/slippage logic.
- Likely files: shared transaction confirmation component, lending modals.
- Detail: Reuse a consistent summary pattern for lending writes with network, contract, fee estimate, and risk impact.

#### Issue 071 - Add post-transaction success state
- Evidence: dummy toasts show fake tx descriptions at `stellar.ts:68`, `:90`, and `:105`.
- Likely files: write hook, success UI, transaction history.
- Detail: Link to explorer and refresh affected reads after final confirmation.

#### Issue 072 - Add action-level disabled reasons
- Evidence: many components use `toast.info("Coming soon")`, e.g. `active-positions-table.tsx:10`, `isolated-market-row.tsx:8`, and `market-insights.tsx:47`.
- Likely files: button helpers, action modals, market/portfolio rows.
- Detail: Disabled state should say exactly why action cannot proceed.

#### Issue 073 - Add paused market handling
- Evidence: core-pool has `pause` and `unpause` at `core-pool/src/lib.rs:489` and `:500`; user operations TODO check not paused at `:178`, `:227`, `:274`, `:325`.
- Likely files: contract read hooks, action guard utilities.
- Detail: Paused markets should still be readable but not writable.

#### Issue 074 - Add supply/borrow table actions
- Evidence: implementation plan expects market card actions at `implementations.md:59`; current lending action files import Sonner for placeholder toasts.
- Likely files: `market-card.tsx`, `markets-page.tsx`, action modals.
- Detail: Replace toast-only actions with real modal launchers and disabled reasons.

#### Issue 075 - Add portfolio row actions
- Evidence: implementation plan lists supply and borrow position tables at `implementations.md:72-73`.
- Likely files: `supply-positions-table.tsx`, `borrow-positions-table.tsx`.
- Detail: Rows should open withdraw, repay, and collateral modals with prefilled asset data.

#### Issue 076 - Add health factor risk thresholds
- Evidence: `HealthFactorGauge` is planned at `implementations.md:35`; contract uses WAD-scaled HF at `core-pool/src/lib.rs:426`.
- Likely files: risk constants, health factor gauge, portfolio/dashboard components.
- Detail: Use one shared threshold map across all pages and previews.

#### Issue 077 - Add liquidation price estimate
- Evidence: core-pool HF math is described at `core-pool/src/lib.rs:431-447`; liquidation engine preview TODO exists at `../contracts/contracts/liquidation-engine/src/lib.rs:226`.
- Likely files: risk utilities and position detail UI.
- Detail: Estimate should be clearly labeled approximate, especially for multi-collateral portfolios.

#### Issue 078 - Add borrow power calculation
- Evidence: core-pool borrow TODO projects health factor at `core-pool/src/lib.rs:294`; lending plan includes portfolio summary at `implementations.md:48` and `:71`.
- Likely files: risk math utilities, dashboard/borrow modal.
- Detail: Compute collateral value by LTV and subtract current debt value.

#### Issue 079 - Add collateral usage explanation in UI
- Evidence: `Position.collateralEnabled` exists at `lending.ts:23`, but no real collateral UX exists yet.
- Likely files: portfolio tables, tooltips, collateral toggles.
- Detail: Keep copy compact; avoid instructional walls inside the app.

#### Issue 080 - Add testnet faucet helper links
- Evidence: contracts README documents testnet deployment at `../contracts/README.md:190`; app will need tester funding for testnet actions.
- Likely files: network/wallet status UI, empty states.
- Detail: Only show on testnet and only when wallet lacks required balances/trustlines.

#### Issue 081 - Add isolated market address registry
- Evidence: implementation plan lists isolated markets page at `implementations.md:81`; market factory list is TODO at `../contracts/contracts/market-factory/src/lib.rs:176`.
- Likely files: deployment metadata, isolated market hooks.
- Detail: Registry unblocks frontend reads before factory enumeration is implemented.

#### Issue 082 - Add isolated market reads
- Evidence: isolated market exposes `get_user_position`, `get_market_state`, and `get_market_config` at `../contracts/contracts/market/src/lib.rs:282`, `:288`, and `:292`.
- Likely files: `apps/web/src/features/lending/hooks/use-isolated-market.ts`.
- Detail: Normalize isolated data separately from core-pool markets because risk is ring-fenced.

#### Issue 083 - Add isolated market health factor read
- Evidence: isolated market exposes `get_health_factor` at `../contracts/contracts/market/src/lib.rs:276`.
- Likely files: isolated market hook and row/detail UI.
- Detail: Do not combine isolated HF with core pool HF.

#### Issue 084 - Add isolated market supply flow
- Evidence: isolated market `supply` starts at `../contracts/contracts/market/src/lib.rs:91`; `IsolatedMarketRow` currently has coming-soon toast at `isolated-market-row.tsx:8`.
- Likely files: isolated market action modal and row actions.
- Detail: Validate collateral asset, cap, wallet balance, and market paused state.

#### Issue 085 - Add isolated market withdraw flow
- Evidence: isolated market `withdraw` starts at `../contracts/contracts/market/src/lib.rs:124`; TODO requires liquidity and HF check at `:134` and `:139`.
- Likely files: isolated withdraw modal and risk preview.
- Detail: Use isolated position only, not core-pool portfolio state.

#### Issue 086 - Add isolated market borrow flow
- Evidence: isolated market `borrow` starts at `../contracts/contracts/market/src/lib.rs:151`; TODO notes v1 debt liquidity design decision at `:162`.
- Likely files: isolated borrow modal, deployment metadata.
- Detail: UI should stay gated until debt-asset liquidity design is resolved.

#### Issue 087 - Add isolated market repay flow
- Evidence: isolated market `repay` starts at `../contracts/contracts/market/src/lib.rs:187`.
- Likely files: isolated repay modal and position row.
- Detail: Handle `payer` and `on_behalf_of` exactly as contract signature allows.

#### Issue 088 - Add isolated market liquidation view
- Evidence: isolated market `liquidate` starts at `../contracts/contracts/market/src/lib.rs:221`; liquidation engine has a broader liquidation TODO at `liquidation-engine/src/lib.rs:143`.
- Likely files: liquidation page/view, isolated market hooks, indexer strategy.
- Detail: Listing all liquidatable users likely needs events/indexer, not only direct contract reads.

#### Issue 089 - Add liquidate action hook
- Evidence: isolated market liquidation TODO covers close factor and seizure math at `market/src/lib.rs:235-247`.
- Likely files: liquidation hook, liquidation confirmation dialog.
- Detail: Validate target HF, repay cap, liquidator balance, and expected seized collateral before signing.

#### Issue 090 - Add market factory admin UI plan
- Evidence: market factory initialize/deploy TODOs start at `../contracts/contracts/market-factory/src/lib.rs:76` and `:107`; list markets TODO at `:176`.
- Likely files: admin docs or future admin route.
- Detail: This should start as a plan/doc because it is admin-only and depends on factory contract completion.

#### Issue 091 - Replace dummy trade order functions with guarded unavailable state
- Evidence: `apps/web/src/features/trade/lib/stellar.ts:2` says every function is dummy; it returns fake hashes at `:71`, `:93`, `:109`, `:119`, `:167`, and `:195`.
- Likely files: `stellar.ts`, trade confirmation dialog, trade buttons.
- Detail: Demo mode is fine if explicit; production UI must not present fake tx hashes as real.

#### Issue 092 - Split lending Soroban client from trade placeholder client
- Evidence: `stellar.ts:5-8` references ExchangeRouter/DataStore/SyntheticsReader while lending contracts are CorePool/Oracle/RateModel in `../contracts/README.md:33-44`.
- Likely files: `apps/web/src/features/lending/lib/soroban.ts`, `apps/web/src/features/trade/lib/stellar.ts`.
- Detail: Keep perps/trade abstractions separate from lending protocol contract wrappers.

#### Issue 093 - Add account-aware trade queries
- Evidence: trade hooks hard-code mainnet and dummy accounts at `useTokenPrices.ts:6`, `useMarketsInfo.ts:28`, `useOrders.ts:50`, and `usePositions.ts:73`.
- Likely files: trade hooks and query keys.
- Detail: Use selected network and wallet account from shared state.

#### Issue 094 - Add earn data wallet integration
- Evidence: earn hooks TODO wallet balance reads at `apps/web/src/features/earn/hooks/use-earn-data.ts:88`; earn actions return dummy hashes in `apps/web/src/features/earn/lib/earn.ts:61`, `:73`, `:82`, `:91`, and `:100`.
- Likely files: earn hooks, earn lib, wallet provider.
- Detail: Until earn contracts exist, claim/deposit/withdraw actions should be disabled or demo-only.

#### Issue 095 - Add referrals wallet integration
- Evidence: referral tabs have TODOs to pass real wallet account in `traders-tab.tsx:37`, `affiliates-tab.tsx:38`, and `distributions-tab.tsx:29`.
- Likely files: referral hooks/components.
- Detail: Referral reads and claims must be scoped to connected wallet.

#### Issue 096 - Replace empty mock lending datasets with intentional fixtures
- Evidence: mock arrays are empty in `mock-markets.ts:3`, `mock-positions.ts:3`, and `mock-governance.ts:3`.
- Likely files: `apps/web/src/features/lending/data/*`.
- Detail: Use explicit dev fixtures and ensure live mode cannot silently fall back to fake data.

#### Issue 097 - Add analytics live data hooks
- Evidence: implementation plan lists analytics components at `implementations.md:91-95`; current stats bars use placeholders such as `protocol-stats-bar.tsx:9`.
- Likely files: analytics hooks, protocol stats bar, chart components.
- Detail: Define whether unique suppliers/revenue require indexer data or are unavailable in v1.

#### Issue 098 - Add governance unavailable/live boundary
- Evidence: implementation plan lists governance at `implementations.md:103-105`; governance page imports mock proposals at `governance-page.tsx:2`.
- Likely files: governance page, proposal card, governance hooks.
- Detail: Vote actions should not imply on-chain governance exists until a real source is wired.

#### Issue 099 - Add unit tests for math and formatting utilities
- Evidence: WAD and rate math are central in `../contracts/README.md:150` and `interest-rate-model/src/lib.rs:198`; frontend currently has no visible test setup in `apps/web/package.json:6-12`.
- Likely files: test config, math/amount/query-key utilities.
- Detail: Cover bigint parsing, formatting, zero values, rounding, and invalid inputs.

#### Issue 100 - Add integration smoke tests for critical user flows
- Evidence: root app wiring lives in `apps/web/src/routes/__root.tsx:168`; critical flows will cover connect, switch network, read markets, and open action modal.
- Likely files: test runner config, mock wallet/RPC provider, route smoke tests.
- Detail: Use deterministic mocks so CI does not depend on public Stellar RPC availability.
