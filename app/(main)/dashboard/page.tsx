"use client"

import { useState } from "react"
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics"
import { AccountBalance } from "@/components/dashboard/account-balance"
import { PerformanceSummary } from "@/components/dashboard/performance-summary"
import { BalanceChart } from "@/components/dashboard/balance-chart"
import { PnLChart } from "@/components/dashboard/pnl-chart"
import { WeeklyTrades } from "@/components/dashboard/weekly-trades"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "year" | "all">("week")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your trading performance</p>
        </div>
        {/* <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs> */}
      </div>

      {/* Account Balance and Risk Management */}
      <AccountBalance />

      {/* Weekly Trades Overview */}
      <WeeklyTrades />

      {/* Performance Metrics Grid */}
      <PerformanceMetrics timeframe={timeframe} />

      {/* Performance Summary */}
      <PerformanceSummary timeframe={timeframe} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceChart />
        <PnLChart />
      </div>
    </div>
  )
}
