// Operation lifecycle driven by observed chain events. A source confirmation
// never means the lending action is complete.

import type { StepStatus, TimelineStep } from "@workspace/ui/components/step-timeline"
import type { ChainId } from "../lending/lib/identity"

export type LegKind =
  | "source-transfer"
  | "attestation"
  | "destination-mint"
  | "protocol-action"
  | "return-transfer"

export type LegStatus = "waiting" | "submitted" | "confirmed" | "failed" | "not-needed"

export type OperationLeg = {
  kind: LegKind
  chain: ChainId
  status: LegStatus
  txHash: string | null
}

export type OperationKind = "lend" | "borrow" | "repay" | "withdraw"

export type Operation = {
  id: string
  kind: OperationKind
  legs: Array<OperationLeg>
}

export type OperationStatus =
  | { state: "in-progress"; label: string }
  | { state: "needs-action"; label: string }
  | { state: "complete"; label: string }

const CHAIN_NAME: Record<ChainId, string> = { stellar: "Stellar", base: "Base", ethereum: "Ethereum" }

export const LEG_LABEL: Record<LegKind, string> = {
  "source-transfer": "Source transfer",
  attestation: "Bridge attestation",
  "destination-mint": "USDC arrives",
  "protocol-action": "Lending action",
  "return-transfer": "Return transfer",
}

export function operationStatus(op: Operation): OperationStatus {
  const failed = op.legs.find((leg) => leg.status === "failed")
  if (failed) {
    const minted = op.legs.find((leg) => leg.kind === "destination-mint")
    if (failed.kind === "protocol-action" && minted?.status === "confirmed")
      return { state: "needs-action", label: `Funds available on ${CHAIN_NAME[failed.chain]}` }
    if (failed.kind === "return-transfer")
      return {
        state: "needs-action",
        label: op.kind === "borrow" ? "Borrowed; USDC not yet sent to Stellar" : "Withdrawn; USDC not yet sent to Stellar",
      }
    return { state: "needs-action", label: `${LEG_LABEL[failed.kind]} needs attention` }
  }

  const actionIndex = op.legs.findIndex((leg) => leg.kind === "protocol-action")
  const actionDone = actionIndex !== -1 && op.legs[actionIndex].status === "confirmed"
  // Any leg after the action still outstanding means USDC hasn't reached Stellar.
  const returnPending = op.legs
    .slice(actionIndex + 1)
    .some((leg) => leg.status !== "confirmed" && leg.status !== "not-needed")

  if (actionDone && returnPending && op.kind === "borrow")
    return { state: "in-progress", label: "Borrow opened; transfer to Stellar pending" }
  if (actionDone && returnPending && op.kind === "withdraw")
    return { state: "in-progress", label: "Withdrawn; transfer to Stellar pending" }

  const done = op.legs.every((leg) => leg.status === "confirmed" || leg.status === "not-needed")
  if (done) return { state: "complete", label: "Complete" }
  return { state: "in-progress", label: "In progress" }
}

const STEP_STATUS: Record<LegStatus, StepStatus> = {
  waiting: "pending",
  submitted: "current",
  confirmed: "complete",
  failed: "failed",
  "not-needed": "skipped",
}

export function operationTimeline(op: Operation): Array<TimelineStep> {
  return op.legs.map((leg, index) => ({
    id: `${op.id}-${index}`,
    label: LEG_LABEL[leg.kind],
    status: STEP_STATUS[leg.status],
  }))
}
