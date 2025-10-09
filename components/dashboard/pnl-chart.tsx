"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTheme } from "next-themes"

export function PnLChart() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const { theme } = useTheme()
  
  // Group trades by date and calculate daily P&L
  const dailyPnL = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = 0
      }
      acc[trade.date] += trade.profitLoss
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(dailyPnL)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, pnl]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pnl,
    }))

  // Set colors based on theme
  const colorTheme = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Profit & Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: colorTheme }} />
            <YAxis className="text-xs" tick={{ fill: colorTheme }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="pnl" fill={colorTheme} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
