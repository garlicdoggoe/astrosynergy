"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency } from "@/lib/utils"

export function MonthlyBreakdown() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  
  // Group trades by month
  const monthlyStats = trades.reduce(
    (acc, trade) => {
      const month = trade.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0, wins: 0 }
      }
      acc[month].total += trade.profitLoss
      acc[month].count += 1
      if (trade.profitLoss > 0) acc[month].wins += 1
      return acc
    },
    {} as Record<string, { total: number; count: number; wins: number }>,
  )

  const sortedMonths = Object.entries(monthlyStats)
    .map(([month, stats]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      ...stats,
      winRate: (stats.wins / stats.count) * 100,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMonths.map((month) => (
            <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-semibold text-foreground">{month.month}</p>
                <p className="text-sm text-muted-foreground">
                  {month.count} trades • {month.winRate.toFixed(1)}% win rate
                </p>
              </div>
              <div
                className={`text-xl font-bold ${
                  month.total > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(month.total)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
