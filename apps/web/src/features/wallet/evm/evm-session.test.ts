import assert from "node:assert/strict"
import { test } from "node:test"
import { INITIAL_EVM_SESSION, describeWalletError, evmSessionReducer, toChainId } from "./evm-session.ts"
import type { EvmSession } from "./evm-session"

const connected: EvmSession = evmSessionReducer(INITIAL_EVM_SESSION, {
  type: "connected",
  providerId: "io.metamask",
  account: "0xAbC0000000000000000000000000000000000001",
  chainId: 84532,
})

test("a rejected connection explains it and nothing is connected", () => {
  const started = evmSessionReducer(INITIAL_EVM_SESSION, { type: "connect-start", providerId: "io.metamask" })
  const failed = evmSessionReducer(started, { type: "failed", error: { code: 4001, message: "User rejected" } })
  assert.equal(failed.status, "disconnected")
  assert.equal(failed.account, null)
  assert.match(failed.error ?? "", /declined/)
})

test("a failed request keeps an existing session", () => {
  const failed = evmSessionReducer(connected, { type: "failed", error: { code: -32002 } })
  assert.equal(failed.status, "connected")
  assert.equal(failed.account, connected.account)
  assert.match(failed.error ?? "", /already has a request open/)
})

test("switching accounts replaces the account and tells the user", () => {
  const next = evmSessionReducer(connected, {
    type: "accounts-changed",
    accounts: ["0xDEF0000000000000000000000000000000000002"],
  })
  assert.equal(next.account, "0xDEF0000000000000000000000000000000000002")
  assert.match(next.notice ?? "", /switched accounts/)
})

test("the same account in different case is not a switch", () => {
  const next = evmSessionReducer(connected, { type: "accounts-changed", accounts: [connected.account!.toLowerCase()] })
  assert.equal(next, connected)
})

test("an empty account list (locked wallet) ends the session", () => {
  const next = evmSessionReducer(connected, { type: "accounts-changed", accounts: [] })
  assert.equal(next.status, "disconnected")
  assert.equal(next.account, null)
  assert.match(next.notice ?? "", /locked or disconnected/)
})

test("chain changes are tracked, including unsupported chains", () => {
  assert.equal(evmSessionReducer(connected, { type: "chain-changed", chainId: 1 }).chainId, 1)
})

test("provider disconnect and expired restore both require reconnecting", () => {
  assert.equal(evmSessionReducer(connected, { type: "provider-disconnected" }).status, "disconnected")
  const restored = evmSessionReducer(INITIAL_EVM_SESSION, { type: "restore-empty" })
  assert.equal(restored.status, "disconnected")
  assert.match(restored.notice ?? "", /session ended/)
})

test("events for a disconnected session are ignored", () => {
  assert.equal(evmSessionReducer(INITIAL_EVM_SESSION, { type: "accounts-changed", accounts: ["0x1"] }), INITIAL_EVM_SESSION)
  assert.equal(evmSessionReducer(INITIAL_EVM_SESSION, { type: "chain-changed", chainId: 1 }), INITIAL_EVM_SESSION)
})

test("chain IDs parse from hex and reject junk", () => {
  assert.equal(toChainId("0x14a34"), 84532)
  assert.equal(toChainId(8453), 8453)
  assert.equal(toChainId("base"), null)
})

test("unknown errors fall back to a readable message", () => {
  assert.equal(describeWalletError(new Error("boom")), "boom")
  assert.equal(describeWalletError(undefined), "The wallet request failed.")
})
