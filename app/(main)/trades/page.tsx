"use client"

import { useState } from "react"
import { TradesTable } from "@/components/trades/trades-table"
import { TradesFilters } from "@/components/trades/trades-filter"
import { Card } from "@/components/ui/card"

export default function TradesPage() {
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("week")
  const [pageSize, setPageSize] = useState<10 | 30 | 50>(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trades</h1>
        <p className="text-muted-foreground mt-1">View and manage all your trades</p>
      </div>

      <Card className="p-6">
        <TradesFilters
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <TradesTable timeFilter={timeFilter} pageSize={pageSize} />
    </div>
  )
}
