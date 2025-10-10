"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
