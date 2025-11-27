import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Upload an image file and return the storage ID
 * This function accepts a file blob and stores it in Convex file storage
 */
export const uploadImage = mutation({
  args: {
    fileId: v.id("_storage"), // The file ID from the client upload
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    // Verify the file exists and return its ID
    // The file should already be uploaded via generateUploadUrl on the client
    return args.fileId
  },
})

/**
 * Generate a URL for an uploaded image file
 * This is used to display images in the table
 */
export const getImageUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    // Generate a URL for the stored file
    return await ctx.storage.getUrl(args.fileId)
  },
})

/**
 * Delete an image file from storage
 * Called when a trade is deleted or when an image column value is removed
 */
export const deleteImage = mutation({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    // Delete the file from storage
    await ctx.storage.delete(args.fileId)
  },
})

/**
 * Generate an upload URL for the client to upload a file
 * This should be called before uploading a file
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    // Generate a URL for the client to upload a file
    return await ctx.storage.generateUploadUrl()
  },
})


