"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Sign-in page component that provides Clerk authentication
 * Uses Clerk for secure authentication flow with Convex integration
 */
export default function SignInPage() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
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

function RedirectToDashboard() {
  const router = useRouter()
  useEffect(() => {
    router.push("/dashboard")
  }, [router])
  return <LoadingSpinner />
}

function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Trading Journal</CardTitle>
          <CardDescription>
            Sign in to access your trading analytics and journal entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInButton 
            mode="modal"
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              }
            }}
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
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
