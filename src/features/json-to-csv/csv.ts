export type Delimiter = ',' | ';' | '\t'

export type CsvRow = Record<string, string>

export interface CsvOptions {
  delimiter: Delimiter
  quoteAll: boolean
}

export interface JsonAnalysis {
  rows: CsvRow[]
  columns: string[]
  error: string | null
}

const encoder = new TextEncoder()

/**
 * Flattens one value into `prefix`-keyed string cells.
 * Nested objects use underscore paths (`user.address.city` -> `user_address_city`);
 * arrays of primitives are joined, arrays of objects are indexed (`items_0_sku`).
 */
function flattenValue(value: unknown, key: string, out: CsvRow): void {
  if (value === null || value === undefined) {
    out[key] = ''
    return
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      out[key] = ''
      return
    }

    const onlyPrimitives = value.every((item) => item === null || typeof item !== 'object')
    if (onlyPrimitives) {
      out[key] = value
        .map((item) => (item === null || item === undefined ? '' : String(item)))
        .join('; ')
      return
    }

    value.forEach((item, index) => {
      flattenValue(item, key ? `${key}_${index}` : String(index), out)
    })
    return
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      out[key] = ''
      return
    }
    for (const [childKey, childValue] of entries) {
      flattenValue(childValue, key ? `${key}_${childKey}` : childKey, out)
    }
    return
  }

  out[key] = String(value)
}

/** Turns any parsed JSON value into a single flat row of string cells. */
export function flattenRecord(value: unknown): CsvRow {
  const row: CsvRow = {}
  if (value === null || value === undefined) return row

  if (typeof value !== 'object') {
    row.value = String(value)
    return row
  }

  flattenValue(value, '', row)
  return row
}

/** Accepts an array of records or a single object and returns flat rows. */
export function toRows(data: unknown): CsvRow[] {
  if (Array.isArray(data)) return data.map((item) => flattenRecord(item))
  return [flattenRecord(data)]
}

/** Builds the column list from the union of keys, preserving first-seen order. */
export function collectColumns(rows: CsvRow[]): string[] {
  const columns: string[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }

  return columns
}

function escapeCell(value: string, delimiter: string, quoteAll: boolean): string {
  const needsQuotes = quoteAll || value.includes(delimiter) || /["\r\n]/.test(value)
  if (!needsQuotes) return value
  return `"${value.replace(/"/g, '""')}"`
}

/** Serializes rows into RFC 4180-style CSV with CRLF line endings (Excel friendly). */
export function serializeCsv(rows: CsvRow[], columns: string[], options: CsvOptions): string {
  if (columns.length === 0) return ''

  const { delimiter, quoteAll } = options
  const lines = [columns.map((column) => escapeCell(column, delimiter, quoteAll)).join(delimiter)]

  for (const row of rows) {
    lines.push(
      columns.map((column) => escapeCell(row[column] ?? '', delimiter, quoteAll)).join(delimiter),
    )
  }

  return lines.join('\r\n')
}

export function byteSize(text: string): number {
  return encoder.encode(text).length
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

function describeJsonError(error: unknown, text: string): string {
  const message = error instanceof Error ? error.message : 'Unknown parse error.'
  const positionMatch = /position (\d+)/.exec(message)

  if (!positionMatch) return message

  const position = Number(positionMatch[1])
  const before = text.slice(0, position)
  const line = before.split('\n').length
  const column = position - before.lastIndexOf('\n')

  return `Invalid JSON near line ${line}, column ${column}. ${message}`
}

/** Parses JSON text and precomputes the flattened rows, columns and any error. */
export function analyseJson(text: string): JsonAnalysis {
  if (!text.trim()) return { rows: [], columns: [], error: null }

  try {
    const data: unknown = JSON.parse(text)
    const rows = toRows(data)
    return { rows, columns: collectColumns(rows), error: null }
  } catch (error) {
    return { rows: [], columns: [], error: describeJsonError(error, text) }
  }
}

export function outputFileName(uploadedName: string | null): string {
  if (!uploadedName) return 'zeroupload-data.csv'
  return `${uploadedName.replace(/\.json$/i, '')}.csv`
}
