"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTheme } from "next-themes"
import { formatTime } from "@/lib/utils"

export function TimeOfDayAnalysis() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const { theme } = useTheme()
  // Group trades by hour
  const hourlyStats = trades.reduce(
    (acc, trade) => {
      const hour = Number.parseInt(trade.time.split(":")[0])
      if (!acc[hour]) {
        acc[hour] = { total: 0, count: 0 }
      }
      acc[hour].total += trade.profitLoss
      acc[hour].count += 1
      return acc
    },
    {} as Record<number, { total: number; count: number }>,
  )

  const data = Object.entries(hourlyStats)
    .map(([hour, stats]) => {
      // Convert hour number to 24-hour format string (HH:00) for formatTime function
      const hourStr = Number.parseInt(hour).toString().padStart(2, '0')
      const timeStr = `${hourStr}:00`
      return {
        hour: formatTime(timeStr), // Format as 12-hour with AM/PM
        hourNum: Number.parseInt(hour), // Keep numeric hour for sorting
        pnl: stats.total,
        trades: stats.count,
      }
    })
    .sort((a, b) => a.hourNum - b.hourNum) // Sort by numeric hour value

  const colorTheme = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Time of Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="hour" className="text-xs" tick={{ fill: colorTheme }} />
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
