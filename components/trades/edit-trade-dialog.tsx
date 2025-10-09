"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface EditTradeDialogProps {
  trade: any | null
  onClose: () => void
}

export function EditTradeDialog({ trade, onClose }: EditTradeDialogProps) {
  const updateTrade = useMutation(api.trades.updateTrade)
  
  const [formData, setFormData] = useState({
    ticker: "",
    date: "",
    time: "",
    profitLoss: "",
    note: "",
  })

  useEffect(() => {
    if (trade) {
      setFormData({
        ticker: trade.ticker,
        date: trade.date,
        time: trade.time,
        profitLoss: trade.profitLoss.toString(),
        note: trade.note || "",
      })
    }
  }, [trade])

  const handleSave = async () => {
    if (trade) {
      await updateTrade({
        id: trade._id,
        ticker: formData.ticker,
        date: formData.date,
        time: formData.time,
        profitLoss: Number.parseFloat(formData.profitLoss),
        note: formData.note,
      })
    }
    onClose()
  }

  return (
    <Dialog open={!!trade} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ticker">Ticker</Label>
              <Input
                id="edit-ticker"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-profitLoss">P&L ($)</Label>
              <Input
                id="edit-profitLoss"
                type="number"
                step="0.01"
                value={formData.profitLoss}
                onChange={(e) => setFormData({ ...formData, profitLoss: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-note">Note</Label>
            <Textarea
              id="edit-note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
