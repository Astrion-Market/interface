// Package the React Router build for Vercel's Build Output API (v3).
//
// TanStack Start's Nitro build used to emit .vercel/output by itself. React
// Router writes build/client and build/server instead, so this script turns
// them into what Vercel deploys: static assets plus one Node function that
// server-renders every other request. `bun run build:vercel` builds first.
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..")
// Vercel reads .vercel/output from the project's Root Directory. The build
// command passes it as `--out`; default to this app's directory.
const outFlag = process.argv.indexOf("--out")
const output = outFlag === -1 ? join(app, ".vercel/output") : resolve(process.argv[outFlag + 1])
const client = join(app, "build/client")
const server = join(app, "build/server/index.js")

if (!existsSync(client) || !existsSync(server)) {
  throw new Error("Run `react-router build` before packaging for Vercel.")
}

rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })

// 1. Static assets, served before the function.
cpSync(client, join(output, "static"), { recursive: true })

// 2. The server function, bundled with its dependencies into one file.
const fn = join(output, "functions/index.func")
mkdirSync(fn, { recursive: true })
const entry = join(app, "build/vercel-entry.mjs")
writeFileSync(
  entry,
  `import { createRequestListener } from "@react-router/node"
import * as build from "./server/index.js"

export default createRequestListener({ build, mode: "production" })
`
)
execFileSync(
  "bun",
  ["build", entry, "--target=node", "--format=esm", "--outfile", join(fn, "index.mjs")],
  { stdio: "inherit", cwd: app }
)
rmSync(entry)
writeFileSync(
  join(fn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2
  )
)

// 3. Routing: long-cache fingerprinted assets, files first, then the server.
writeFileSync(
  join(output, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: "^/assets/(.*)$",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        { handle: "filesystem" },
        { src: "^/(.*)$", dest: "/index" },
      ],
    },
    null,
    2
  )
)

console.log(`Vercel output written to ${output}`)
