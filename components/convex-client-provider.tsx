"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"
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

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
