"use client"

import { useState } from "react"
import { addDays, differenceInCalendarDays, endOfMonth, endOfWeek, min, startOfMonth, startOfWeek } from "date-fns"
import { TradesTable } from "@/components/trades/trades-table"
import { TradesFilters } from "@/components/trades/trades-filter"
import { ManageColumnsDialog } from "@/components/trades/manage-columns-dialog"
import { Card } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type DateRange = {
  start: Date
  end: Date
}

const MAX_RANGE_DAYS = 29 // inclusive 30 days

function enforceRangeLimit(range: DateRange, today = new Date()): DateRange {
  let start = range.start
  let end = range.end

  if (start > end) {
    ;[start, end] = [end, start]
  }

  if (end > today) {
    end = today
  }

  const diff = differenceInCalendarDays(end, start)
  if (diff > MAX_RANGE_DAYS) {
    end = addDays(start, MAX_RANGE_DAYS)
  }

  return { start, end }
}

function getDefaultRange(today = new Date()): DateRange {
  const monthStart = startOfMonth(today)
  return enforceRangeLimit({ start: monthStart, end: today }, today)
}

export default function TradesPage() {
  const [pageSize, setPageSize] = useState<10 | 30 | 50>(10)
  const [winLossFilter, setWinLossFilter] = useState<"all" | "winners" | "losers">("all")
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false)
  const [imageSize, setImageSize] = useState<"small" | "medium" | "large">("small")
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange())
  const [filterMode, setFilterMode] = useState<"range" | "all">("range")

  // Fetch custom columns for the current user
  const customColumns = useQuery(api.trades.getCustomColumns) ?? []

  const updateRange = (next: DateRange) => {
    setFilterMode("range")
    setDateRange(enforceRangeLimit(next))
  }

  const handleStartDateChange = (value: string) => {
    const newStart = value ? new Date(value) : null
    if (!newStart || Number.isNaN(newStart.getTime())) return
    updateRange({ start: newStart, end: dateRange.end })
  }

  const handleEndDateChange = (value: string) => {
    const newEnd = value ? new Date(value) : null
    if (!newEnd || Number.isNaN(newEnd.getTime())) return
    updateRange({ start: dateRange.start, end: newEnd })
  }

  const setWeekRange = () => {
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 1 })
    const end = min([endOfWeek(today, { weekStartsOn: 1 }), today])
    updateRange({ start, end })
  }

  const setMonthRange = () => {
    const today = new Date()
    const start = startOfMonth(today)
    const end = min([endOfMonth(today), today])
    updateRange({ start, end })
  }

  const handleShowAll = () => {
    setFilterMode("all")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trades</h1>
        <p className="text-muted-foreground mt-1">View and manage all your trades</p>
      </div>

      <Card className="p-6">
        <TradesFilters
          dateRange={dateRange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onSelectWeek={setWeekRange}
          onSelectMonth={setMonthRange}
          onShowAll={handleShowAll}
          filterMode={filterMode}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          winLossFilter={winLossFilter}
          onWinLossFilterChange={setWinLossFilter}
          onManageColumns={() => setManageColumnsOpen(true)}
          imageSize={imageSize}
          onImageSizeChange={setImageSize}
        />
      </Card>

      <TradesTable
        dateRange={dateRange}
        filterMode={filterMode}
        pageSize={pageSize}
        winLossFilter={winLossFilter}
        customColumns={customColumns}
        imageSize={imageSize}
      />

      <ManageColumnsDialog open={manageColumnsOpen} onClose={() => setManageColumnsOpen(false)} />
    </div>
  )
}
