"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { TrendingUp, TrendingDown, Target, Award, AlertCircle } from "lucide-react"

interface PerformanceMetricsProps {
  timeframe: "day" | "week" | "month" | "year" | "all"
}

export function PerformanceMetrics({ timeframe }: PerformanceMetricsProps) {
  // Get all trades from Convex - in a real app, you might want to filter by timeframe
  const trades = useQuery(api.trades.getAllTrades) ?? []

  const winningTrades = trades.filter((t) => t.profitLoss > 0)
  const losingTrades = trades.filter((t) => t.profitLoss < 0)

  const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0)
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0))

  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit
  const winRate = (winningTrades.length / trades.length) * 100
  const avgWin = totalProfit / winningTrades.length || 0
  const avgLoss = totalLoss / losingTrades.length || 0

  // Calculate max drawdown (simplified)
  let maxDrawdown = 0
  let peak = 0
  let runningTotal = 0

  trades.forEach((trade) => {
    runningTotal += trade.profitLoss
    if (runningTotal > peak) {
      peak = runningTotal
    }
    const drawdown = peak - runningTotal
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  })

  const metrics = [
    {
      title: "Profit Factor",
      value: profitFactor.toFixed(2),
      icon: Target,
      color: profitFactor > 1.5 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: Award,
      color: winRate > 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    },
    {
      title: "Avg Win",
      value: `$${avgWin.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Avg Loss",
      value: `$${avgLoss.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Max Drawdown",
      value: `$${maxDrawdown.toFixed(2)}`,
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Total Trades",
      value: trades.length.toString(),
      icon: Target,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
