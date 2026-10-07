// Recovery guidance. Every recoverable state maps to one correct next action,
// and no retry ever repeats a confirmed burn or lending action.

import { shortenIdentifier } from "../lending/lib/amounts.ts"
import type { TrackedOperation } from "./operations"

export type RecoveryCase =
  | "delayed-attestation"
  | "insufficient-gas"
  | "trustline-missing"
  | "already-minted"
  | "action-failed"
  | "intent-expired"
  | "relayer-outage"
  | "protocol-paused"
  | "return-not-sent"

export type RecoveryAction =
  | "wait"
  | "add-gas"
  | "add-trustline"
  | "self-submit"
  | "retry-action"
  | "new-quote"
  | "return-to-stellar"
  | "withdraw-to-evm"
  | "refresh"

export type RecoveryGuide = {
  case: RecoveryCase
  title: string
  explanation: string
  // First action is the recommended one.
  actions: Array<RecoveryAction>
}

export const ACTION_TEXT: Record<RecoveryAction, string> = {
  wait: "Wait; nothing to do yet",
  "add-gas": "Add ETH for network fees, then retry",
  "add-trustline": "Add a USDC trustline to the Stellar recipient",
  "self-submit": "Submit the attested transfer yourself",
  "retry-action": "Retry the lending action",
  "new-quote": "Get a new quote with the funds already delivered",
  "return-to-stellar": "Send the USDC back to Stellar",
  "withdraw-to-evm": "Withdraw the USDC to your EVM wallet",
  refresh: "Refresh status",
}

const GUIDES: Record<RecoveryCase, Omit<RecoveryGuide, "case">> = {
  "delayed-attestation": {
    title: "The bridge attestation is taking longer than usual",
    explanation: "The burn is confirmed and can't be cancelled. Circle's attestation will arrive; your funds aren't lost.",
    actions: ["wait", "refresh"],
  },
  "insufficient-gas": {
    title: "Not enough ETH to pay network fees",
    explanation: "The step didn't run because the paying account ran out of gas. Nothing after it has happened.",
    actions: ["add-gas"],
  },
  "trustline-missing": {
    title: "The Stellar recipient can't receive USDC yet",
    explanation: "The transfer is attested but can't be delivered until the recipient account trusts Circle USDC.",
    actions: ["add-trustline", "self-submit"],
  },
  "already-minted": {
    title: "This transfer was already delivered",
    explanation: "A repeat submission found the USDC already minted. No funds moved twice; refresh to see the delivered balance.",
    actions: ["refresh"],
  },
  "action-failed": {
    title: "The USDC arrived, but the lending action didn't complete",
    explanation: "Your USDC is in your execution account and isn't earning interest. Nothing was supplied, borrowed, or repaid.",
    actions: ["retry-action", "return-to-stellar", "withdraw-to-evm"],
  },
  "intent-expired": {
    title: "The signed action expired before it ran",
    explanation: "Delivered funds are safe in your execution account. An expired intent can't be reused; review a new quote.",
    actions: ["new-quote", "return-to-stellar", "withdraw-to-evm"],
  },
  "relayer-outage": {
    title: "Astrion's relayer is unavailable",
    explanation: "Your transfer is attested and doesn't depend on Astrion to finish. You can submit it yourself.",
    actions: ["self-submit", "wait"],
  },
  "protocol-paused": {
    title: "The lending protocol paused this action",
    explanation: "The protocol, not Astrion, is blocking this step. Funds stay in your execution account until it reopens.",
    actions: ["wait", "return-to-stellar", "withdraw-to-evm"],
  },
  "return-not-sent": {
    title: "Withdrawn on the lending chain; USDC not yet sent to Stellar",
    explanation: "The withdrawal is complete and the USDC is in your execution account. Only the transfer to Stellar is outstanding.",
    actions: ["return-to-stellar", "withdraw-to-evm"],
  },
}

const DELAY_MS = 30 * 60_000

export function diagnose(op: TrackedOperation, now: number): Array<RecoveryGuide> {
  const cases = new Set<RecoveryCase>()
  op.legs.forEach((leg, i) => {
    if (leg.status === "failed") {
      switch (leg.reason) {
        case "insufficient-gas":
        case "trustline-missing":
        case "already-minted":
        case "intent-expired":
        case "relayer-outage":
        case "protocol-paused":
          cases.add(leg.reason === "intent-expired" ? "intent-expired" : leg.reason)
          break
        default:
          if (leg.kind === "protocol-action") cases.add("action-failed")
          else if (leg.kind === "return-transfer") cases.add("return-not-sent")
      }
    }
    // An attestation outstanding long after the previous step confirmed.
    const previous = op.legs.at(i - 1)
    if (
      i > 0 &&
      leg.kind === "attestation" &&
      (leg.status === "waiting" || leg.status === "submitted") &&
      previous?.status === "confirmed" &&
      previous.updatedAt &&
      now - Date.parse(previous.updatedAt) > DELAY_MS
    )
      cases.add("delayed-attestation")
  })
  return [...cases].map((c) => ({ case: c, ...GUIDES[c] }))
}

// Legs a retry may submit again. Never a confirmed leg, and nothing at or
// before a confirmed burn (source or return transfer) can be redone.
export function retryPlan(op: TrackedOperation): Array<number> {
  let floor = -1
  op.legs.forEach((leg, i) => {
    if ((leg.kind === "source-transfer" || leg.kind === "return-transfer") && leg.status === "confirmed") floor = i
  })
  return op.legs
    .map((leg, i) => ({ leg, i }))
    .filter(({ leg, i }) => i > floor && (leg.status === "failed" || leg.status === "waiting"))
    .map(({ i }) => i)
}

// Shareable diagnostics: statuses, reasons, and hashes; identities shortened.
export function redactedDiagnostics(op: TrackedOperation) {
  return {
    operation: op.id,
    kind: op.kind,
    simulated: op.simulated,
    source: op.source,
    market: op.marketKey,
    owner: op.ownerKey
      .split("|")
      .map((part) => (part === "-" ? part : shortenIdentifier(part, 4, 4)))
      .join("|"),
    createdAt: op.createdAt,
    legs: op.legs.map((leg) => ({
      kind: leg.kind,
      chain: leg.chain,
      status: leg.status,
      reason: leg.reason ?? null,
      txHash: leg.txHash,
      updatedAt: leg.updatedAt,
    })),
  }
}
