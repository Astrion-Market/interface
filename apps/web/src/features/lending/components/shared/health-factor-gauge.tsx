import { ChartContainer } from "@workspace/ui/components/chart"
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import type { ChartConfig } from "@workspace/ui/components/chart"

type Props = {
  value: number | null
  size?: "sm" | "md" | "lg"
}

function getColor(value: number | null) {
  if (value === null) {
    return {
      fill: "var(--muted-foreground)",
      text: "text-muted-foreground",
      label: "N/A",
    }
  }
  if (value >= 1.5) {
    return { fill: "#10b981", text: "text-emerald-500", label: "Safe" }
  }
  if (value >= 1.2) {
    return { fill: "#f59e0b", text: "text-amber-500", label: "Moderate" }
  }
  if (value >= 1.0) {
    return { fill: "#ef4444", text: "text-red-500", label: "High Risk" }
  }
  return { fill: "#dc2626", text: "text-red-600", label: "Liquidatable" }
}

const sizeMap = {
  sm: {
    chart: "h-[86px] w-[86px]",
    fontSize: "text-base",
    subFontSize: "text-[9px]",
  },
  md: {
    chart: "h-[112px] w-[112px]",
    fontSize: "text-2xl",
    subFontSize: "text-[10px]",
  },
  lg: {
    chart: "h-[140px] w-[140px]",
    fontSize: "text-3xl",
    subFontSize: "text-xs",
  },
}

export function HealthFactorGauge({ value, size = "md" }: Props) {
  const { fill, text, label } = getColor(value)
  const { chart, fontSize, subFontSize } = sizeMap[size]
  const chartValue = value === null ? 0 : Math.min(Math.max(value, 0), 3)
  const chartConfig = {
    health: {
      label: "Health Factor",
      color: fill,
    },
  } satisfies ChartConfig

  return (
    <div className="relative flex flex-col items-center">
      <ChartContainer config={chartConfig} className={chart}>
        <RadialBarChart
          data={[{ health: chartValue, fill: "var(--color-health)" }]}
          startAngle={220}
          endAngle={-40}
          innerRadius="74%"
          outerRadius="98%"
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 3]}
            tick={false}
            axisLine={false}
          />
          <RadialBar
            dataKey="health"
            background
            cornerRadius={12}
            fill="var(--color-health)"
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className={`font-mono font-bold tabular-nums ${fontSize} ${text}`}>
          {value === null ? "—" : value.toFixed(2)}
        </span>
        <span className={`${subFontSize} text-muted-foreground`}>{label}</span>
      </div>
    </div>
  )
}
