import { useEffect, useMemo, useState } from 'react'
import {
  Columns3,
  Download,
  Filter,
  Lock,
  RotateCcw,
  Sparkles,
  Table2,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { ErrorBanner } from '../components/ErrorBanner'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { FileDropZone } from '../components/FileDropZone'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { Switch } from '../components/Switch'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { PreviewTable } from '../features/json-to-csv/PreviewTable'
import type { Delimiter } from '../features/json-to-csv/csv'
import {
  analyseCsv,
  byteSize,
  cleanedFileName,
  cleanTable,
  formatBytes,
  toCsv,
  toRowObjects,
  type DelimiterChoice,
} from '../features/csv-cleaner/cleaner'
import { SAMPLE_CSV } from '../features/csv-cleaner/sample'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/csv-cleaner/content'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const INPUT_DELIMITERS: Array<{ value: DelimiterChoice; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: ',', label: 'Comma' },
  { value: ';', label: 'Semicolon' },
  { value: '\t', label: 'Tab' },
]

const OUTPUT_DELIMITERS: Array<{ value: Delimiter; label: string }> = [
  { value: ',', label: 'Comma' },
  { value: ';', label: 'Semicolon' },
  { value: '\t', label: 'Tab' },
]

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'CSV Column Cleaner',
  description:
    'Pick the columns you need, trim whitespace, drop empty and duplicate rows, then export a sanitised CSV without uploading the file.',
  features: [
    'Automatic delimiter detection',
    'Column selection',
    'Whitespace trimming',
    'Empty and duplicate row removal',
    'RFC 4180 quoted field support',
    'Client-side processing',
  ],
})

