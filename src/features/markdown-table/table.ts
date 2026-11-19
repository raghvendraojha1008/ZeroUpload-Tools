export type Alignment = 'left' | 'center' | 'right'

/** Pipes and newlines break a table row, so they are escaped before padding. */
export function escapeCell(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim()
}

function separator(alignment: Alignment, width: number): string {
  if (alignment === 'center') {
    const dashCount = Math.max(5, width)
    return `:${'-'.repeat(dashCount - 2)}:`
  }
  const dashCount = Math.max(3, width)
  return alignment === 'right' ? `${'-'.repeat(dashCount - 1)}:` : `:${'-'.repeat(dashCount - 1)}`
}

/**
 * Builds a padded GFM table. Padding is cosmetic — renderers ignore it — but it
 * keeps the copied Markdown readable inside a plain-text editor or README diff.
 */
export function buildMarkdown(
  header: string[],
  rows: string[][],
  alignment: Alignment[],
): string {
  const escapedHeader = header.map(escapeCell)
  const escapedRows = rows.map((row) => header.map((_, index) => escapeCell(row[index] ?? '')))

  const widths = escapedHeader.map((cell, index) => {
    const columnValues = escapedRows.map((row) => row[index].length)
    const base = Math.max(cell.length, ...columnValues, 3)
    return alignment[index] === 'center' ? Math.max(base, 5) : base
  })

  const pad = (value: string, index: number) => value.padEnd(widths[index], ' ')

  const lines = [
    `| ${escapedHeader.map(pad).join(' | ')} |`,
    `| ${alignment.map((value, index) => separator(value, widths[index])).join(' | ')} |`,
    ...escapedRows.map((row) => `| ${row.map(pad).join(' | ')} |`),
  ]

  return lines.join('\n')
}
