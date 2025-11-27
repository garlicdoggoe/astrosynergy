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
    customData: v.optional(v.any()), // Stores custom column values: { [columnId]: string | number | Id<"_storage"> }
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  customColumns: defineTable({
    userId: v.string(),
    columnId: v.string(), // Unique identifier for the column
    name: v.string(), // Display name of the column
    type: v.union(v.literal("string"), v.literal("number"), v.literal("image")), // Column data type
    order: v.number(), // Display order of the column
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

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
