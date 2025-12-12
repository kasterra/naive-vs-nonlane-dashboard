import * as React from "react"
import { cn } from "@/lib/utils"

type ChartConfig = Record<string, { label?: string; color?: string }>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, style, ...props }: ChartContainerProps) {
  const cssVars: React.CSSProperties = {}
  for (const [key, def] of Object.entries(config)) {
    if (def?.color) {
      ;(cssVars as any)[`--color-${key}`] = def.color
    }
  }
  return <div data-chart className={cn("rounded-md border bg-card p-4", className)} style={{ ...(style || {}), ...cssVars }} {...props} />
}

// Minimal tooltip wrapper compatible with Recharts <Tooltip content={...} />
export function ChartTooltip(props: any) {
  // passthrough – kept for API symmetry with shadcn examples
  return <div {...props} />
}

export function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-md border bg-background p-2 shadow-sm">
      {label ? (
        <div className="mb-1 text-xs text-muted-foreground">{String(label)}</div>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => {
          const name = entry.name ?? entry.dataKey ?? `series_${i}`
          const value = entry.value
          const color = entry.color
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="inline-block size-2 rounded-sm" style={{ background: color }} />
              <span className="text-foreground">{name}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{typeof value === "number" ? value.toLocaleString() : String(value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

