export interface CronFieldDetail {
  name: string
  raw: string
  description: string
  allowed: string
}

export interface CronParseResult {
  valid: boolean
  error?: string
  humanDescription: string
  fields: CronFieldDetail[]
  nextRuns: Date[]
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_MAP: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
}

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const DAY_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
}

function parseFieldValues(
  rawField: string,
  min: number,
  max: number,
  nameMap?: Record<string, number>
): Set<number> {
  const result = new Set<number>()
  const field = rawField.toUpperCase()

  const parts = field.split(',')
  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) result.add(i)
    } else if (part.includes('/')) {
      const [rangePart, stepStr] = part.split('/')
      const step = parseInt(stepStr, 10)
      if (isNaN(step) || step <= 0) throw new Error(`Invalid step "${stepStr}" in "${part}"`)

      let start = min
      let end = max
      if (rangePart !== '*' && rangePart !== '') {
        if (rangePart.includes('-')) {
          const [s, e] = rangePart.split('-')
          start = resolveValue(s, min, max, nameMap)
          end = resolveValue(e, min, max, nameMap)
        } else {
          start = resolveValue(rangePart, min, max, nameMap)
        }
      }
      for (let i = start; i <= end; i += step) {
        result.add(i)
      }
    } else if (part.includes('-')) {
      const [s, e] = part.split('-')
      const start = resolveValue(s, min, max, nameMap)
      const end = resolveValue(e, min, max, nameMap)
      if (start > end) throw new Error(`Invalid range "${part}"`)
      for (let i = start; i <= end; i++) {
        result.add(i)
      }
    } else {
      const val = resolveValue(part, min, max, nameMap)
      result.add(val)
    }
  }

  return result
}

function resolveValue(val: string, min: number, max: number, nameMap?: Record<string, number>): number {
  if (nameMap && nameMap[val] !== undefined) {
    return nameMap[val]
  }
  const num = parseInt(val, 10)
  if (isNaN(num)) throw new Error(`Invalid value "${val}"`)
  // 7 is also Sunday in some cron implementations
  if (max === 6 && num === 7) return 0
  if (num < min || num > max) {
    throw new Error(`Value ${num} out of bounds (${min}-${max})`)
  }
  return num
}

function formatMinutes(minSet: Set<number>, raw: string): string {
  if (raw === '*') return 'every minute'
  if (raw.startsWith('*/')) return `every ${raw.slice(2)} minutes`
  if (minSet.size === 1) {
    const val = [...minSet][0]
    return `at minute ${val}`
  }
  return `at minutes ${[...minSet].sort((a, b) => a - b).join(', ')}`
}

function formatHours(hourSet: Set<number>, raw: string): string {
  if (raw === '*') return 'past every hour'
  if (raw.startsWith('*/')) return `every ${raw.slice(2)} hours`
  const sorted = [...hourSet].sort((a, b) => a - b)
  const formatTime = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 === 0 ? 12 : h % 12
    return `${displayH} ${period}`
  }
  if (sorted.length === 1) return `at ${formatTime(sorted[0])}`
  return `during hours ${sorted.map(formatTime).join(', ')}`
}

function formatDays(daySet: Set<number>, raw: string): string {
  if (raw === '*') return 'every day'
  if (raw.startsWith('*/')) return `every ${raw.slice(2)} days`
  const sorted = [...daySet].sort((a, b) => a - b)
  return `on day ${sorted.join(', ')} of the month`
}

function formatMonths(monthSet: Set<number>, raw: string): string {
  if (raw === '*') return 'every month'
  const sorted = [...monthSet].sort((a, b) => a - b)
  return `in ${sorted.map((m) => MONTH_NAMES[m - 1]).join(', ')}`
}

function formatWeekdays(dowSet: Set<number>, raw: string): string {
  if (raw === '*') return 'every day of the week'
  const sorted = [...dowSet].sort((a, b) => a - b)
  if (sorted.length === 5 && [1, 2, 3, 4, 5].every((d) => dowSet.has(d))) {
    return 'Monday through Friday'
  }
  if (sorted.length === 2 && dowSet.has(0) && dowSet.has(6)) {
    return 'on weekends (Saturday & Sunday)'
  }
  return `on ${sorted.map((d) => DAY_NAMES[d]).join(', ')}`
}

