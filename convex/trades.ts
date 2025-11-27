import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { api } from "./_generated/api"

export const addTrade = mutation({
  args: {
    ticker: v.string(),
    date: v.string(),
    time: v.string(),
    profitLoss: v.number(),
    note: v.optional(v.string()),
    customData: v.optional(v.any()), // Custom column values
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
      customData: args.customData,
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
    customData: v.optional(v.any()), // Custom column values
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const { id, ...updates } = args
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error("Not found")
    if (existing.userId !== userId) throw new Error("Forbidden")

    // If customData is being updated, clean up old image files that are being replaced
    if (updates.customData && existing.customData) {
      const oldCustomData = existing.customData as Record<string, any>
      const newCustomData = updates.customData as Record<string, any>

      // Get all custom columns to check which ones are image types
      const columns = await ctx.db
        .query("customColumns")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()

      // Find image columns and check if old images are being replaced
      for (const column of columns) {
        if (column.type === "image") {
          const oldFileId = oldCustomData[column.columnId]
          const newFileId = newCustomData[column.columnId]

          // If there's an old image and it's different from the new one, delete it
          if (oldFileId && oldFileId !== newFileId) {
            try {
              await ctx.storage.delete(oldFileId)
            } catch (error) {
              // Ignore errors if file doesn't exist
              console.error("Error deleting old image:", error)
            }
          }
        }
      }
    }

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

    // Clean up image files from customData before deleting the trade
    if (existing.customData) {
      const customData = existing.customData as Record<string, any>
      const columns = await ctx.db
        .query("customColumns")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()

      // Delete all image files associated with this trade
      for (const column of columns) {
        if (column.type === "image" && customData[column.columnId]) {
          try {
            await ctx.storage.delete(customData[column.columnId])
          } catch (error) {
            // Ignore errors if file doesn't exist
            console.error("Error deleting image:", error)
          }
        }
      }
    }

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

// Custom Column Management Functions

/**
 * Get all custom columns for the current user, sorted by order
 */
export const getCustomColumns = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const columns = await ctx.db
      .query("customColumns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    return columns.sort((a, b) => a.order - b.order)
  },
})

/**
 * Add a new custom column for the user
 */
export const addCustomColumn = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("string"), v.literal("number"), v.literal("image")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    // Get the maximum order value to place the new column at the end
    const existingColumns = await ctx.db
      .query("customColumns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const maxOrder = existingColumns.length > 0 
      ? Math.max(...existingColumns.map((c) => c.order))
      : -1

    // Generate a unique columnId
    const columnId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const columnId_result = await ctx.db.insert("customColumns", {
      userId,
      columnId,
      name: args.name,
      type: args.type,
      order: maxOrder + 1,
      createdAt: Date.now(),
    })

    return columnId
  },
})

/**
 * Update a custom column's name or type
 */
export const updateCustomColumn = mutation({
  args: {
    columnId: v.string(),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("string"), v.literal("number"), v.literal("image"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    // Find the column
    const column = await ctx.db
      .query("customColumns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("columnId"), args.columnId))
      .first()

    if (!column) throw new Error("Column not found")

    // If type is being changed to non-image, clean up image files
    if (args.type && args.type !== "image" && column.type === "image") {
      // Find all trades with this column and delete associated images
      const trades = await ctx.db
        .query("trades")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()

      for (const trade of trades) {
        if (trade.customData && (trade.customData as Record<string, any>)[args.columnId]) {
          const fileId = (trade.customData as Record<string, any>)[args.columnId]
          try {
            await ctx.storage.delete(fileId)
          } catch (error) {
            console.error("Error deleting image:", error)
          }
          // Remove the image from customData
          const customData = { ...(trade.customData as Record<string, any>) }
          delete customData[args.columnId]
          await ctx.db.patch(trade._id, { customData })
        }
      }
    }

    // Update the column
    const updates: any = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.type !== undefined) updates.type = args.type

    await ctx.db.patch(column._id, updates)
  },
})

/**
 * Delete a custom column and clean up associated data
 */
export const deleteCustomColumn = mutation({
  args: {
    columnId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    // Find the column
    const column = await ctx.db
      .query("customColumns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("columnId"), args.columnId))
      .first()

    if (!column) throw new Error("Column not found")

    // If it's an image column, delete all associated image files
    if (column.type === "image") {
      const trades = await ctx.db
        .query("trades")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()

      for (const trade of trades) {
        if (trade.customData && (trade.customData as Record<string, any>)[args.columnId]) {
          const fileId = (trade.customData as Record<string, any>)[args.columnId]
          try {
            await ctx.storage.delete(fileId)
          } catch (error) {
            console.error("Error deleting image:", error)
          }
        }
      }
    }

    // Remove the column data from all trades
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    for (const trade of trades) {
      if (trade.customData && (trade.customData as Record<string, any>)[args.columnId]) {
        const customData = { ...(trade.customData as Record<string, any>) }
        delete customData[args.columnId]
        await ctx.db.patch(trade._id, { customData: Object.keys(customData).length > 0 ? customData : undefined })
      }
    }

    // Delete the column definition
    await ctx.db.delete(column._id)

    // Reorder remaining columns to fill the gap
    const remainingColumns = await ctx.db
      .query("customColumns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    remainingColumns
      .sort((a, b) => a.order - b.order)
      .forEach((col, index) => {
        if (col.order !== index) {
          ctx.db.patch(col._id, { order: index })
        }
      })
  },
})

/**
 * Reorder custom columns
 */
export const reorderCustomColumns = mutation({
  args: {
    columnIds: v.array(v.string()), // Array of columnIds in the desired order
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    // Update the order of each column
    for (let i = 0; i < args.columnIds.length; i++) {
      const column = await ctx.db
        .query("customColumns")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("columnId"), args.columnIds[i]))
        .first()

      if (column && column.order !== i) {
        await ctx.db.patch(column._id, { order: i })
      }
    }
  },
})
