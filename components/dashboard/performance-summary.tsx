"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency, isBreakEvenTrade, isLosingTrade, isWinningTrade } from "@/lib/utils"

interface PerformanceSummaryProps {
  timeframe: "day" | "week" | "month" | "year" | "all"
}

export function PerformanceSummary({ timeframe }: PerformanceSummaryProps) {
  // Get all trades from Convex - in a real app, you might want to filter by timeframe
  const trades = useQuery(api.trades.getAllTrades) ?? []

  const netProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0)
  const winningTrades = trades.filter((t) => isWinningTrade(t.profitLoss))
  const losingTrades = trades.filter((t) => isLosingTrade(t.profitLoss))
  const breakEvenTrades = trades.filter((t) => isBreakEvenTrade(t.profitLoss))

  const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0)
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0))

  const avgWin = totalProfit / winningTrades.length || 0
  const avgLoss = totalLoss / losingTrades.length || 0
  const rewardRiskRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin

  const profitPercentage = ((netProfit / 10000) * 100).toFixed(2) // Assuming $10k starting balance

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p
              className={`text-2xl font-bold ${
                netProfit > 0
                  ? "text-green-600 dark:text-green-400"
                  : netProfit < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
              }`}
            >
              {formatCurrency(netProfit)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Return %</p>
            <p
              className={`text-2xl font-bold ${
                Number.parseFloat(profitPercentage) > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {profitPercentage}%
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Reward:Risk</p>
            <p className="text-2xl font-bold text-foreground">{rewardRiskRatio.toFixed(2)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Strike Rate</p>
            <p className="text-2xl font-bold text-foreground">
              {((winningTrades.length / trades.length) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Wins</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{winningTrades.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Losses</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{losingTrades.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Break Even</p>
            <p className="text-xl font-bold text-muted-foreground">{breakEvenTrades.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
