"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-config"

export function Chart({ data, config, className }: { data: any[], config: ChartConfig, className?: string }) {
  return (
    <ChartContainer config={config} className={className}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis 
          dataKey="name" 
          tickLine={false} 
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="value"
          type="natural"
          fill="url(#fillValue)"
          fillOpacity={0.4}
          stroke="var(--color-value)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

