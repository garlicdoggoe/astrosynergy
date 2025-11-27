"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"

interface TradesFiltersProps {
  timeFilter: "day" | "week" | "month"
  onTimeFilterChange: (value: "day" | "week" | "month") => void
  pageSize: 10 | 30 | 50
  onPageSizeChange: (value: 10 | 30 | 50) => void
  winLossFilter: "all" | "winners" | "losers"
  onWinLossFilterChange: (value: "all" | "winners" | "losers") => void
  imageSize: "small" | "medium" | "large"
  onImageSizeChange: (value: "small" | "medium" | "large") => void
  onManageColumns: () => void
}

export function TradesFilters({ 
  timeFilter, 
  onTimeFilterChange, 
  pageSize, 
  onPageSizeChange,
  winLossFilter,
  onWinLossFilterChange,
  imageSize,
  onImageSizeChange,
  onManageColumns
}: TradesFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label>Time Period</Label>
        <Select value={timeFilter} onValueChange={(v) => onTimeFilterChange(v as "day" | "week" | "month")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
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
