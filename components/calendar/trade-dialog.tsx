"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TradeDialogProps {
  selectedDate: string | null
  onClose: () => void
}

interface Trade {
  _id: string
  ticker: string
  time: string
  type: "long" | "short"
  profitLoss: number
  note?: string
}

export function TradeDialog({ selectedDate, onClose }: TradeDialogProps) {
  const [newTrade, setNewTrade] = useState({
    ticker: "",
    time: new Date().toTimeString().slice(0, 5),
    type: "long" as "long" | "short",
    profitLoss: "",
    note: "",
  })

  // Get trades for the selected date from Convex - use this directly instead of local state
  const trades = useQuery(api.trades.getTradesByDate, 
    selectedDate ? { date: selectedDate } : "skip"
  ) ?? []
  
  const addTrade = useMutation(api.trades.addTrade)
  const deleteTrade = useMutation(api.trades.deleteTrade)

  const handleAddTrade = async () => {
    if (!newTrade.ticker || !newTrade.profitLoss || !selectedDate) return

    await addTrade({
      ticker: newTrade.ticker.toUpperCase(),
      date: selectedDate,
      time: newTrade.time,
      type: newTrade.type,
      profitLoss: Number.parseFloat(newTrade.profitLoss),
      note: newTrade.note || undefined,
    })

    setNewTrade({
      ticker: "",
      time: new Date().toTimeString().slice(0, 5),
      type: "long",
      profitLoss: "",
      note: "",
    })
  }

  const handleDeleteTrade = async (id: string) => {
    await deleteTrade({ id: id as any })
  }

  const totalPnL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0)

  return (
    <Dialog open={!!selectedDate} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{selectedDate && formatDate(selectedDate)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total P&L Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
              <span
                className={`text-2xl font-bold ${
                  totalPnL > 0
                    ? "text-green-600 dark:text-green-400"
                    : totalPnL < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                }`}
              >
                {formatCurrency(totalPnL)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {trades.length} {trades.length === 1 ? "trade" : "trades"}
            </div>
          </Card>

          {/* Existing Trades */}
          {trades.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Trades</h3>
              {trades.map((trade) => (
                <Card key={trade._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{trade.ticker}</span>
                        <span className="text-sm text-muted-foreground">{formatTime(trade.time)}</span>
                        <span className="text-xs font-semibold uppercase rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                          {trade.type}
                        </span>
                        <span
                          className={`font-semibold ${
                            trade.profitLoss > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(trade.profitLoss)}
                        </span>
                      </div>
                      {trade.note && <p className="text-sm text-muted-foreground">{trade.note}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTrade(trade._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Trade Form */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-foreground">Add New Trade</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  placeholder="AAPL"
                  value={newTrade.ticker}
                  onChange={(e) => setNewTrade({ ...newTrade, ticker: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newTrade.time}
                  onChange={(e) => setNewTrade({ ...newTrade, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newTrade.type}
                  onValueChange={(value) => setNewTrade({ ...newTrade, type: value as "long" | "short" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profitLoss">Profit/Loss ($)</Label>
              <Input
                id="profitLoss"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={newTrade.profitLoss}
                onChange={(e) => setNewTrade({ ...newTrade, profitLoss: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Trade notes..."
                value={newTrade.note}
                onChange={(e) => setNewTrade({ ...newTrade, note: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleAddTrade} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Trade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
