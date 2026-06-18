type Props = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
