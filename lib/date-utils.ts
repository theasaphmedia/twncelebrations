const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const MONTH_ABBREV = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export interface DateInfo {
  day: number
  month: number
  year?: number
}

export function parseDate(dateStr: string): DateInfo | null {
  if (!dateStr || dateStr.trim() === "") return null

  const normalized = dateStr.trim()

  // Try DD-Mon format (e.g., "14-Feb")
  const ddMonMatch = normalized.match(/^(\d{1,2})[-/]([A-Za-z]+)$/i)
  if (ddMonMatch) {
    const day = parseInt(ddMonMatch[1])
    const monthStr = ddMonMatch[2].toLowerCase()
    const monthIndex = MONTH_ABBREV.findIndex(m => m.toLowerCase() === monthStr.substring(0, 3))
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      return { day, month: monthIndex + 1 }
    }
  }

  // Try Mon DD format (e.g., "Feb 14" or "February 14")
  const monDdMatch = normalized.match(/^([A-Za-z]+)\s*(\d{1,2})$/i)
  if (monDdMatch) {
    const monthStr = monDdMatch[1].toLowerCase()
    const day = parseInt(monDdMatch[2])
    let monthIndex = MONTH_ABBREV.findIndex(m => m.toLowerCase() === monthStr.substring(0, 3))
    if (monthIndex === -1) {
      monthIndex = MONTHS.findIndex(m => m.toLowerCase().startsWith(monthStr.substring(0, 3)))
    }
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      return { day, month: monthIndex + 1 }
    }
  }

  // Try MM/DD or MM-DD format
  const numericMatch = normalized.match(/^(\d{1,2})[-/](\d{1,2})$/)
  if (numericMatch) {
    const first = parseInt(numericMatch[1])
    const second = parseInt(numericMatch[2])
    // Assume MM/DD format (US style) - first is month, second is day
    if (first >= 1 && first <= 12 && second >= 1 && second <= 31) {
      return { day: second, month: first }
    }
    // Try DD/MM if MM/DD doesn't work
    if (second >= 1 && second <= 12 && first >= 1 && first <= 31) {
      return { day: first, month: second }
    }
  }

  // Try full month name (e.g., "February 14")
  const fullMonthMatch = normalized.match(/^([A-Za-z]+)\s+(\d{1,2})$/i)
  if (fullMonthMatch) {
    const monthStr = fullMonthMatch[1].toLowerCase()
    const day = parseInt(fullMonthMatch[2])
    const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthStr)
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      return { day, month: monthIndex + 1 }
    }
  }

  return null
}

export function formatDate(date: DateInfo): string {
  return `${MONTHS[date.month - 1]} ${date.day}`
}

export function getMonthName(month: number): string {
  return MONTHS[month - 1] || ""
}

export function getDaysUntil(date: DateInfo): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  let targetDate = new Date(currentYear, date.month - 1, date.day)
  
  // If the date has passed this year, use next year
  if (targetDate < now) {
    targetDate = new Date(currentYear + 1, date.month - 1, date.day)
  }
  
  const diffTime = targetDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isToday(date: DateInfo): boolean {
  const now = new Date()
  return date.day === now.getDate() && date.month === now.getMonth() + 1
}

export function isThisMonth(date: DateInfo): boolean {
  const now = new Date()
  return date.month === now.getMonth() + 1
}
