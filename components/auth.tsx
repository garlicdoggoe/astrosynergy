"use client"

import { useConvexAuth } from "convex/react"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import type { ReactNode } from "react"

/**
 * Authentication UI component that shows different content based on auth state
 * Uses Convex authentication components for proper state management
 */
export function AuthUI() {
  return (
    <>
      <Authenticated>
        <UserButton />
      </Authenticated>
      <Unauthenticated>
        <SignInButton 
          mode="modal"
          forceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        />
      </Unauthenticated>
      <AuthLoading>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </AuthLoading>
    </>
  )
}

/**
 * Authentication wrapper component that handles sign in/out functionality
 * Can be used in headers, sidebars, or anywhere auth actions are needed
 */
interface AuthProps {
  children?: ReactNode
  className?: string
}

// Export Clerk's SignInButton directly - it handles authentication state automatically
export { SignInButton } from "@clerk/nextjs"

// Export Clerk's UserButton directly - it includes sign out functionality
export { UserButton } from "@clerk/nextjs"

// Custom sign out button using useConvexAuth for state checking
export function SignOutButton({ className }: { className?: string }) {
  const { isAuthenticated } = useConvexAuth()
  const { signOut } = useClerk()
  
  if (!isAuthenticated) {
    return null // Don't render if not authenticated
  }
  
  return (
    <Button
      onClick={async () => {
        await signOut({ redirectUrl: "/signin" })
      }}
      variant="ghost"
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}

/**
 * Component that conditionally renders children based on authentication state
 * Useful for protecting routes or showing different content for authenticated users
 * Uses Convex React components for proper authentication state handling
 */
export function AuthGuard({ children }: AuthProps) {
  return (
    <>
      <Authenticated>
        {children}
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Please sign in to access this content.</p>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </AuthLoading>
    </>
  )
}

/**
 * Component that renders content only for unauthenticated users
 * Useful for showing sign-in prompts or redirecting to sign-in page
 * Uses Convex React components for proper authentication state handling
 */
export function UnauthenticatedOnly({ children }: AuthProps) {
  return (
    <>
      <Authenticated>
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Already signed in.</p>
        </div>
      </Authenticated>
      <Unauthenticated>
        {children}
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </AuthLoading>
    </>
  )
}
