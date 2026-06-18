import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

async function svgToPngBlob(svgPath: string, width: number, height: number): Promise<Blob> {
  const res = await fetch(svgPath)
  const svgText = await res.text()
  const svgBlob = new Blob([svgText], { type: "image/svg+xml" })
  const svgUrl = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(svgUrl)
        reject(new Error("No 2D context"))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(svgUrl)
          if (blob) resolve(blob)
          else reject(new Error("toBlob returned null"))
        },
        "image/png",
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      reject(new Error("Image load failed"))
    }
    img.src = svgUrl
  })
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export function BrandPage() {
  const [profileDownloading, setProfileDownloading] = useState(false)
  const [bannerDownloading, setBannerDownloading] = useState(false)

  async function handleProfileDownload() {
    setProfileDownloading(true)
    try {
      const blob = await svgToPngBlob("/x-profile.svg", 512, 512)
      const url = URL.createObjectURL(blob)
      triggerDownload(url, "astrion-profile.png")
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to export PNG — try downloading the SVG instead.")
    } finally {
      setProfileDownloading(false)
    }
  }

  async function handleBannerDownload() {
    setBannerDownloading(true)
    try {
      const blob = await svgToPngBlob("/x-banner.svg", 1500, 500)
      const url = URL.createObjectURL(blob)
      triggerDownload(url, "astrion-x-banner.png")
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to export PNG — try downloading the SVG instead.")
    } finally {
      setBannerDownloading(false)
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Brand Assets</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Download Astrion assets sized for X (Twitter).
        </p>
      </div>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {/* ── Profile Picture ── */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Profile Picture
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                512 × 512 · displayed as circle on X
              </p>
            </div>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70">
              PNG
            </span>
          </div>

          <div className="flex items-center justify-center p-10">
            <div className="size-28 overflow-hidden rounded-full ring-2 ring-border shadow-sm">
              <img
                src="/x-profile.svg"
                alt="Astrion profile picture"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2 px-4 pb-4">
            <Button
              variant="outline"
              className="w-full gap-2 text-[13px]"
              onClick={handleProfileDownload}
              disabled={profileDownloading}
            >
              <DownloadIcon />
              {profileDownloading ? "Exporting…" : "Download PNG"}
            </Button>
            <a href="/x-profile.svg" download="astrion-profile.svg" className="block">
              <Button
                variant="ghost"
                className="w-full gap-2 text-[13px] text-muted-foreground"
              >
                <DownloadIcon />
                Download SVG
              </Button>
            </a>
          </div>
        </div>

        {/* ── X Banner ── */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">
                X Banner
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                1500 × 500 · profile header
              </p>
            </div>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70">
              PNG
            </span>
          </div>

          <div className="p-4">
            <div className="w-full overflow-hidden rounded-md ring-1 ring-border">
              <img
                src="/x-banner.svg"
                alt="Astrion X banner preview"
                className="block h-auto w-full"
              />
            </div>
          </div>

          <div className="space-y-2 px-4 pb-4">
            <Button
              variant="outline"
              className="w-full gap-2 text-[13px]"
              onClick={handleBannerDownload}
              disabled={bannerDownloading}
            >
              <DownloadIcon />
              {bannerDownloading ? "Exporting…" : "Download PNG"}
            </Button>
            <a href="/x-banner.svg" download="astrion-x-banner.svg" className="block">
              <Button
                variant="ghost"
                className="w-full gap-2 text-[13px] text-muted-foreground"
              >
                <DownloadIcon />
                Download SVG
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
