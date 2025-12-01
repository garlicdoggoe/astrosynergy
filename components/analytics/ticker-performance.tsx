"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency, isWinningTrade } from "@/lib/utils"

export function TickerPerformance() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  
  // Group trades by ticker
  const tickerStats = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.ticker]) {
        acc[trade.ticker] = { total: 0, count: 0, wins: 0 }
      }
      acc[trade.ticker].total += trade.profitLoss
      acc[trade.ticker].count += 1
      if (isWinningTrade(trade.profitLoss)) acc[trade.ticker].wins += 1
      return acc
    },
    {} as Record<string, { total: number; count: number; wins: number }>,
  )

  const sortedTickers = Object.entries(tickerStats)
    .map(([ticker, stats]) => ({
      ticker,
      ...stats,
      winRate: (stats.wins / stats.count) * 100,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Tickers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTickers.map((ticker) => (
            <div key={ticker.ticker} className="flex items-center justify-between pb-4 border-b last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-foreground">{ticker.ticker}</span>
                  <span className="text-sm text-muted-foreground">
                    {ticker.count} {ticker.count === 1 ? "trade" : "trades"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Win Rate: {ticker.winRate.toFixed(1)}%</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${ticker.winRate}%` }} />
                  </div>
                </div>
              </div>
              <div
                className={`text-xl font-bold ml-4 ${
                  ticker.total > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(ticker.total)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
