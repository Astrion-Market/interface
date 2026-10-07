// EVM wallet session state. Pure so every transition is unit-tested; the
// React provider only feeds it wallet events.

export type EvmSession = {
  status: "disconnected" | "connecting" | "connected"
  providerId: string | null
  account: string | null
  chainId: number | null
  // Last failure, phrased for the user.
  error: string | null
  // Something changed that the user should know about (account switch, lock).
  notice: string | null
}

export type EvmSessionEvent =
  | { type: "connect-start"; providerId: string }
  | { type: "connected"; providerId: string; account: string; chainId: number }
  | { type: "failed"; error: unknown }
  | { type: "accounts-changed"; accounts: Array<string> }
  | { type: "chain-changed"; chainId: number }
  | { type: "provider-disconnected" }
  | { type: "restore-empty" }
  | { type: "user-disconnected" }
  | { type: "dismiss" }

export const INITIAL_EVM_SESSION: EvmSession = {
  status: "disconnected",
  providerId: null,
  account: null,
  chainId: null,
  error: null,
  notice: null,
}

const SAME = (a: string | null, b: string | null) => a?.toLowerCase() === b?.toLowerCase()

export function describeWalletError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined
  switch (code) {
    case 4001:
      return "You declined the request in your wallet. Nothing was signed."
    case -32002:
      return "Your wallet already has a request open. Finish or cancel it there, then try again."
    case 4100:
      return "This site isn't authorized in your wallet yet. Connect again to approve it."
    case 4900:
    case 4901:
      return "Your wallet lost its network connection."
    case 4902:
      return "That network isn't added to your wallet yet."
  }
  if (error instanceof Error && error.message) return error.message
  return "The wallet request failed."
}

export function evmSessionReducer(state: EvmSession, event: EvmSessionEvent): EvmSession {
  switch (event.type) {
    case "connect-start":
      return { ...state, status: "connecting", providerId: event.providerId, error: null, notice: null }
    case "connected":
      return {
        status: "connected",
        providerId: event.providerId,
        account: event.account,
        chainId: event.chainId,
        error: null,
        notice: null,
      }
    case "failed":
      // A failed connect leaves any existing session untouched.
      return {
        ...state,
        status: state.account ? "connected" : "disconnected",
        providerId: state.account ? state.providerId : null,
        error: describeWalletError(event.error),
      }
    case "accounts-changed": {
      if (state.status !== "connected") return state
      const next = event.accounts.at(0) ?? null
      if (next === null)
        return { ...INITIAL_EVM_SESSION, notice: "Your EVM wallet locked or disconnected this site. Connect again to continue." }
      if (SAME(next, state.account)) return state
      return {
        ...state,
        account: next,
        notice: "Your EVM wallet switched accounts. Anything shown for the previous account was cleared.",
      }
    }
    case "chain-changed":
      return state.status === "connected" ? { ...state, chainId: event.chainId } : state
    case "provider-disconnected":
      return state.status === "connected"
        ? { ...INITIAL_EVM_SESSION, notice: "Your EVM wallet disconnected. Connect again to continue." }
        : state
    case "restore-empty":
      return { ...INITIAL_EVM_SESSION, notice: "Your previous EVM wallet session ended. Connect again to continue." }
    case "user-disconnected":
      return INITIAL_EVM_SESSION
    case "dismiss":
      return { ...state, error: null, notice: null }
  }
}

export function toChainId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value
  if (typeof value === "string" && /^0x[0-9a-f]+$/i.test(value)) return Number.parseInt(value, 16)
  return null
}
