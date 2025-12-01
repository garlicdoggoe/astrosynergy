import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return `$${Math.abs(value).toFixed(2)}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Trades within this absolute dollar range are considered breakeven.
 * Keeping the threshold centralized ensures every viewer stays perfectly aligned.
 */
export const BREAKEVEN_THRESHOLD = 5

export type TradeOutcome = "win" | "loss" | "breakeven"

/**
 * Classifies a trade using the global breakeven tolerance.
 * Doing the math once here reduces mistakes in downstream analytics.
 */
export function getTradeOutcome(profitLoss: number): TradeOutcome {
  if (Math.abs(profitLoss) <= BREAKEVEN_THRESHOLD) {
    return "breakeven"
  }
  return profitLoss > 0 ? "win" : "loss"
}

// Convenience wrappers read clearer at call sites than repeating comparisons.
export function isWinningTrade(profitLoss: number): boolean {
  return getTradeOutcome(profitLoss) === "win"
}

export function isLosingTrade(profitLoss: number): boolean {
  return getTradeOutcome(profitLoss) === "loss"
}

export function isBreakEvenTrade(profitLoss: number): boolean {
  return getTradeOutcome(profitLoss) === "breakeven"
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Date[] = []

  // Use JavaScript's native Sunday-first (0=Sunday) layout
  // JavaScript: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const firstDayOfWeek = firstDay.getDay()

  // Add days from previous month to fill the first week (Sunday-first)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push(date)
  }

  // Add all days of the current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day))
  }

  // Add days from next month to fill the last week
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
  }

  return days
}

export function formatDateISO(date: Date): string {
  // Use local date formatting instead of UTC to avoid timezone issues
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts 24-hour format time string (HH:MM) to 12-hour format with AM/PM
 * Examples: "14:30" → "2:30 PM", "09:15" → "9:15 AM", "00:00" → "12:00 AM", "12:00" → "12:00 PM"
 * @param timeString - Time in 24-hour format (HH:MM)
 * @returns Time in 12-hour format with AM/PM indicator
 */
export function formatTime(timeString: string): string {
  // Parse the time string (HH:MM format)
  const [hoursStr, minutesStr] = timeString.split(":")
  const hours = Number.parseInt(hoursStr, 10)
  const minutes = minutesStr || "00"

  // Determine AM/PM and convert hour to 12-hour format
  let hour12: number
  let period: string

  if (hours === 0) {
    // Midnight (00:xx) → 12:xx AM
    hour12 = 12
    period = "AM"
  } else if (hours === 12) {
    // Noon (12:xx) → 12:xx PM
    hour12 = 12
    period = "PM"
  } else if (hours < 12) {
    // Morning hours (01:xx - 11:xx) → 1:xx AM - 11:xx AM
    hour12 = hours
    period = "AM"
  } else {
    // Afternoon/evening hours (13:xx - 23:xx) → 1:xx PM - 11:xx PM
    hour12 = hours - 12
    period = "PM"
  }

  // Format: hour (no leading zero) + minutes + AM/PM
  return `${hour12}:${minutes} ${period}`
}
