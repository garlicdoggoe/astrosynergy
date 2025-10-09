"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Percent } from "lucide-react"

export function AccountBalance() {
  // Get portfolio data from Convex - now includes calculated current balance
  const portfolio = useQuery(api.portfolio.getPortfolio)
  const updatePortfolio = useMutation(api.portfolio.updatePortfolio)
  
  const [initialBalance, setInitialBalance] = useState(10000)
  const [riskPercentage, setRiskPercentage] = useState(1)
  const [isEditing, setIsEditing] = useState(false)

  // Update local state when portfolio data loads - using useEffect to prevent infinite loops
  useEffect(() => {
    if (portfolio) {
      setInitialBalance(portfolio.initialBalance || portfolio.balance)
      setRiskPercentage(portfolio.riskPercentage)
    }
  }, [portfolio])

  // Use the current calculated balance from portfolio data
  const currentBalance = portfolio?.balance || 10000
  const riskAmount = (currentBalance * riskPercentage) / 100

  const handleSave = async () => {
    // Update the initial balance (starting capital), not the current balance
    await updatePortfolio({ balance: initialBalance, riskPercentage })
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Balance & Risk Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Current Portfolio Balance (Dynamic) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Current Portfolio Balance
            </Label>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(currentBalance)}
            </div>
            {portfolio?.totalPnL !== undefined && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(portfolio.totalPnL)} from trades
              </p>
            )}
          </div>

          {/* Initial Balance (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="initialBalance" className="text-muted-foreground">
              Initial Balance
            </Label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="initialBalance"
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Number.parseFloat(e.target.value) || 0)}
                    className="pl-9"
                  />
                </div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-muted-foreground">
                ${(portfolio?.initialBalance || initialBalance).toLocaleString()}.00
              </div>
            )}
          </div>

          {/* Risk Percentage */}
          <div className="space-y-2">
            <Label htmlFor="risk" className="text-muted-foreground">
              Risk Per Trade
            </Label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="risk"
                    type="number"
                    step="0.1"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(Number.parseFloat(e.target.value) || 0)}
                    className="pl-9"
                  />
                </div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-foreground">{riskPercentage}%</div>
            )}
          </div>

          {/* Risk Amount */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Risk Amount</Label>
            <div className="text-3xl font-bold text-primary">{formatCurrency(riskAmount)}</div>
            <p className="text-xs text-muted-foreground">Per trade based on {riskPercentage}% risk</p>
          </div>
        </div>

        <div className="mt-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Initial Balance & Risk
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
