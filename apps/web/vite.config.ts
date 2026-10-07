import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  // Production server builds bundle every dependency so the Vercel function
  // (scripts/vercel-output.mjs) runs without node_modules. Dev keeps them
  // external for fast SSR reloads.
  ssr: command === "build" ? { noExternal: true } : undefined,
}))
