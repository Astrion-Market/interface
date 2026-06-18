#!/usr/bin/env node
/**
 * Generate PNG icons from the favicon SVG for PWA manifest and apple-touch-icon.
 * Uses sharp (via npx) to rasterize the SVG at multiple sizes.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, "../apps/web/public")

// The favicon SVG is the logo-mark on a dark rounded-rect background
const svgSource = readFileSync(resolve(publicDir, "favicon.svg"))

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "logo192.png", size: 192 },
  { name: "logo512.png", size: 512 },
]

async function main() {
  // Dynamic import sharp
  const sharp = (await import("sharp")).default

  for (const { name, size } of sizes) {
    const buf = await sharp(svgSource, { density: 400 })
      .resize(size, size)
      .png()
      .toBuffer()

    writeFileSync(resolve(publicDir, name), buf)
    console.log(`✓ ${name} (${size}×${size})`)
  }

  // Also generate favicon.ico (32×32 PNG wrapped — browsers accept PNG in .ico)
  const icoBuf = await sharp(svgSource, { density: 400 })
    .resize(32, 32)
    .png()
    .toBuffer()
  writeFileSync(resolve(publicDir, "favicon.ico"), icoBuf)
  console.log("✓ favicon.ico (32×32)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
