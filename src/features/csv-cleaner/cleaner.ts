import { byteSize, formatBytes, type CsvRow, type Delimiter } from '../json-to-csv/csv'

export type DelimiterChoice = Delimiter | 'auto'

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
  delimiter: Delimiter
  ragged: number
  error: string | null
}

export interface CleanOptions {
  /** Zero-based indexes of the columns to keep, in output order. */
  columns: number[]
  trim: boolean
  dropEmpty: boolean
  dedupe: boolean
}

export interface CleanResult {
  headers: string[]
  rows: string[][]
  emptyRemoved: number
  duplicatesRemoved: number
}

export { byteSize, formatBytes }

/**
 * RFC 4180 parser: handles quoted fields, escaped quotes ("") and both CRLF and
 * LF line endings. Returns a matrix so ragged rows survive to be reported.
 */
export function parseDelimited(text: string, delimiter: Delimiter): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const source = text.replace(/^\uFEFF/, '')

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]

    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((cells) => !(cells.length === 1 && cells[0].trim() === ''))
}

/** Picks the delimiter that appears most often outside quotes on the first line. */
export function detectDelimiter(text: string): Delimiter {
  const candidates: Delimiter[] = [',', ';', '\t']
  const counts = new Map<Delimiter, number>(candidates.map((candidate) => [candidate, 0]))
  let inQuotes = false

  for (const char of text) {
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && (char === '\n' || char === '\r')) break
    if (!inQuotes && counts.has(char as Delimiter)) {
      counts.set(char as Delimiter, (counts.get(char as Delimiter) ?? 0) + 1)
    }
  }

  let best: Delimiter = ','
  for (const candidate of candidates) {
    if ((counts.get(candidate) ?? 0) > (counts.get(best) ?? 0)) best = candidate
  }
  return best
}

function normaliseHeaders(rawHeaders: string[]): string[] {
  const seen = new Map<string, number>()

  return rawHeaders.map((raw, index) => {
    const base = raw.trim() || `column_${index + 1}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}_${count + 1}`
  })
}

export function analyseCsv(text: string, choice: DelimiterChoice): ParsedCsv {
  const empty: ParsedCsv = { headers: [], rows: [], delimiter: ',', ragged: 0, error: null }
  if (!text.trim()) return empty

  const delimiter = choice === 'auto' ? detectDelimiter(text) : choice
  const matrix = parseDelimited(text, delimiter)

  if (matrix.length === 0) {
    return { ...empty, delimiter, error: 'No rows were found. Check that the file is plain CSV text.' }
  }

  const headers = normaliseHeaders(matrix[0])
  if (headers.length < 2 && matrix[0].length < 2) {
    return {
      ...empty,
      delimiter,
      error:
        'Only one column was detected. Pick the delimiter manually, or check that the first row really is a header row.',
    }
  }

  const rows = matrix.slice(1)
  const ragged = rows.filter((row) => row.length !== headers.length).length

  return { headers, rows, delimiter, ragged, error: null }
}

function sortColumns(columns: number[]): number[] {
  return [...columns].sort((a, b) => a - b)
}

export function cleanTable(parsed: ParsedCsv, options: CleanOptions): CleanResult {
  const indexes = sortColumns(options.columns).filter(
    (index) => index >= 0 && index < parsed.headers.length,
  )
  const headers = indexes.map((index) => parsed.headers[index])

  let emptyRemoved = 0
  let duplicatesRemoved = 0
  const seen = new Set<string>()
  const rows: string[][] = []

  for (const sourceRow of parsed.rows) {
    const cells = indexes.map((index) => {
      const value = sourceRow[index] ?? ''
      return options.trim ? value.trim() : value
    })

    if (options.dropEmpty && cells.every((cell) => cell === '')) {
      emptyRemoved += 1
      continue
    }

    if (options.dedupe) {
      const key = cells.join('\u0001')
      if (seen.has(key)) {
        duplicatesRemoved += 1
        continue
      }
      seen.add(key)
    }

    rows.push(cells)
  }

  return { headers, rows, emptyRemoved, duplicatesRemoved }
}

function escapeCell(value: string, delimiter: string): string {
  if (value.includes(delimiter) || /["\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Serialises the cleaned matrix back into CSV with CRLF line endings. */
export function toCsv(rows: string[][], headers: string[], delimiter: Delimiter): string {
  if (headers.length === 0) return ''
  const lines = [headers.map((header) => escapeCell(header, delimiter)).join(delimiter)]
  for (const row of rows) {
    lines.push(row.map((cell) => escapeCell(cell, delimiter)).join(delimiter))
  }
  return lines.join('\r\n')
}

export function toRowObjects(rows: string[][], headers: string[]): CsvRow[] {
  return rows.map((cells) => {
    const record: CsvRow = {}
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? ''
    })
    return record
  })
}

export function cleanedFileName(uploadedName: string | null): string {
  if (!uploadedName) return 'zeroupload-cleaned.csv'
  return `${uploadedName.replace(/\.csv$/i, '')}-cleaned.csv`
}