export function CsvColumnCleaner() {
  usePageMeta({
    title: 'CSV Column Cleaner & Filter — Drop Columns Online',
    description:
      'Clean, filter and remove CSV columns online for free. Select columns to keep, trim whitespace, drop empty or duplicate rows, and export clean CSVs locally.',
    path: '/tools/csv-column-cleaner',
  })

  const toast = useToast()
  const [source, setSource] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [inputDelimiter, setInputDelimiter] = useState<DelimiterChoice>('auto')
  const [outputDelimiter, setOutputDelimiter] = useState<Delimiter>(',')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [trim, setTrim] = useState(true)
  const [dropEmpty, setDropEmpty] = useState(true)
  const [dedupe, setDedupe] = useState(false)
  const [page, setPage] = useState(0)

  const parsed = useMemo(
    () => analyseCsv(source, inputDelimiter),
    [source, inputDelimiter],
  )

  const columnSignature = parsed.headers.join('\u0001')

  useEffect(() => {
    setSelected(new Set(parsed.headers.map((_, index) => index)))
    setPage(0)
    // Selection resets only when the column set itself changes.
  }, [columnSignature])

  useEffect(() => {
    setPage(0)
    setErrorDismissed(false)
  }, [source])

  const columns = useMemo(() => [...selected].sort((a, b) => a - b), [selected])

  const cleaned = useMemo(
    () => cleanTable(parsed, { columns, trim, dropEmpty, dedupe }),
    [parsed, columns, trim, dropEmpty, dedupe],
  )

  const csv = useMemo(
    () => toCsv(cleaned.rows, cleaned.headers, outputDelimiter),
    [cleaned, outputDelimiter],
  )

  const previewRows = useMemo(
    () => toRowObjects(cleaned.rows, cleaned.headers),
    [cleaned],
  )

  const error = readError ?? (errorDismissed ? null : parsed.error)
  const hasOutput = cleaned.headers.length > 0 && cleaned.rows.length > 0

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      setSource(text)
      setFileName(file.name)
      setReadError(null)
    } catch {
      setReadError('That file could not be read. Try a plain-text .csv file.')
    }
  }

  function loadSample() {
    setSource(SAMPLE_CSV)
    setFileName(null)
    setReadError(null)
    toast('Sample CSV loaded')
  }

  function reset() {
    setSource('')
    setFileName(null)
    setReadError(null)
    setSelected(new Set())
    setPage(0)
  }

  function toggleColumn(index: number) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function download() {
    if (!csv) return
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = cleanedFileName(fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast(`Downloaded ${cleanedFileName(fileName)}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="csv-cleaner-app-schema" data={APP_SCHEMA} />
      <JsonLd id="csv-cleaner-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'CSV Column Cleaner' }]} />

      <ToolHeader
        title="CSV Column Cleaner"
        highlight="& Row Sanitiser"
        description="Keep only the columns you need, trim stray whitespace, drop empty and duplicate rows, then export a clean spreadsheet — all in this tab."
        badges={[
          { icon: Columns3, label: 'Pick any columns' },
          { icon: Lock, label: '100% in-browser' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            { label: 'Input rows', value: parsed.rows.length.toLocaleString(), icon: Table2 },
            { label: 'Output rows', value: cleaned.rows.length.toLocaleString(), icon: Filter },
            {
              label: 'Kept columns',
              value: `${cleaned.headers.length}`,
              icon: Columns3,
            },
            {
              label: 'Est. file size',
              value: hasOutput ? formatBytes(byteSize(csv)) : '—',
              icon: Download,
            },
          ]}
        />

        {error ? (
          <ErrorBanner
            title="CSV could not be read"
            hint="Nothing was sent anywhere — adjust the delimiter or the first row and the preview updates instantly."
            message={error}
            onDismiss={() => setErrorDismissed(true)}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="CSV input"
            className="lg:col-span-2"
            action={
              <button
                type="button"
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Sparkles className="size-3.5" />
                Load sample data
              </button>
            }
          >
            <div className="space-y-3">
              <FileDropZone
                accept=".csv,.tsv,text/csv,text/plain"
                fileName={fileName}
                onFile={handleFile}
                title="Drop a .csv file, or click to browse"
                hint="Read in this tab only. Nothing is uploaded."
              />

              <label htmlFor="csv-input" className="sr-only">
                CSV content
              </label>
              <textarea
                id="csv-input"
                value={source}
                onChange={(event) => {
                  setSource(event.target.value)
                  setFileName(null)
                  setReadError(null)
                }}
                spellCheck={false}
                aria-invalid={Boolean(error)}
                placeholder={'name,email,plan\nAda,ada@analytical.dev,Pro\nGrace,grace@compiler.dev,Team'}
                className="scroll-slim min-h-[220px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
              />

              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Parsed on this device · 0 bytes uploaded
                </span>
                {parsed.delimiter ? (
                  <span className="font-mono">
                    detected:{' '}
                    {parsed.delimiter === '\t'
                      ? 'tab'
                      : parsed.delimiter === ','
                        ? 'comma'
                        : 'semicolon'}
                  </span>
                ) : null}
              </p>
            </div>
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Cleaning rules">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Input delimiter
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
                    {INPUT_DELIMITERS.map((option) => {
                      const isActive = inputDelimiter === option.value
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setInputDelimiter(option.value)}
                          aria-pressed={isActive}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-[11px] font-medium transition',
                            isActive
                              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                          )}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Output delimiter
                  </span>
                  <div
                    role="group"
                    aria-label="Output delimiter"
                    className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {OUTPUT_DELIMITERS.map((option) => {
                      const isActive = outputDelimiter === option.value
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setOutputDelimiter(option.value)}
                          aria-pressed={isActive}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-[11px] font-medium transition',
                            isActive
                              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                          )}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3.5 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <Switch
                    checked={trim}
                    onChange={setTrim}
                    label="Trim whitespace"
                    description="Remove leading and trailing spaces from every kept cell."
                  />
                  <Switch
                    checked={dropEmpty}
                    onChange={setDropEmpty}
                    label="Drop empty rows"
                    description="Remove rows where every kept column is blank."
                  />
                  <Switch
                    checked={dedupe}
                    onChange={setDedupe}
                    label="Remove duplicates"
                    description="Keep the first row for each unique combination of kept columns."
                  />
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={download}
                    disabled={!hasOutput}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <Download className="size-4" />
                    Download .CSV
                  </button>

                  <CopyButton
                    value={csv}
                    label="Copy cleaned CSV"
                    className="w-full py-2.5 text-[13px]"
                    disabled={!hasOutput}
                    toastMessage="Cleaned CSV copied!"
                  />

                  <button
                    type="button"
                    onClick={reset}
                    disabled={!source}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>

        <Panel
          title="Columns"
          subtitle={`${columns.length} of ${parsed.headers.length} kept`}
          icon={Columns3}
          action={
            parsed.headers.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(parsed.headers.map((_, index) => index)))}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  Clear
                </button>
              </div>
            ) : null
          }
        >
          {parsed.headers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Paste a CSV or load the sample data — the detected columns appear here.
            </p>
          ) : (
            <>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {parsed.headers.map((header, index) => {
                  const isChecked = selected.has(index)
                  return (
                    <label
                      key={header}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] transition',
                        isChecked
                          ? 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
                          : 'border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumn(index)}
                        className="size-3.5 shrink-0 rounded border-slate-300 accent-indigo-600 dark:border-slate-600"
                      />
                      <span className="truncate font-mono">{header}</span>
                    </label>
                  )
                })}
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                {parsed.ragged > 0 ? (
                  <p>
                    {parsed.ragged} row{parsed.ragged === 1 ? '' : 's'} had a different cell count
                    than the header — missing cells were treated as empty.
                  </p>
                ) : null}
                <p aria-live="polite">
                  Removed {cleaned.emptyRemoved} empty row
                  {cleaned.emptyRemoved === 1 ? '' : 's'} and {cleaned.duplicatesRemoved} duplicate
                  row{cleaned.duplicatesRemoved === 1 ? '' : 's'}.
                </p>
              </div>
            </>
          )}
        </Panel>

        <PreviewTable
          rows={previewRows}
          columns={cleaned.headers}
          page={page}
          onPageChange={setPage}
          subtitle="Cleaned output · 10 rows per page"
          emptyMessage="Choose at least one column and add some rows — the cleaned table appears here instantly."
        />
      </div>

      <ToolGuide
        howToTitle="How to clean a CSV"
        howToIntro="Three steps, no sign-up and no upload. Everything below runs inside this browser tab."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Delimiters, quoting, duplicate detection and what the cleaner preserves."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
