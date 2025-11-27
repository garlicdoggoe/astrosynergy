"use client"

import { useState } from "react"
import { TradesTable } from "@/components/trades/trades-table"
import { TradesFilters } from "@/components/trades/trades-filter"
import { ManageColumnsDialog } from "@/components/trades/manage-columns-dialog"
import { Card } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function TradesPage() {
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("week")
  const [pageSize, setPageSize] = useState<10 | 30 | 50>(10)
  const [winLossFilter, setWinLossFilter] = useState<"all" | "winners" | "losers">("all")
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false)
  const [imageSize, setImageSize] = useState<"small" | "medium" | "large">("small")

  // Fetch custom columns for the current user
  const customColumns = useQuery(api.trades.getCustomColumns) ?? []

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
          winLossFilter={winLossFilter}
          onWinLossFilterChange={setWinLossFilter}
          onManageColumns={() => setManageColumnsOpen(true)}
          imageSize={imageSize}
          onImageSizeChange={setImageSize}
        />
      </Card>

      <TradesTable
        timeFilter={timeFilter}
        pageSize={pageSize}
        winLossFilter={winLossFilter}
        customColumns={customColumns}
        imageSize={imageSize}
      />

      <ManageColumnsDialog open={manageColumnsOpen} onClose={() => setManageColumnsOpen(false)} />
    </div>
  )
}
