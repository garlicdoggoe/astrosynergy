"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"
import { useMemo } from "react"

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  const convex = useMemo(() => {
    if (convexUrl && convexUrl.startsWith("http")) {
      return new ConvexReactClient(convexUrl)
    }
    return null
  }, [convexUrl])

  // If no valid Convex URL, just render children without Convex provider
  if (!convex) {
    return <>{children}</>
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
