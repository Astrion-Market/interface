import { redirect } from "react-router"
import { FaucetPage } from "../features/faucet/components/faucet-page"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { IS_STELLAR_TESTNET } from "../features/lending/lib/network"

export function loader() {
  if (!IS_STELLAR_TESTNET) throw redirect("/legacy")
  return null
}

export default function Page() {
  return (
    <AppLayout>
      <FaucetPage />
    </AppLayout>
  )
}
