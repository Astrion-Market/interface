import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useEvmWallet } from "../wallet/evm/evm-wallet-provider"
import { useWallet } from "../wallet/wallet-provider"
import {
  applyLegUpdate,
  deserializeOperations,
  legsFor,
  ownerKey,
  registerOperation,
  serializeOperations,
} from "./operations"
import type { ReactNode } from "react"
import type { OperationKind } from "./lifecycle"
import type { LegUpdate, TrackedOperation } from "./operations"

// Device cache only. The tracking service (C17) becomes the source of truth;
// until then every cached status is labeled as such and simulations are the
// only operations that can exist.
const STORAGE_KEY = "astrion.operations.v1"

export type SimulationScenario = "success" | "action-fails"

type OperationsContextValue = {
  // Operations for the currently connected wallets only.
  operations: Array<TrackedOperation>
  hiddenCount: number
  currentOwnerKey: string
  find: (id: string) => TrackedOperation | undefined
  startSimulation: (input: {
    intentId: string
    kind: OperationKind
    chain: "base" | "ethereum"
    marketKey: string
    amount: bigint
    scenario: SimulationScenario
  }) => { id: string; duplicate: boolean }
  clearSimulations: () => void
}

const OperationsContext = createContext<OperationsContextValue | null>(null)

function load(): Array<TrackedOperation> {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    return text ? deserializeOperations(text) : []
  } catch {
    return []
  }
}

export function OperationsProvider({ children }: { children: ReactNode }) {
  const stellar = useWallet()
  const evm = useEvmWallet()
  const [all, setAll] = useState<Array<TrackedOperation>>([])
  const loaded = useRef(false)
  const allRef = useRef(all)
  allRef.current = all
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  useEffect(() => {
    setAll(load())
    loaded.current = true
    return () => timers.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem(STORAGE_KEY, serializeOperations(all))
    } catch {
      /* storage unavailable: tracking still works for this tab */
    }
  }, [all])

  const currentOwnerKey = ownerKey({ stellar: stellar.address, evm: evm.session.account })

  const apply = useCallback((update: LegUpdate) => {
    setAll((ops) => ops.map((op) => applyLegUpdate(op, update)))
  }, [])

  const startSimulation = useCallback<OperationsContextValue["startSimulation"]>(
    (input) => {
      const id = `sim-${input.intentId}`
      const op: TrackedOperation = {
        id,
        kind: input.kind,
        intentId: input.intentId,
        ownerKey: currentOwnerKey,
        marketKey: input.marketKey,
        amount: input.amount,
        createdAt: new Date().toISOString(),
        simulated: true,
        source: "device-cache",
        legs: legsFor(input.kind, input.chain).map((leg) => ({
          ...leg,
          status: "waiting",
          txHash: null,
          sequence: 0,
          updatedAt: null,
        })),
      }
      if (registerOperation(allRef.current, op).duplicate) return { id, duplicate: true }
      setAll((ops) => registerOperation(ops, op).ops)

      // Each leg is submitted, then confirmed. If the protocol action fails,
      // the legs after it are not needed.
      const steps: Array<Omit<LegUpdate, "operationId" | "observedAt">> = []
      let failed = false
      op.legs.forEach((leg, legIndex) => {
        if (failed) {
          steps.push({ legIndex, status: "not-needed", sequence: 1 })
          return
        }
        steps.push({ legIndex, status: "submitted", sequence: 1, txHash: `simulated-${id}-${legIndex}` })
        failed = input.scenario === "action-fails" && leg.kind === "protocol-action"
        steps.push({ legIndex, status: failed ? "failed" : "confirmed", sequence: 2 })
      })
      steps.forEach((step, i) => {
        timers.current.push(
          setTimeout(() => apply({ ...step, operationId: id, observedAt: new Date().toISOString() }), 1200 * (i + 1))
        )
      })
      return { id, duplicate: false }
    },
    [apply, currentOwnerKey]
  )

  const value = useMemo<OperationsContextValue>(() => {
    const operations = all.filter((op) => op.ownerKey === currentOwnerKey)
    return {
      operations,
      hiddenCount: all.length - operations.length,
      currentOwnerKey,
      find: (id) => operations.find((op) => op.id === id),
      startSimulation,
      clearSimulations: () => setAll((ops) => ops.filter((op) => !op.simulated)),
    }
  }, [all, currentOwnerKey, startSimulation])

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>
}

export function useOperations() {
  const value = useContext(OperationsContext)
  if (!value) throw new Error("useOperations must be used inside OperationsProvider")
  return value
}
