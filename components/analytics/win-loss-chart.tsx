"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { isLosingTrade, isWinningTrade } from "@/lib/utils"

export function WinLossChart() {
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const winningTrades = trades.filter((t) => isWinningTrade(t.profitLoss))
  const losingTrades = trades.filter((t) => isLosingTrade(t.profitLoss))

  const avgWin = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0) / winningTrades.length
  const avgLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0) / losingTrades.length)

  const data = [
    {
      category: "Average",
      win: avgWin,
      loss: avgLoss,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Win vs Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="category" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="win" fill="#22c55e" name="Average Win" radius={[4, 4, 0, 0]} />
            <Bar dataKey="loss" fill="#ef4444" name="Average Loss" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Wins</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{winningTrades.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Losses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{losingTrades.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
