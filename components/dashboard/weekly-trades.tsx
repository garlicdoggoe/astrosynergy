"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function WeeklyTrades() {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  
  // Get current week's trades
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const getTradesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return trades.filter((trade) => trade.date === dateStr)
  }

  const getDailyPnL = (date: Date) => {
    const trades = getTradesForDate(date)
    return trades.reduce((sum, trade) => sum + trade.profitLoss, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week's Trading Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((date, index) => {
            const pnl = getDailyPnL(date)
            const trades = getTradesForDate(date)
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
            const dayNumber = date.getDate()
            const isToday = date.toDateString() === today.toDateString()

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${isToday ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="text-center space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">{dayName}</div>
                  <div className="text-lg font-bold text-foreground">{dayNumber}</div>
                  {trades.length > 0 ? (
                    <>
                      <div
                        className={`text-lg font-bold ${
                          pnl > 0
                            ? "text-green-600 dark:text-green-400"
                            : pnl < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {formatCurrency(pnl)}
                      </div>
                      <div className="text-xs text-muted-foreground">{trades.length} trades</div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">No trades</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
