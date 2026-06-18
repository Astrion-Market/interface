import { Button } from "@workspace/ui/components/button"
import { useTheme } from "../../../../ui/theme-provider"
import type { Theme } from "../../../../ui/theme-provider"

const themeOptions: Array<{
  value: Theme
  label: string
  description: string
}> = [
  {
    value: "system",
    label: "System",
    description: "Follow your device preference.",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use Astrion's dark trading interface.",
  },
  {
    value: "light",
    label: "Light",
    description: "Use a brighter interface.",
  },
]

export function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Configure your Astrion workspace preferences.
        </p>
      </div>

      <section className="max-w-2xl">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[13px] font-medium text-foreground">Theme</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Current appearance: {resolvedTheme}
            </p>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const active = theme === option.value

              return (
                <Button
                  key={option.value}
                  variant={active ? "secondary" : "outline"}
                  className={[
                    "h-auto min-h-24 flex-col items-start justify-start gap-2 p-3 text-left whitespace-normal",
                    active ? "border-primary/50 ring-1 ring-primary/30" : "",
                  ].join(" ")}
                  aria-pressed={active}
                  onClick={() => setTheme(option.value)}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">
                      {option.label}
                    </span>
                    <span
                      className={[
                        "size-2 rounded-full",
                        active ? "bg-primary" : "bg-muted-foreground/30",
                      ].join(" ")}
                    />
                  </span>
                  <span className="text-[11px] leading-4 text-muted-foreground">
                    {option.description}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
