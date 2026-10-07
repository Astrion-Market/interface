import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { cn } from "@workspace/ui/lib/utils"
import { ROUTE_EVM_NETWORKS } from "../../crosschain/env"
import { shortenIdentifier } from "../../lending/lib/amounts"
import { useEvmWallet } from "./evm-wallet-provider"

export function EvmConnectButton({ className }: { className?: string }) {
  const { session, wallets, networkName, isSupportedChain, connect, disconnect, switchChain } = useEvmWallet()
  const base = cn("h-9 w-full justify-between px-3 text-[12px]", className)

  if (session.status !== "connected" || !session.account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className={base} disabled={session.status === "connecting"}>
              <span>{session.status === "connecting" ? "Check your wallet" : "Connect EVM"}</span>
              <span aria-hidden="true" className="text-muted-foreground">›</span>
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>EVM wallets in this browser</DropdownMenuLabel>
          {wallets.length === 0 ? (
            <p className="px-2 py-1.5 text-[12px] text-muted-foreground">
              No EVM wallet found. Install or unlock a browser wallet, then reload.
            </p>
          ) : (
            wallets.map((w) => (
              <DropdownMenuItem key={w.info.rdns} onClick={() => void connect(w.info.rdns)}>
                <img src={w.info.icon} alt="" className="size-4 rounded-sm" />
                {w.info.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className={base}>
            <span className="truncate font-mono">{shortenIdentifier(session.account, 4, 4)}</span>
            {isSupportedChain ? (
              <span className="text-muted-foreground">{networkName}</span>
            ) : (
              <StatusBadge tone="attention">Wrong network</StatusBadge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>EVM wallet</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <p className="font-mono text-[11px] break-all text-foreground">{session.account}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{networkName ?? "Unknown network"}</p>
        </div>
        <DropdownMenuSeparator />
        {Object.values(ROUTE_EVM_NETWORKS).map((network) =>
          network.chainId === session.chainId ? null : (
            <DropdownMenuItem key={network.chainId} onClick={() => void switchChain(network.chainId)}>
              Switch to {network.name}
            </DropdownMenuItem>
          )
        )}
        <DropdownMenuItem variant="destructive" onClick={() => void disconnect()}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