export function explainCron(expression: string): { description: string; fields: CronFieldDetail[] } {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) {
    return {
      description: 'Invalid expression: must contain exactly 5 space-separated fields.',
      fields: [],
    }
  }

  const [minRaw, hourRaw, domRaw, monthRaw, dowRaw] = parts

  try {
    const minSet = parseFieldValues(minRaw, 0, 59)
    const hourSet = parseFieldValues(hourRaw, 0, 23)
    const domSet = parseFieldValues(domRaw, 1, 31)
    const monthSet = parseFieldValues(monthRaw, 1, 12, MONTH_MAP)
    const dowSet = parseFieldValues(dowRaw, 0, 6, DAY_MAP)

    // Build overall summary
    let summary = ''
    if (minRaw === '*' && hourRaw === '*' && domRaw === '*' && monthRaw === '*' && dowRaw === '*') {
      summary = 'Runs every single minute, every day.'
    } else if (minRaw.startsWith('*/') && hourRaw === '*' && domRaw === '*' && monthRaw === '*' && dowRaw === '*') {
      summary = `Runs every ${minRaw.slice(2)} minutes.`
    } else if (minRaw === '0' && hourRaw === '*' && domRaw === '*' && monthRaw === '*' && dowRaw === '*') {
      summary = 'Runs every hour on the hour.'
    } else if (minRaw === '0' && hourRaw === '0' && domRaw === '*' && monthRaw === '*' && dowRaw === '*') {
      summary = 'Runs every day at midnight (12:00 AM).'
    } else {
      const timePart = `${formatMinutes(minSet, minRaw)}, ${formatHours(hourSet, hourRaw)}`
      const datePart = domRaw !== '*' ? `, ${formatDays(domSet, domRaw)}` : ''
      const monthPart = monthRaw !== '*' ? `, ${formatMonths(monthSet, monthRaw)}` : ''
      const dowPart = dowRaw !== '*' ? `, ${formatWeekdays(dowSet, dowRaw)}` : ''
      summary = `Runs ${timePart}${datePart}${monthPart}${dowPart}.`
    }

    const fields: CronFieldDetail[] = [
      { name: 'Minute', raw: minRaw, description: formatMinutes(minSet, minRaw), allowed: '0–59' },
      { name: 'Hour', raw: hourRaw, description: formatHours(hourSet, hourRaw), allowed: '0–23' },
      { name: 'Day of Month', raw: domRaw, description: formatDays(domSet, domRaw), allowed: '1–31' },
      { name: 'Month', raw: monthRaw, description: formatMonths(monthSet, monthRaw), allowed: '1–12 or JAN–DEC' },
      { name: 'Day of Week', raw: dowRaw, description: formatWeekdays(dowSet, dowRaw), allowed: '0–6 (Sun–Sat)' },
    ]

    return { description: summary, fields }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { description: `Error: ${msg}`, fields: [] }
  }
}

export function getNextRuns(expression: string, count = 5, startDate = new Date()): Date[] {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) return []

  try {
    const minSet = parseFieldValues(parts[0], 0, 59)
    const hourSet = parseFieldValues(parts[1], 0, 23)
    const domSet = parseFieldValues(parts[2], 1, 31)
    const monthSet = parseFieldValues(parts[3], 1, 12, MONTH_MAP)
    const dowSet = parseFieldValues(parts[4], 0, 6, DAY_MAP)

    const matches: Date[] = []
    const current = new Date(startDate.getTime())
    // Round up to next whole minute
    current.setSeconds(0, 0)
    current.setMinutes(current.getMinutes() + 1)

    let iterations = 0
    const MAX_ITERATIONS = 525600 // 1 year of minutes

    while (matches.length < count && iterations < MAX_ITERATIONS) {
      iterations++
      const m = current.getMinutes()
      const h = current.getHours()
      const dom = current.getDate()
      const month = current.getMonth() + 1
      const dow = current.getDay()

      if (!monthSet.has(month)) {
        // Fast forward to next month
        current.setMonth(current.getMonth() + 1, 1)
        current.setHours(0, 0, 0, 0)
        continue
      }

      const domMatches = domSet.has(dom)
      const dowMatches = dowSet.has(dow)
      const dateMatches = (parts[2] === '*' && parts[4] === '*')
        ? true
        : parts[2] === '*'
        ? dowMatches
        : parts[4] === '*'
        ? domMatches
        : (domMatches || dowMatches)

      if (!dateMatches) {
        current.setDate(current.getDate() + 1)
        current.setHours(0, 0, 0, 0)
        continue
      }

      if (!hourSet.has(h)) {
        current.setHours(current.getHours() + 1, 0, 0, 0)
        continue
      }

      if (minSet.has(m)) {
        matches.push(new Date(current.getTime()))
      }

      current.setMinutes(current.getMinutes() + 1)
    }

    return matches
  } catch {
    return []
  }
}
