import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getNoteByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = "demo-user"

    const note = await ctx.db
      .query("notes")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .first()

    return note
  },
})

export const getAllNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = "demo-user"

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect()

    return notes
  },
})

export const saveNote = mutation({
  args: {
    date: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = "demo-user"

    const existing = await ctx.db
      .query("notes")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("notes", {
        userId,
        date: args.date,
        content: args.content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})
