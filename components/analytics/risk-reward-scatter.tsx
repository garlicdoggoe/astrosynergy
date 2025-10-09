"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scatter, ScatterChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTheme } from "next-themes"

export function RiskRewardScatter() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const { theme } = useTheme()
  const data = trades.map((trade, index) => ({
    x: index + 1,
    y: trade.profitLoss,
    ticker: trade.ticker,
  }))

  const colorTheme = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              dataKey="x"
              name="Trade #"
              className="text-xs"
              tick={{ fill: colorTheme }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="P&L"
              className="text-xs"
              tick={{ fill: colorTheme }}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Scatter data={data} fill={colorTheme} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
