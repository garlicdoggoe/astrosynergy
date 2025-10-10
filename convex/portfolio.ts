import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getPortfolio = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    // Get portfolio settings (initial balance and risk percentage)
    const portfolio = await ctx.db
      .query("portfolio")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first()

    // Get all trades to calculate total P&L
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    // Calculate total profit/loss from all trades
    const totalPnL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0)

    // Get initial balance (stored in portfolio table) or default to 10000
    const initialBalance = portfolio?.balance ?? 10000
    
    // Calculate current balance (initial balance + total P&L)
    const currentBalance = initialBalance + totalPnL

    return {
      balance: currentBalance, // This is now the calculated current balance
      initialBalance, // Keep track of the original starting balance
      riskPercentage: portfolio?.riskPercentage ?? 1,
      totalPnL, // Include P&L for reference
    }
  },
})

// Calculate total profit/loss from all trades for the user
export const getTotalPnL = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    // Sum all profit/loss amounts from trades
    const totalPnL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0)
    return totalPnL
  },
})

// Update portfolio settings - this updates the initial balance (starting capital)
// The current balance is automatically calculated from initial balance + total P&L
export const updatePortfolio = mutation({
  args: {
    balance: v.optional(v.number()), // This is the initial/starting balance
    riskPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const existing = await ctx.db
      .query("portfolio")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("portfolio", {
        userId,
        balance: args.balance ?? 10000, // Initial balance/starting capital
        riskPercentage: args.riskPercentage ?? 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})
