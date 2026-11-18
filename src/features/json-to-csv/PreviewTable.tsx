import { ChevronLeft, ChevronRight, FileJson, Table2 } from 'lucide-react'
import type { CsvRow } from './csv'
import { cn } from '../../lib/cn'

interface PreviewTableProps {
  rows: CsvRow[]
  columns: string[]
  page: number
  onPageChange: (page: number) => void
  pageSize?: number
  subtitle?: string
  emptyMessage?: string
}

export function PreviewTable({
  rows,
  columns,
  page,
  onPageChange,
  pageSize = 10,
  subtitle = 'Flattened output · 10 rows per page',
  emptyMessage = 'Paste JSON, drop a file or load the sample data — the flattened table appears here instantly.',
}: PreviewTableProps) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * pageSize
  const visibleRows = rows.slice(start, start + pageSize)
  const end = Math.min(start + pageSize, rows.length)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Table2 className="size-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Table preview
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </span>
      </div>

      {rows.length === 0 || columns.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <FileJson className="size-[18px]" />
          </span>
          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            No rows to preview yet
          </p>
          <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="scroll-slim w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-full border-collapse text-left text-[13px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 w-10 border-r border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right font-mono text-[10px] font-normal text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, rowIndex) => (
                  <tr
                    key={start + rowIndex}
                    className="bg-white transition-colors even:bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-950 dark:even:bg-slate-900/60 dark:hover:bg-slate-800/50"
                  >
                    <td className="sticky left-0 z-10 w-10 border-r border-b border-slate-200 bg-inherit px-3 py-2 text-right font-mono text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      {start + rowIndex + 1}
                    </td>
                    {columns.map((column) => {
                      const value = row[column] ?? ''
                      return (
                        <td
                          key={column}
                          title={value}
                          className={cn(
                            'max-w-[240px] truncate border-b border-slate-200 px-3 py-2 align-top text-slate-800 dark:border-slate-800 dark:text-slate-200',
                            value === '' && 'text-slate-400 dark:text-slate-400',
                          )}
                        >
                          {value === '' ? '—' : value}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Showing <span className="font-mono">{start + 1}</span>–
              <span className="font-mono">{end}</span> of{' '}
              <span className="font-mono">{rows.length}</span> rows
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(safePage - 1)}
                disabled={safePage === 0}
                aria-label="Previous page"
                className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                aria-label="Next page"
                className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
