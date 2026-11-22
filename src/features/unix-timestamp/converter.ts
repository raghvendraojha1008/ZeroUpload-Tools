export interface FormattedDate {
  local: string
  utc: string
  iso: string
  relative: string
  isMilliseconds: boolean
}

export function formatTimestamp(rawInput: string | number): FormattedDate | null {
  const str = String(rawInput).trim()
  if (!str) return null

  const num = Number(str)
  if (isNaN(num)) return null

  // If number has 12 or more digits, it's likely milliseconds; otherwise seconds
  const isMs = Math.abs(num) >= 1e11
  const ms = isMs ? num : num * 1000

  const d = new Date(ms)
  if (isNaN(d.getTime())) return null

  const now = Date.now()
  const diffSec = Math.round((d.getTime() - now) / 1000)
  let relative = ''
  if (Math.abs(diffSec) < 60) {
    relative = diffSec >= 0 ? `in ${diffSec}s` : `${Math.abs(diffSec)}s ago`
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.round(diffSec / 60)
    relative = mins >= 0 ? `in ${mins}m` : `${Math.abs(mins)}m ago`
  } else if (Math.abs(diffSec) < 86400) {
    const hrs = Math.round(diffSec / 3600)
    relative = hrs >= 0 ? `in ${hrs}h` : `${Math.abs(hrs)}h ago`
  } else {
    const days = Math.round(diffSec / 86400)
    relative = days >= 0 ? `in ${days}d` : `${Math.abs(days)}d ago`
  }

  return {
    local: d.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }),
    utc: d.toUTCString(),
    iso: d.toISOString(),
    relative,
    isMilliseconds: isMs,
  }
}

export function dateToTimestamp(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
  isUtc: boolean
): { seconds: number; milliseconds: number } {
  let d: Date
  if (isUtc) {
    d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
  } else {
    d = new Date(year, month - 1, day, hours, minutes, seconds)
  }

  const ms = d.getTime()
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  }
}
