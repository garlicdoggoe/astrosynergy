"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTheme } from "next-themes"

export function BalanceChart() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const { theme } = useTheme()
  
  // Get portfolio data to determine starting balance
  const portfolio = useQuery(api.portfolio.getPortfolio)
  const startingBalance = portfolio?.balance ?? 10000
  let runningBalance = startingBalance

  const data = trades
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((trade) => {
      runningBalance += trade.profitLoss
      return {
        date: new Date(trade.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        balance: runningBalance,
      }
    })

  // Set colors based on theme
  const colorTheme = theme === "dark" ? "#ffffff" : "#000000"
  const gradientStartColor = theme === "dark" ? "#ffffff" : "#000000"
  const gradientEndColor = theme === "dark" ? "#cccccc" : "#666666"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientStartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={gradientEndColor} stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="balance"
              stroke={colorTheme}
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
