import { Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/video-demo")({ component: VideoDemoPage })

function VideoDemoPage() {
  const [hasVideo, setHasVideo] = useState(false)

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(108,182,255,0.16) 0%, rgba(45,212,191,0.08) 42%, transparent 70%)",
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-mono-num text-label inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            Astrion
          </Link>
          <Link
            to="/dashboard"
            className="text-label rounded-md border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            Open the app
          </Link>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.35fr] lg:gap-12">
          <div>
            <div className="font-mono-num text-label-xs inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1 uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Alpha demo
            </div>
            <h1 className="text-display-compact mt-5 max-w-2xl text-foreground">
              Astrion video demo
            </h1>
            <p className="text-copy mt-5 max-w-xl text-muted-foreground">
              A walkthrough of the cross-chain alpha interface on preview data.
              Routes are not live and no funds move in the demo.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["01", "Aave, Morpho, and Compound markets"],
                ["02", "Review: route, fees, and signatures"],
                ["03", "Tracking and recovery (simulated)"],
              ].map(([step, label]) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card/70 p-3"
                >
                  <span className="font-mono-num flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[11px] text-primary">
                    {step}
                  </span>
                  <span className="text-label text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-black/30">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="font-mono-num text-[10px] text-muted-foreground">
                  astrion · video-demo.mp4
                </span>
              </div>

              <div className="relative aspect-video bg-muted/20">
                <video
                  controls
                  preload="metadata"
                  poster="/og-image.svg"
                  className="h-full w-full bg-background object-cover"
                  onCanPlay={() => setHasVideo(true)}
                >
                  <source
                    src="/video-demo.mp4"
                    type="video/mp4"
                    onError={() => setHasVideo(false)}
                  />
                </video>

                {!hasVideo && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                    <div className="max-w-sm rounded-xl border border-border bg-background/85 p-5 text-center shadow-xl backdrop-blur">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-heading-card mt-4 text-foreground">
                        Demo video placeholder
                      </p>
                      <p className="text-copy-sm mt-2 text-muted-foreground">
                        The video will appear here when the demo file is added.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
