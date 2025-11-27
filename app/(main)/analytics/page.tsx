"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WinLossChart } from "@/components/analytics/win-loss-chart"
import { TickerPerformance } from "@/components/analytics/ticker-performance"
import { TimeOfDayAnalysis } from "@/components/analytics/time-of-day-analysis"
import { MonthlyBreakdown } from "@/components/analytics/monthly-breakdown"
import { RiskRewardScatter } from "@/components/analytics/risk-reward-scatter"
import { TradingMetrics } from "@/components/analytics/trading-metrics"

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year" | "all">("month")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your trading performance</p>
        </div>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TradingMetrics timeframe={timeframe} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WinLossChart />
        <TickerPerformance />
      </div>

      <RiskRewardScatter />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyBreakdown />
        <TimeOfDayAnalysis />
      </div>
    </div>
  )
}
