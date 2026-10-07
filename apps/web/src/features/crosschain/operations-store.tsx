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
      let duplicate = false
      setAll((ops) => {
        const result = registerOperation(ops, op)
        duplicate = result.duplicate
        return result.ops
      })
      if (duplicate) return { id, duplicate }

      // Each leg is submitted, then confirmed; the protocol action may fail.
      const steps: Array<Omit<LegUpdate, "operationId" | "observedAt">> = []
      op.legs.forEach((leg, legIndex) => {
        const fails = input.scenario === "action-fails" && leg.kind === "protocol-action"
        steps.push({ legIndex, status: "submitted", sequence: 1, txHash: `simulated-${id}-${legIndex}` })
        steps.push({ legIndex, status: fails ? "failed" : "confirmed", sequence: 2 })
        if (fails) {
          // Nothing after a failed action runs.
          for (let rest = legIndex + 1; rest < op.legs.length; rest++)
            steps.push({ legIndex: rest, status: "not-needed", sequence: 1 })
        }
      })
      const cut = steps.findIndex((s) => s.status === "failed")
      const run = cut === -1 ? steps : steps.slice(0, cut + 1 + (op.legs.length - 1 - (steps[cut].legIndex)))
      run.forEach((step, i) => {
        timers.current.push(
          setTimeout(() => apply({ ...step, operationId: id, observedAt: new Date().toISOString() }), 1200 * (i + 1))
        )
      })
      return { id, duplicate }
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
