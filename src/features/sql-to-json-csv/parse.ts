export type SqlValue = string | number | boolean | null

export interface SqlTable {
  name: string
  columns: string[]
  rows: SqlValue[][]
}

export interface SqlParseResult {
  tables: SqlTable[]
  statements: number
  truncated: boolean
  error: string | null
}

/** Rows beyond this are ignored so a giant dump cannot lock up the tab. */
export const MAX_SQL_ROWS = 5000

const IDENTIFIER = '[`"\\[\\]\\w.$]+'
const CONSTRAINT_WORDS =
  /^(primary|foreign|unique|key|constraint|check|index|fulltext|spatial|period|exclude)$/i

function cleanIdentifier(raw: string): string {
  return raw.trim().replace(/^[`"[]+/, '').replace(/[`"\]]+$/, '')
}

/** Splits on a separator that is not inside quotes or nested parentheses. */
function splitTopLevel(input: string, separator: string): string[] {
  const parts: string[] = []
  let current = ''
  let quote: string | null = null
  let depth = 0

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (quote) {
      current += char
      if (char === '\\' && i + 1 < input.length) {
        current += input[i + 1]
        i += 1
        continue
      }
      if (char === quote) {
        if (input[i + 1] === quote) {
          current += input[i + 1]
          i += 1
          continue
        }
        quote = null
      }
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char
      current += char
      continue
    }
    if (char === '(') {
      depth += 1
      current += char
      continue
    }
    if (char === ')') {
      depth -= 1
      current += char
      continue
    }
    if (char === separator && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }

  parts.push(current)
  return parts
}

/** Returns the text between an opening paren and its matching close. */
function readParenthesised(source: string, openIndex: number): string | null {
  let depth = 0
  let quote: string | null = null

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i]

    if (quote) {
      if (char === '\\') {
        i += 1
        continue
      }
      if (char === quote) {
        if (source[i + 1] === quote) {
          i += 1
          continue
        }
        quote = null
      }
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '(') {
      depth += 1
      continue
    }
    if (char === ')') {
      depth -= 1
      if (depth === 0) return source.slice(openIndex + 1, i)
    }
  }

  return null
}

function unquote(token: string): string {
  const quote = token[0]
  const closed = token.length > 1 && token[token.length - 1] === quote
  const body = closed ? token.slice(1, -1) : token.slice(1)
  let output = ''

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i]

    if (char === '\\' && i + 1 < body.length) {
      const next = body[(i += 1)]
      if (next === 'n') output += '\n'
      else if (next === 'r') output += '\r'
      else if (next === 't') output += '\t'
      else if (next === '0') output += '\0'
      else output += next
      continue
    }

    if (char === quote && body[i + 1] === quote) {
      output += quote
      i += 1
      continue
    }

    output += char
  }

  return output
}

function coerceValue(raw: string): SqlValue {
  const token = raw.trim()
  if (!token) return ''

  const first = token[0]
  if ((first === "'" || first === '"' || first === '`') && token.length > 1) {
    return unquote(token)
  }

  if (/^null$/i.test(token)) return null
  if (/^true$/i.test(token)) return true
  if (/^false$/i.test(token)) return false
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(token)) return Number(token)

  // DEFAULT, NOW(), X'1F', 0x2A… stay as text so no information is invented.
  return token
}

function parseTuple(
  source: string,
  openIndex: number,
): { values: SqlValue[]; end: number } | null {
  const values: SqlValue[] = []
  let current = ''
  let quote: string | null = null
  let depth = 0

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i]

    if (quote) {
      current += char
      if (char === '\\' && i + 1 < source.length) {
        current += source[i + 1]
        i += 1
        continue
      }
      if (char === quote) {
        if (source[i + 1] === quote) {
          current += source[i + 1]
          i += 1
          continue
        }
        quote = null
      }
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char
      current += char
      continue
    }
    if (char === '(') {
      depth += 1
      if (depth > 1) current += char
      continue
    }
    if (char === ')') {
      depth -= 1
      if (depth === 0) {
        values.push(coerceValue(current))
        return { values, end: i + 1 }
      }
      current += char
      continue
    }
    if (char === ',' && depth === 1) {
      values.push(coerceValue(current))
      current = ''
      continue
    }
    if (depth >= 1) current += char
  }

  return null
}

