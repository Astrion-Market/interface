import { dripTestAsset } from "../features/faucet/lib/usdc-faucet.server"
import type { Route } from "./+types/api.faucet"

// Resource route (no component): POST JSON { address, asset }, get JSON back.
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 })
  try {
    const input = (await request.json()) as { address?: unknown; asset?: unknown }
    return Response.json(await dripTestAsset({ address: input.address, asset: input.asset }))
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Faucet request failed" }, { status: 400 })
  }
}
