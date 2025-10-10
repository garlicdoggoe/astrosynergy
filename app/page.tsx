"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Root page that shows different content based on authentication state
 * - Authenticated users see their content with UserButton
 * - Unauthenticated users see SignInButton
 * Uses Convex authentication components for proper state management
 * Now uses card-based format consistent with signin page
 */
export default function Home() {
  return (
    <>
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <AuthLoading>
        <LoadingSpinner />
      </AuthLoading>
    </>
  )
}

/**
 * Sign-in form component using card-based design consistent with signin page
 * Shows the same styling and layout as the dedicated signin page
 */
function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-muted">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">AstroSynergy</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            A Simple Trading Journal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
            <Button className="w-full" size="lg">
              Sign in
            </Button>
          </SignInButton>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Authenticated content component that demonstrates authenticated Convex queries
 * This component is only rendered when user is authenticated
 * It can safely call Convex queries that require authentication
 * Uses card-based design for consistency
 */
function AuthenticatedContent() {
  // This query will only run when the user is authenticated
  // because the component is wrapped in <Authenticated>
  const trades = useQuery(api.trades.getAllTrades)
  const portfolio = useQuery(api.portfolio.getPortfolio)
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-muted">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back!</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            You have {trades?.length || 0} trades and your portfolio balance is ${portfolio?.balance?.toFixed(2) || '0.00'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <UserButton />
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full" 
            size="lg"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
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
