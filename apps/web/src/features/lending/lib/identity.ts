// Display identity for chains and protocols. These records describe how to
// label a chain or protocol; they do not mean Astrion supports it yet.

export const EXECUTION_CHAIN_IDS = ["base", "ethereum"] as const
export const CHAIN_IDS = ["stellar", ...EXECUTION_CHAIN_IDS] as const
export const PROTOCOL_IDS = ["aave-v3", "morpho-blue", "compound-v3"] as const

export type ChainId = (typeof CHAIN_IDS)[number]
export type ExecutionChainId = (typeof EXECUTION_CHAIN_IDS)[number]
export type ProtocolId = (typeof PROTOCOL_IDS)[number]

type Identity = {
  label: string
  // Two-letter monogram; always rendered next to the label, never alone.
  mark: string
  markClass: string
}

export const CHAINS: Record<ChainId, Identity> = {
  stellar: {
    label: "Stellar",
    mark: "St",
    markClass: "bg-foreground text-background",
  },
  base: {
    label: "Base",
    mark: "Ba",
    markClass: "bg-[#0052FF] text-white",
  },
  ethereum: {
    label: "Ethereum",
    mark: "Et",
    markClass: "bg-[#627EEA] text-white",
  },
}

export const PROTOCOLS: Record<ProtocolId, Identity & { version: string }> = {
  "aave-v3": {
    label: "Aave",
    version: "V3",
    mark: "Aa",
    markClass: "bg-[#9391F7]/20 text-[#5B58D6] dark:text-[#B6B4FF]",
  },
  "morpho-blue": {
    label: "Morpho",
    version: "Blue",
    mark: "Mo",
    markClass: "bg-[#2470FF]/15 text-[#1F5FDB] dark:text-[#7FAAFF]",
  },
  "compound-v3": {
    label: "Compound",
    version: "III",
    mark: "Co",
    markClass: "bg-[#00D395]/15 text-[#008F65] dark:text-[#4DE3B5]",
  },
}

export function isExecutionChainId(value: string): value is ExecutionChainId {
  return (EXECUTION_CHAIN_IDS as ReadonlyArray<string>).includes(value)
}

export function isProtocolId(value: string): value is ProtocolId {
  return (PROTOCOL_IDS as ReadonlyArray<string>).includes(value)
}
