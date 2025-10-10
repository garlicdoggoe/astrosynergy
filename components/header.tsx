"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/auth"

/**
 * Header component with theme toggle and sign-out functionality
 * Only visible to authenticated users (wrapped by AuthGuard in layout)
 */
export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold">Trading Journal</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <SignOutButton />
      </div>
    </header>
  )
}
