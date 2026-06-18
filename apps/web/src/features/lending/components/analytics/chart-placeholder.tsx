type Props = {
  title: string
  subtitle?: string
  height?: string
}

export function ChartPlaceholder({ title, subtitle, height = "h-48" }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={`flex flex-col items-center justify-center ${height} gap-2`}>
        {/* Simple decorative grid/chart placeholder */}
        <svg width="120" height="60" viewBox="0 0 120 60" className="text-muted/60">
          {/* Grid lines */}
          {[0, 15, 30, 45, 60].map((y) => (
            <line key={y} x1="0" y1={y} x2="120" y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          ))}
          {/* Fake area chart */}
          <path
            d="M0 55 C15 40 25 45 35 30 C45 15 55 35 65 25 C75 15 85 35 95 20 C105 5 115 15 120 10 L120 60 L0 60 Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </svg>
        <p className="text-[11px] text-muted-foreground">Chart data will appear once the protocol launches</p>
      </div>
    </div>
  )
}
