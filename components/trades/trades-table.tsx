"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react"
import { EditTradeDialog } from "@/components/trades/edit-trade-dialog"

interface TradesTableProps {
  timeFilter: "day" | "week" | "month"
  pageSize: 10 | 30 | 50
  winLossFilter: "all" | "winners" | "losers"
}

export function TradesTable({ timeFilter, pageSize, winLossFilter }: TradesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [editingTrade, setEditingTrade] = useState<any>(null)
  
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const deleteTrade = useMutation(api.trades.deleteTrade)

  // Filter trades based on time period and win/loss filter
  const filteredTrades = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (timeFilter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay() + 1) // Monday
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    let filtered = trades.filter((trade) => new Date(trade.date) >= startDate)

    // Apply win/loss filter
    switch (winLossFilter) {
      case "winners":
        filtered = filtered.filter((trade) => trade.profitLoss > 0)
        break
      case "losers":
        filtered = filtered.filter((trade) => trade.profitLoss < 0)
        break
      case "all":
        // No additional filtering needed
        break
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [timeFilter, winLossFilter, trades])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [timeFilter, winLossFilter, pageSize])

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentTrades = filteredTrades.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
  const winningTrades = filteredTrades.filter((t) => t.profitLoss > 0).length
  const losingTrades = filteredTrades.filter((t) => t.profitLoss < 0).length

  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      await deleteTrade({ id: tradeId as any })
    }
  }

  return (
    <>
      <Card className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-bold text-foreground">{filteredTrades.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p
              className={`text-2xl font-bold ${
                totalPnL > 0
                  ? "text-green-600 dark:text-green-400"
                  : totalPnL < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
              }`}
            >
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Winning Trades</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{winningTrades}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Losing Trades</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{losingTrades}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No trades found for this period
                  </TableCell>
                </TableRow>
              ) : (
                currentTrades.map((trade) => (
                  <TableRow key={trade._id}>
                    <TableCell className="font-medium">{formatDate(trade.date)}</TableCell>
                    <TableCell>{formatTime(trade.time)}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{trade.ticker}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${
                          trade.profitLoss > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(trade.profitLoss)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{trade.note || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTrade(trade)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTrade(trade._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTrades.length)} of {filteredTrades.length} trades
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <EditTradeDialog trade={editingTrade} onClose={() => setEditingTrade(null)} />
    </>
  )
}
