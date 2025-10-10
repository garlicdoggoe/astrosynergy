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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const { id, ...updates } = args
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error("Not found")
    if (existing.userId !== userId) throw new Error("Forbidden")
    await ctx.db.patch(id, updates)
  },
})

export const deleteTrade = mutation({
  args: { id: v.id("trades") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Not found")
    if (existing.userId !== userId) throw new Error("Forbidden")
    await ctx.db.delete(args.id)
  },
})

export const getTradesByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .collect()

    return trades
  },
})

export const getAllTrades = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    return trades.filter((trade) => trade.date >= args.startDate && trade.date <= args.endDate)
  },
})
