"use client"

import { Button } from "@workspace/ui/components/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"
import { ConnectWalletButton } from "../../wallet/connect-wallet-button"
import { useWallet } from "../../wallet/wallet-provider"
import { lendingQueryKeys } from "../../lending/hooks/queries/query-keys"
import { TOKENS } from "../../lending/lib/astrion-contracts"
import { dripTestAsset } from "../lib/usdc-faucet"
import type { FaucetAssetSymbol } from "../lib/usdc-faucet"

type FaucetAsset = {
  symbol: FaucetAssetSymbol
  amount: string
  contractId: string
  description: string
}

const FAUCET_ASSETS: Array<FaucetAsset> = [
  {
    symbol: "USDC",
    amount: "1,000 USDC",
    contractId: TOKENS.USDC.contractId,
    description: "Primary test liquidity for supplying and repaying.",
  },
  {
    symbol: "WBTC",
    amount: "0.01 WBTC",
    contractId: TOKENS.WBTC.contractId,
    description: "Test collateral asset for WBTC market flows.",
  },
]

export function FaucetPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Token Faucet</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Drip test USDC and WBTC to your connected Stellar testnet wallet.
        </p>
      </div>

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        {FAUCET_ASSETS.map((asset) => (
          <FaucetAssetCard key={asset.symbol} asset={asset} />
        ))}
      </div>
    </div>
  )
}

function FaucetAssetCard({ asset }: { asset: FaucetAsset }) {
  const { address, refreshBalance } = useWallet()
  const queryClient = useQueryClient()
  const drip = useServerFn(dripTestAsset)
  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Connect your wallet first")
      }

      return drip({ data: { address, asset: asset.symbol } })
    },
    onSuccess: async (result) => {
      toast.success(`${result.asset} dripped`, {
        description: result.hash
          ? `Tx ${result.hash.slice(0, 10)}...${result.hash.slice(-8)}`
          : result.amount,
      })
      await Promise.all([
        refreshBalance(),
        queryClient.invalidateQueries({ queryKey: lendingQueryKeys.all }),
      ])
    },
    onError: (error) => {
      toast.error("Faucet failed", {
        description: error instanceof Error ? error.message : undefined,
      })
    },
  })

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            Faucet amount
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {asset.amount}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {asset.description}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Contract: {asset.contractId.slice(0, 10)}...
            {asset.contractId.slice(-8)}
          </p>
        </div>
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[11px] font-medium text-emerald-500">
          Testnet
        </div>
      </div>

      <div className="mt-5 rounded-md border border-border bg-background/40 p-3">
        <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
          Recipient
        </p>
        <p className="mt-1 font-mono text-[12px] break-all text-foreground">
          {address ?? "No wallet connected"}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {address ? (
          <Button
            size="lg"
            className="sm:w-40"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Dripping" : `Drip ${asset.symbol}`}
          </Button>
        ) : (
          <ConnectWalletButton placement="header" className="sm:w-40" />
        )}
        {mutation.data?.explorerUrl ? (
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.open(mutation.data.explorerUrl!, "_blank")}
          >
            View transaction
          </Button>
        ) : null}
      </div>
    </div>
  )
}
