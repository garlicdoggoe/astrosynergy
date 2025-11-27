"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency, formatDate, formatDateISO } from "@/lib/utils"
import { useMemo } from "react"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react"

interface TradingMetricsProps {
  timeframe: "week" | "month" | "year" | "all"
}

/**
 * Component that displays key trading metrics:
 * - Worst trade (lowest profitLoss)
 * - Long Won (count of winning long trades)
 * - Short Won (count of winning short trades)
 * - Gross Profit (sum of all positive profitLoss values)
 * - Gross Loss (absolute sum of all negative profitLoss values)
 */
export function TradingMetrics({ timeframe }: TradingMetricsProps) {
  // Get all trades from Convex
  const allTrades = useQuery(api.trades.getAllTrades) ?? []

  // Filter trades by the selected timeframe
  const trades = useMemo(() => {
    if (timeframe === "all") {
      return allTrades
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (timeframe) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 }) // Monday
        endDate = endOfWeek(now, { weekStartsOn: 1 }) // Sunday
        break
      case "month":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case "year":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      default:
        return allTrades
    }

    // Filter trades within the date range
    // Convert dates to ISO string format (YYYY-MM-DD) using local time for accurate comparison
    const startDateStr = formatDateISO(startDate)
    const endDateStr = formatDateISO(endDate)

    return allTrades.filter((trade) => {
      return trade.date >= startDateStr && trade.date <= endDateStr
    })
  }, [allTrades, timeframe])

  // Calculate worst trade (trade with lowest profitLoss)
  const worstTrade = useMemo(() => {
    if (trades.length === 0) return null
    return trades.reduce((worst, trade) => 
      trade.profitLoss < worst.profitLoss ? trade : worst
    )
  }, [trades])

  // Calculate Long Won (count of winning long trades)
  const longWon = useMemo(() => {
    return trades.filter(
      (trade) => trade.type === "long" && trade.profitLoss > 0
    ).length
  }, [trades])

  // Calculate Short Won (count of winning short trades)
  const shortWon = useMemo(() => {
    return trades.filter(
      (trade) => trade.type === "short" && trade.profitLoss > 0
    ).length
  }, [trades])

  // Calculate Gross Profit (sum of all positive profitLoss values)
  const grossProfit = useMemo(() => {
    return trades
      .filter((trade) => trade.profitLoss > 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0)
  }, [trades])

  // Calculate Gross Loss (absolute sum of all negative profitLoss values)
  const grossLoss = useMemo(() => {
    return Math.abs(
      trades
        .filter((trade) => trade.profitLoss < 0)
        .reduce((sum, trade) => sum + trade.profitLoss, 0)
    )
  }, [trades])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Worst Trade Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Worst Trade</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          {worstTrade ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(worstTrade.profitLoss)}
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="font-medium">{worstTrade.ticker}</div>
                <div>{formatDate(worstTrade.date)}</div>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">N/A</div>
          )}
        </CardContent>
      </Card>

      {/* Long Won Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Long Won</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {longWon}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Winning long trades
          </div>
        </CardContent>
      </Card>

      {/* Short Won Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Short Won</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {shortWon}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Winning short trades
          </div>
        </CardContent>
      </Card>

      {/* Gross Profit Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(grossProfit)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total profits
          </div>
        </CardContent>
      </Card>

      {/* Gross Loss Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gross Loss</CardTitle>
          <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(grossLoss)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total losses
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
