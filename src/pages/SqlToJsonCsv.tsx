import { useEffect, useMemo, useState } from 'react'
import {
  Braces,
  Columns3,
  Database,
  Download,
  FileCode2,
  Lock,
  Rows3,
  Sparkles,
  Table2,
  Trash2,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { ErrorBanner } from '../components/ErrorBanner'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { FileDropZone } from '../components/FileDropZone'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { SAMPLE_SQL } from '../features/sql-to-json-csv/sample'
import { MAX_SQL_ROWS, parseSql, toCsv, toJson } from '../features/sql-to-json-csv/parse'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/sql-to-json-csv/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { triggerDownload } from '../lib/download'
import { cn } from '../lib/cn'

type OutputFormat = 'json' | 'csv'

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'SQL to JSON / CSV Converter',
  description:
    'Convert SQL INSERT statements and table dumps into a JSON array or clean CSV, entirely in the browser.',
  features: [
    'Parses single and multi-row INSERT statements',
    'Reads CREATE TABLE column definitions',
    'JSON array of objects or CSV output',
    'Multiple tables in one dump',
    'Copy or download the result',
    'Client-side processing',
  ],
})

export function SqlToJsonCsv() {
  const toast = useToast()
  const [source, setSource] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [format, setFormat] = useState<OutputFormat>('json')
  const [tableIndex, setTableIndex] = useState(0)

  usePageMeta(PAGE_META.sqlToJsonCsv)

  const analysis = useMemo(() => parseSql(source), [source])
  const activeIndex = Math.min(tableIndex, Math.max(analysis.tables.length - 1, 0))
  const table = analysis.tables[activeIndex]

  const output = useMemo(() => {
    if (!table) return ''
    return format === 'json' ? toJson(table) : toCsv(table)
  }, [table, format])

  useEffect(() => {
    setTableIndex(0)
    setErrorDismissed(false)
  }, [source])

  const error = readError ?? analysis.error
  const downloadName =
    format === 'json'
      ? `${(fileName ?? table?.name ?? 'query').replace(/\.(sql|txt)$/i, '')}.json`
      : `${(fileName ?? table?.name ?? 'query').replace(/\.(sql|txt)$/i, '')}.csv`

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      setSource(text)
      setFileName(file.name)
      setReadError(null)
    } catch {
      setReadError('That file could not be read. Try a plain-text .sql file.')
    }
  }

  function loadSample() {
    setSource(SAMPLE_SQL)
    setFileName(null)
    setReadError(null)
    toast('Sample dump loaded')
  }

  function reset() {
    setSource('')
    setFileName(null)
    setReadError(null)
  }

  function download() {
    if (!output) return
    if (format === 'json') {
      triggerDownload(output, downloadName, 'application/json;charset=utf-8')
    } else {
      triggerDownload(`\uFEFF${output}`, downloadName, 'text/csv;charset=utf-8')
    }
    toast(`Downloaded ${downloadName}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="sql-to-json-csv-app-schema" data={APP_SCHEMA} />
      <JsonLd id="sql-to-json-csv-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'SQL to JSON / CSV' }]} />

      <ToolHeader
        title="SQL to JSON / CSV"
        highlight="Converter"
        description="Paste INSERT statements or a full table dump and get a JSON array or clean CSV — parsed in this tab, with every table in the dump picked out for you."
        badges={[
          { icon: Database, label: 'INSERT & dump aware' },
          { icon: Lock, label: 'Query never uploaded' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            { label: 'Rows', value: table ? table.rows.length.toLocaleString() : '0', icon: Rows3 },
            {
              label: 'Columns',
              value: table ? table.columns.length.toLocaleString() : '0',
              icon: Columns3,
            },
            {
              label: 'Table',
              value: table ? table.name : '—',
              icon: Table2,
            },
          ]}
        />

        {error && !errorDismissed ? (
          <ErrorBanner
            title="Nothing to convert yet"
            hint="Everything is parsed locally — fix the statement above and the preview appears instantly."
            message={error}
            onDismiss={() => setErrorDismissed(true)}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="SQL input"
            icon={FileCode2}
            className="lg:col-span-2"
            action={
              <button
                type="button"
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Sparkles className="size-3.5" />
                Load sample dump
              </button>
            }
          >
            <div className="space-y-3">
              <FileDropZone
                accept=".sql,.txt,text/plain,application/sql"
                fileName={fileName}
                onFile={handleFile}
                title="Drop a .sql dump, or click to browse"
                hint="Read in this tab only. Nothing is uploaded."
                icon={Database}
              />

              <div>
                <label htmlFor="sql-input" className="sr-only">
                  SQL statements
                </label>
                <textarea
                  id="sql-input"
                  value={source}
                  onChange={(event) => {
                    setSource(event.target.value)
                    setFileName(null)
                    setReadError(null)
                  }}
                  spellCheck={false}
                  aria-invalid={Boolean(error)}
                  placeholder={
                    'INSERT INTO users (id, name, active)\nVALUES (1, \'Ada\', TRUE), (2, \'Grace\', FALSE);\n\n-- or paste a whole table dump'
                  }
                  className="scroll-slim min-h-[280px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
                />
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="size-3.5 shrink-0" />
                Parsed with regular expressions on this device · 0 bytes uploaded
              </p>
            </div>
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Output format">
              <div
                role="group"
                aria-label="Output format"
                className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/60"
              >
                {(
                  [
                    { value: 'json', label: 'JSON', icon: Braces },
                    { value: 'csv', label: 'CSV', icon: Table2 },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon
                  const isActive = format === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormat(option.value)}
                      aria-pressed={isActive}
                      className={cn(
                        'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium transition',
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                      )}
                    >
                      <Icon className="size-3.5" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                JSON keys come from the column list, or from CREATE TABLE when the dump omits it.
              </p>
            </Panel>

            <Panel title="Actions">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={download}
                  disabled={!output}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Download className="size-4" />
                  Download .{format}
                </button>
                <CopyButton
                  value={output}
                  label="Copy output"
                  variant="outline"
                  className="w-full"
                  disabled={!output}
                  toastMessage={`${format.toUpperCase()} copied`}
                />
                <button
                  type="button"
                  onClick={reset}
                  disabled={!source}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </button>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>

        <Panel
          title="Converted output"
          subtitle={
            table
              ? `${table.rows.length.toLocaleString()} rows · ${table.columns.length} columns`
              : 'waiting for SQL'
          }
          action={
            analysis.tables.length > 1 ? (
              <label className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                Table
                <select
                  value={activeIndex}
                  onChange={(event) => setTableIndex(Number(event.target.value))}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {analysis.tables.map((item, index) => (
                    <option key={`${item.name}-${index}`} value={index}>
                      {item.name} ({item.rows.length})
                    </option>
                  ))}
                </select>
              </label>
            ) : null
          }
          bodyClassName="p-0"
        >
          {output ? (
            <pre className="scroll-slim max-h-[460px] overflow-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre text-slate-800 dark:text-slate-200">
              {output}
            </pre>
          ) : (
            <p className="px-5 py-12 text-center text-[13px] text-slate-500 dark:text-slate-400">
              Paste INSERT statements above to see the JSON or CSV here.
            </p>
          )}

          {analysis.truncated ? (
            <p className="border-t border-slate-200 px-4 py-2.5 text-[11px] text-amber-700 dark:border-slate-800 dark:text-amber-300">
              Stopped at {MAX_SQL_ROWS.toLocaleString()} rows to keep the tab responsive.
            </p>
          ) : null}
        </Panel>
      </div>

      <ToolGuide
        howToTitle="How to convert SQL to JSON or CSV"
        howToIntro="Three steps, and the largest file you can convert is limited only by your memory — not by an upload limit."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Dialects, dumps, NULL handling and the row cap."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
