"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"

/**
 * Root page that shows different content based on authentication state
 * - Authenticated users see their content with UserButton
 * - Unauthenticated users see SignInButton
 * Uses Convex authentication components for proper state management
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Trading Journal</h1>
          <p className="text-muted-foreground mt-2">
            Professional trading analytics and journal platform
          </p>
        </div>
        
        <Authenticated>
          <div className="space-y-4">
            <div className="flex justify-center">
              <UserButton />
            </div>
            <Content />
          </div>
        </Authenticated>
        
        <Unauthenticated>
          <div className="space-y-4">
            <SignInButton 
              mode="modal"
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
            />
            <p className="text-center text-sm text-muted-foreground">
              Sign in to access your trading analytics and journal entries
            </p>
          </div>
        </Unauthenticated>
        
        <AuthLoading>
          <LoadingSpinner />
        </AuthLoading>
      </div>
    </div>
  )
}

/**
 * Content component that demonstrates authenticated Convex queries
 * This component is only rendered when user is authenticated
 * It can safely call Convex queries that require authentication
 */
function Content() {
  // This query will only run when the user is authenticated
  // because the component is wrapped in <Authenticated>
  const trades = useQuery(api.trades.getAllTrades)
  const portfolio = useQuery(api.portfolio.getPortfolio)
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Welcome back!</h2>
        <p className="text-muted-foreground">
          You have {trades?.length || 0} trades and your portfolio balance is ${portfolio?.balance?.toFixed(2) || '0.00'}
        </p>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
