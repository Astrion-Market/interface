type FilterType = "all" | "isolated"

type Props = {
  search: string
  onSearchChange: (v: string) => void
  filter: FilterType
  onFilterChange: (v: FilterType) => void
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All Markets", value: "all" },
  { label: "Isolated Risk", value: "isolated" },
]

export function MarketFilters({ search, onSearchChange, filter, onFilterChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search markets..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-52 rounded-md border border-border bg-background pl-8 pr-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
      </div>

      {/* Type filter */}
      <div className="flex rounded-md border border-border overflow-hidden">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 text-[12px] transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
