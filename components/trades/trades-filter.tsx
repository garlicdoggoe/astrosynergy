"use client"

import { format } from "date-fns"
import { CalendarDays, Settings2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DateRangeValue = {
  start: Date
  end: Date
}

interface TradesFiltersProps {
  dateRange: DateRangeValue
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onSelectWeek: () => void
  onSelectMonth: () => void
  pageSize: 10 | 30 | 50
  onPageSizeChange: (value: 10 | 30 | 50) => void
  winLossFilter: "all" | "winners" | "losers"
  onWinLossFilterChange: (value: "all" | "winners" | "losers") => void
  imageSize: "small" | "medium" | "large"
  onImageSizeChange: (value: "small" | "medium" | "large") => void
  onManageColumns: () => void
}

export function TradesFilters({ 
  dateRange,
  onStartDateChange,
  onEndDateChange,
  onSelectWeek,
  onSelectMonth,
  pageSize, 
  onPageSizeChange,
  winLossFilter,
  onWinLossFilterChange,
  imageSize,
  onImageSizeChange,
  onManageColumns
}: TradesFiltersProps) {

  const rangeLabel = `${format(dateRange.start, "MMM d, yyyy")} - ${format(dateRange.end, "MMM d, yyyy")}`

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label>Date Range (max 30 days)</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{rangeLabel}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={format(dateRange.start, "yyyy-MM-dd")}
              onChange={(e) => onStartDateChange(e.target.value)}
              max={format(dateRange.end, "yyyy-MM-dd")}
              className="w-[160px]"
            />
            <Input
              type="date"
              value={format(dateRange.end, "yyyy-MM-dd")}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={format(dateRange.start, "yyyy-MM-dd")}
              className="w-[160px]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onSelectWeek}>
              This Week
            </Button>
            <Button variant="secondary" size="sm" onClick={onSelectMonth}>
              This Month
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Select up to 30 days inclusive.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Win/Loss Filter</Label>
        <Select value={winLossFilter} onValueChange={(v) => onWinLossFilterChange(v as "all" | "winners" | "losers")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            <SelectItem value="winners">Winners Only</SelectItem>
            <SelectItem value="losers">Losers Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Trades Per Page</Label>
        <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(Number.parseInt(v) as 10 | 30 | 50)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 trades</SelectItem>
            <SelectItem value="30">30 trades</SelectItem>
            <SelectItem value="50">50 trades</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Image Size</Label>
        <Select value={imageSize} onValueChange={(v) => onImageSizeChange(v as "small" | "medium" | "large")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={onManageColumns}>
          <Settings2 className="h-4 w-4 mr-2" />
          Manage Columns
        </Button>
      </div>
    </div>
  )
}
