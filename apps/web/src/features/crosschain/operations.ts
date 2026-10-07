// Operation tracking. Updates may arrive twice or out of order; a leg never
// moves backwards, and the same intent can only be registered once.

import type { LegKind, LegStatus, Operation, OperationKind, OperationLeg } from "./lifecycle"
import type { ChainId } from "../lending/lib/identity"

export type TrackedLeg = OperationLeg & {
  // Highest update sequence applied to this leg.
  sequence: number
  updatedAt: string | null
}

export type TrackedOperation = Omit<Operation, "legs"> & {
  legs: Array<TrackedLeg>
  // Client-generated idempotency key for the signed intent.
  intentId: string
  ownerKey: string
  marketKey: string
  amount: bigint
  createdAt: string
  // Simulated runs move no funds and are always labeled.
  simulated: boolean
  // Device cache until the tracking service (C17) confirms it.
  source: "device-cache" | "tracking-service"
}

export type LegUpdate = {
  operationId: string
  legIndex: number
  status: LegStatus
  sequence: number
  txHash?: string
  observedAt: string
}

const RANK: Record<LegStatus, number> = {
  waiting: 0,
  submitted: 1,
  confirmed: 3,
  failed: 2,
  "not-needed": 3,
}

export function ownerKey(owner: { stellar: string | null; evm: string | null }) {
  return `${owner.stellar ?? "-"}|${owner.evm?.toLowerCase() ?? "-"}`
}

export function applyLegUpdate(op: TrackedOperation, update: LegUpdate): TrackedOperation {
  if (update.operationId !== op.id) return op
  const leg = op.legs.at(update.legIndex)
  if (!leg) return op
  // Duplicates and stale deliveries are ignored.
  if (update.sequence <= leg.sequence) return op
  // Never regress. A failed leg can only be superseded by a confirmation
  // (for example, a successful retry).
  if (leg.status === "failed") {
    if (update.status !== "confirmed") return op
  } else if (RANK[update.status] < RANK[leg.status]) return op
  const next: TrackedLeg = {
    ...leg,
    status: update.status,
    sequence: update.sequence,
    updatedAt: update.observedAt,
    txHash: update.txHash ?? leg.txHash,
  }
  return { ...op, legs: op.legs.map((l, i) => (i === update.legIndex ? next : l)) }
}

export function registerOperation(
  ops: Array<TrackedOperation>,
  op: TrackedOperation
): { ops: Array<TrackedOperation>; duplicate: boolean } {
  const existing = ops.find((o) => o.intentId === op.intentId)
  if (existing) return { ops, duplicate: true }
  return { ops: [op, ...ops], duplicate: false }
}

export function legsFor(kind: OperationKind, chain: Exclude<ChainId, "stellar">): Array<{ kind: LegKind; chain: ChainId }> {
  switch (kind) {
    case "lend":
    case "repay":
      return [
        { kind: "source-transfer", chain: "stellar" },
        { kind: "attestation", chain: "stellar" },
        { kind: "destination-mint", chain },
        { kind: "protocol-action", chain },
      ]
    case "borrow":
    case "withdraw":
      return [
        { kind: "protocol-action", chain },
        { kind: "return-transfer", chain },
        { kind: "attestation", chain },
        { kind: "destination-mint", chain: "stellar" },
      ]
  }
}

// bigint-safe persistence for the device cache.
export function serializeOperations(ops: Array<TrackedOperation>): string {
  return JSON.stringify(ops, (_k, v: unknown) => (typeof v === "bigint" ? { $bigint: v.toString() } : v))
}

export function deserializeOperations(text: string): Array<TrackedOperation> {
  const parsed = JSON.parse(text, (_k, v: unknown) =>
    typeof v === "object" && v !== null && "$bigint" in v ? BigInt((v as { $bigint: string }).$bigint) : v
  ) as unknown
  return Array.isArray(parsed) ? (parsed as Array<TrackedOperation>) : []
}
