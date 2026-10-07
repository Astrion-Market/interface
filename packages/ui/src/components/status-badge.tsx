import { cva } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

import type { VariantProps } from "class-variance-authority"

const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "border-success/30 bg-success-surface text-success",
        attention: "border-attention/30 bg-attention-surface text-attention",
        risk: "border-risk/30 bg-risk-surface text-risk",
        pending: "border-pending/25 bg-pending-surface text-pending",
        neutral: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

type StatusTone = NonNullable<VariantProps<typeof statusBadgeVariants>["tone"]>

// Each tone has a distinct shape so status survives grayscale and color blindness.
function StatusIcon({ tone }: { tone: StatusTone }) {
  const common = {
    "aria-hidden": true,
    width: 12,
    height: 12,
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  switch (tone) {
    case "success":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="5" />
          <path d="m3.75 6.1 1.5 1.5 3-3.2" />
        </svg>
      )
    case "attention":
      return (
        <svg {...common}>
          <path d="M6 1.25 11 10.5H1L6 1.25Z" />
          <path d="M6 5v2.25M6 8.9v.05" />
        </svg>
      )
    case "risk":
      return (
        <svg {...common}>
          <path d="M4 1h4l3 3v4l-3 3H4L1 8V4l3-3Z" />
          <path d="M6 3.5v3M6 8.4v.05" />
        </svg>
      )
    case "pending":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="5" strokeDasharray="2.2 1.6" />
          <path d="M6 3.5V6l1.6 1" />
        </svg>
      )
    case "neutral":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}

type StatusBadgeProps = React.ComponentProps<"span"> & {
  tone?: StatusTone
}

function StatusBadge({
  className,
  tone = "neutral",
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      data-tone={tone}
      className={cn(statusBadgeVariants({ tone }), className)}
      {...props}
    >
      <StatusIcon tone={tone} />
      {children}
    </span>
  )
}

export { StatusBadge, StatusIcon, statusBadgeVariants }
export type { StatusTone }
