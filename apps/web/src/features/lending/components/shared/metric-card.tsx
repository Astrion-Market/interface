type Props = {
  label: string
  value: string
  sub?: string
  accent?: "default" | "green" | "amber" | "red" | "blue"
}

const accentClasses = {
  default: "text-foreground",
  green: "text-emerald-500",
  amber: "text-amber-500",
  red: "text-red-500",
  blue: "text-blue-400",
}

export function MetricCard({ label, value, sub, accent = "default" }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums ${accentClasses[accent]}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}
