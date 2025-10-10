import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  trades: defineTable({
    userId: v.string(),
    ticker: v.string(),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    time: v.string(), // HH:MM format
    profitLoss: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  portfolio: defineTable({
    userId: v.string(),
    balance: v.number(),
    riskPercentage: v.number(), // Default risk percentage
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  notes: defineTable({
    userId: v.string(),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),
})
