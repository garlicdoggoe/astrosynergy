"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TradesFiltersProps {
  timeFilter: "day" | "week" | "month"
  onTimeFilterChange: (value: "day" | "week" | "month") => void
  pageSize: 10 | 30 | 50
  onPageSizeChange: (value: 10 | 30 | 50) => void
}

export function TradesFilters({ timeFilter, onTimeFilterChange, pageSize, onPageSizeChange }: TradesFiltersProps) {
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
    </div>
  )
}
