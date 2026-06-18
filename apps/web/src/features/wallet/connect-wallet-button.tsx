"use client"

import {
  ArrowDown01Icon,
  Logout03Icon,
  RefreshIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { useWallet } from "./wallet-provider"

type ConnectWalletButtonPlacement = "header" | "sidebar" | "mobile"

type ConnectWalletButtonProps = {
  placement?: ConnectWalletButtonPlacement
  className?: string
}

function truncateAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`
}

function formatXlmBalance(balance: string | null) {
  if (!balance) return "—"

  const amount = Number(balance)
  if (!Number.isFinite(amount)) return "—"

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(amount)} XLM`
}

const placementStyles: Record<ConnectWalletButtonPlacement, string> = {
  header: "h-[38px] px-4 text-[13.5px]",
  sidebar: "h-9 w-full justify-between px-3 text-[12px]",
  mobile: "h-8 px-3 text-[11px]",
}

export function ConnectWalletButton({
  placement = "header",
  className,
}: ConnectWalletButtonProps) {
  const {
    address,
    xlmBalance,
    isConnecting,
    isBalanceLoading,
    connect,
    disconnect,
    refreshBalance,
  } = useWallet()

  const buttonClassName = cn(placementStyles[placement], className)
  const align =
    placement === "header" || placement === "mobile" ? "end" : "start"

  if (!address) {
    return (
      <Button
        variant={placement === "sidebar" ? "outline" : "outline"}
        className={buttonClassName}
        disabled={isConnecting}
        onClick={() => void connect()}
      >
        <HugeiconsIcon icon={Wallet02Icon} strokeWidth={1.8} />
        <span>{isConnecting ? "Connecting" : "Connect"}</span>
        {placement === "sidebar" ? (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={1.8}
            className="-rotate-90"
          />
        ) : null}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className={buttonClassName}>
            <span className="flex min-w-0 items-center gap-2">
              <HugeiconsIcon icon={Wallet02Icon} strokeWidth={1.8} />
              <span className="truncate">{truncateAddress(address)}</span>
            </span>
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.8} />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <p className="truncate font-mono text-[11px] text-foreground">
            {address}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Stellar Testnet
          </p>
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-xs text-muted-foreground">XLM Balance</span>
          <span className="font-mono text-xs text-foreground">
            {isBalanceLoading ? "Loading" : formatXlmBalance(xlmBalance)}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void refreshBalance()}>
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.8} />
          Refresh balance
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void disconnect()}
        >
          <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.8} />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
