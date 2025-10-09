"use client"

import { getMonthDays, formatDateISO, formatCurrency } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  currentDate: Date
  onDateClick: (date: string) => void
}

export function CalendarView({ currentDate, onDateClick }: CalendarViewProps) {
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  
  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const getDailyPnL = (date: Date): number => {
    const dateStr = formatDateISO(date)
    return trades.filter((trade) => trade.date === dateStr).reduce((sum, trade) => sum + trade.profitLoss, 0)
  }

  const getTradeCount = (date: Date): number => {
    const dateStr = formatDateISO(date)
    return trades.filter((trade) => trade.date === dateStr).length
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth()
  }

  return (
    <div className="w-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const pnl = getDailyPnL(date)
          const tradeCount = getTradeCount(date)
          const dateStr = formatDateISO(date)
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <button
              key={index}
              onClick={() => onDateClick(dateStr)}
              className={cn(
                "relative min-h-[100px] p-3 rounded-lg border transition-all hover:shadow-md",
                isCurrentMonth(date) ? "bg-card" : "bg-muted/30",
                pnl > 0 && "border-green-500/50 bg-green-500/5",
                pnl < 0 && "border-red-500/50 bg-red-500/5",
                isToday && "ring-2 ring-primary",
              )}
            >
              <div className="flex flex-col h-full">
                <div
                  className={cn(
                    "text-sm font-medium mb-2",
                    isCurrentMonth(date) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {date.getDate()}
                </div>

                {tradeCount > 0 && (
                  <div className="flex-1 flex flex-col justify-center items-center gap-1">
                    <div
                      className={cn(
                        "text-lg font-bold",
                        pnl > 0 && "text-green-600 dark:text-green-400",
                        pnl < 0 && "text-red-600 dark:text-red-400",
                        pnl === 0 && "text-muted-foreground",
                      )}
                    >
                      {formatCurrency(pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tradeCount} {tradeCount === 1 ? "trade" : "trades"}
                    </div>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
