"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: {
  config: ChartConfig
  className?: string
  children?: React.ReactNode | ((config: ChartConfig) => React.ReactNode)
} & React.HTMLAttributes<HTMLDivElement>) {
  React.useEffect(() => {
    // Set CSS variables for chart colors
    const root = document.documentElement;
    Object.entries(config).forEach(([key, { color }]) => {
      root.style.setProperty(`--color-${key}`, color);
    });
  }, [config]);

  return (
    <div className={className} {...props}>
      {typeof children === 'function' ? children(config) : children}
    </div>
  )
}

export function ChartTooltip({ content, ...props }: any) {
  return <RechartsTooltip {...props} content={content} />
}

export function ChartTooltipContent({ active, payload }: any) {
  if (!active || !payload.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.name}</span>
            <span className="text-sm text-muted-foreground ml-auto">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

