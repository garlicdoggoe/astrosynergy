import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getNoteByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

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
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

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
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const userId = identity.subject

    const existing = await ctx.db
      .query("notes")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .first()

    if (existing) {
      // Update existing note
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: Date.now(),
      })
    } else {
      // Create new note
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
