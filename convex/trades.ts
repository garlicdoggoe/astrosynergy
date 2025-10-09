import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const addTrade = mutation({
  args: {
    ticker: v.string(),
    date: v.string(),
    time: v.string(),
    profitLoss: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = "demo-user" // Replace with actual auth

    const tradeId = await ctx.db.insert("trades", {
      userId,
      ticker: args.ticker,
      date: args.date,
      time: args.time,
      profitLoss: args.profitLoss,
      note: args.note,
      createdAt: Date.now(),
    })

    return tradeId
  },
})

export const updateTrade = mutation({
  args: {
    id: v.id("trades"),
    ticker: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    profitLoss: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

export const deleteTrade = mutation({
  args: { id: v.id("trades") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

export const getTradesByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = "demo-user"

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .collect()

    return trades
  },
})

export const getAllTrades = query({
  handler: async (ctx) => {
    const userId = "demo-user"

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    return trades.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const getTradesByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = "demo-user"

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    return trades.filter((trade) => trade.date >= args.startDate && trade.date <= args.endDate)
  },
})
