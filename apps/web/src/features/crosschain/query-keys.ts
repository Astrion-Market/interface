import type { ExecutionChainId, ProtocolId } from "../lending/lib/identity"
import type { Env } from "./model"
import type { Owner } from "./positions"

// Every key starts with the environment, and account data also carries both
// wallet identities, so switching network or wallet can never surface another
// account's cached balances or debt.
export const crosschainQueryKeys = {
  all: (env: Env) => ["crosschain", env] as const,
  markets: (env: Env) => [...crosschainQueryKeys.all(env), "markets"] as const,
  routes: (env: Env) => [...crosschainQueryKeys.all(env), "routes"] as const,
  account: (env: Env, owner: Owner) =>
    [
      ...crosschainQueryKeys.all(env),
      "account",
      owner.stellar ?? "no-stellar",
      owner.evm?.toLowerCase() ?? "no-evm",
    ] as const,
  positions: (env: Env, owner: Owner, chain: ExecutionChainId, protocol: ProtocolId) =>
    [...crosschainQueryKeys.account(env, owner), "positions", chain, protocol] as const,
}