function parseTuples(source: string, start: number): { rows: SqlValue[][]; end: number } {
  const rows: SqlValue[][] = []
  let index = start

  while (index < source.length) {
    while (index < source.length && /[\s,]/.test(source[index])) index += 1
    if (source[index] !== '(') break

    const tuple = parseTuple(source, index)
    if (!tuple) break

    rows.push(tuple.values)
    index = tuple.end
  }

  return { rows, end: index }
}

/** Reads column definitions from CREATE TABLE blocks so dumps without column lists work. */
function extractCreateColumns(source: string): Map<string, string[]> {
  const map = new Map<string, string[]>()
  const pattern = new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(${IDENTIFIER})\\s*\\(`,
    'gi',
  )
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source))) {
    const body = readParenthesised(source, match.index + match[0].length - 1)
    if (!body) continue

    const columns = splitTopLevel(body, ',')
      .map((part) => cleanIdentifier(part.trim().split(/\s+/)[0] ?? ''))
      .filter((name) => Boolean(name) && !CONSTRAINT_WORDS.test(name))

    if (columns.length > 0) {
      map.set(cleanIdentifier(match[1]), columns)
    }
  }

  return map
}

/**
 * Parses INSERT statements (single or multi-row) out of a pasted query or dump.
 * It never executes SQL — it only reads the VALUES tuples.
 */
export function parseSql(source: string): SqlParseResult {
  const empty: SqlParseResult = { tables: [], statements: 0, truncated: false, error: null }
  if (!source.trim()) return empty

  const createColumns = extractCreateColumns(source)
  const pattern = new RegExp(
    `insert\\s+(?:or\\s+\\w+\\s+)?into\\s+(${IDENTIFIER})\\s*(?:\\(([^()]*)\\))?\\s*values\\s*`,
    'gi',
  )
  const tables = new Map<string, SqlTable>()
  let statements = 0
  let truncated = false
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source))) {
    const tableName = cleanIdentifier(match[1])
    if (!tableName) continue

    const { rows } = parseTuples(source, pattern.lastIndex)
    if (rows.length === 0) continue

    statements += 1

    const explicit = match[2]
      ? splitTopLevel(match[2], ',')
          .map((column) => cleanIdentifier(column))
          .filter(Boolean)
      : []
    const declared =
      createColumns.get(tableName) ??
      createColumns.get(tableName.split('.').pop() ?? '') ??
      []

    const table = tables.get(tableName) ?? { name: tableName, columns: [], rows: [] }
    const header = explicit.length > 0 ? explicit : declared.length > 0 ? declared : table.columns
    const width = Math.max(header.length, rows[0].length)
    const statementColumns =
      header.length > 0
        ? [...header]
        : Array.from({ length: width }, (_, index) => `column_${index + 1}`)

    for (let i = statementColumns.length; i < width; i += 1) {
      statementColumns.push(`column_${i + 1}`)
    }
    for (const name of statementColumns) {
      if (!table.columns.includes(name)) table.columns.push(name)
    }

    for (const values of rows) {
      if (table.rows.length >= MAX_SQL_ROWS) {
        truncated = true
        break
      }

      const record: SqlValue[] = table.columns.map(() => null)
      statementColumns.forEach((name, index) => {
        const target = table.columns.indexOf(name)
        if (target >= 0 && index < values.length) record[target] = values[index]
      })
      table.rows.push(record)
    }

    tables.set(tableName, table)
  }

  if (statements === 0) {
    return {
      ...empty,
      error:
        'No INSERT INTO … VALUES (…) statements were found. Paste INSERT statements or a full table dump.',
    }
  }

  return { tables: [...tables.values()], statements, truncated, error: null }
}

export function toRecords(table: SqlTable): Array<Record<string, SqlValue>> {
  return table.rows.map((row) => {
    const record: Record<string, SqlValue> = {}
    table.columns.forEach((column, index) => {
      record[column] = row[index] ?? null
    })
    return record
  })
}

export function toJson(table: SqlTable): string {
  return JSON.stringify(toRecords(table), null, 2)
}

function csvCell(value: SqlValue): string {
  if (value === null) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(table: SqlTable): string {
  const header = table.columns.map((column) => csvCell(column)).join(',')
  const body = table.rows.map((row) => row.map((value) => csvCell(value ?? null)).join(','))
  return [header, ...body].join('\n')
}
