import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardPaste,
  Columns3,
  Download,
  FileJson,
  HardDrive,
  Lock,
  RotateCcw,
  Rows3,
  ShieldCheck,
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
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { PreviewTable } from '../features/json-to-csv/PreviewTable'
import {
  JsonToCsvContent,
  APP_SCHEMA,
  FAQ_SCHEMA,
} from '../features/json-to-csv/JsonToCsvContent'
import {
  analyseJson,
  byteSize,
  formatBytes,
  outputFileName,
  serializeCsv,
  type Delimiter,
} from '../features/json-to-csv/csv'
import { SAMPLE_JSON } from '../features/json-to-csv/sample'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const DELIMITERS: Array<{ value: Delimiter; label: string }> = [
  { value: ',', label: 'Comma' },
  { value: ';', label: 'Semicolon' },
  { value: '\t', label: 'Tab' },
]

export function JsonToCsv() {
  usePageMeta({
    title: 'JSON to CSV Converter — Free, Online & 100% Private',
    description:
      'Convert JSON to clean CSV or Excel spreadsheet online for free. Auto-flattens nested objects, live table preview, 100% client-side with zero cloud uploads.',
    path: '/tools/json-to-csv',
  })

  const toast = useToast()
  const [source, setSource] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [delimiter, setDelimiter] = useState<Delimiter>(',')
  const [quoteAll, setQuoteAll] = useState(false)
  const [page, setPage] = useState(0)

  const analysis = useMemo(() => analyseJson(source), [source])
  const csv = useMemo(
    () => serializeCsv(analysis.rows, analysis.columns, { delimiter, quoteAll }),
    [analysis, delimiter, quoteAll],
  )
  const sizeLabel = useMemo(() => formatBytes(byteSize(csv)), [csv])

  useEffect(() => {
    setPage(0)
    setErrorDismissed(false)
  }, [source])

  const hasOutput = analysis.rows.length > 0 && analysis.columns.length > 0
  const error = readError ?? analysis.error

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      setSource(text)
      setFileName(file.name)
      setReadError(null)
    } catch {
      setReadError('That file could not be read. Try a plain-text .json file.')
    }
  }

  function loadSample() {
    setSource(SAMPLE_JSON)
    setFileName(null)
    setReadError(null)
    toast('Sample data loaded')
  }

  function reset() {
    setSource('')
    setFileName(null)
    setReadError(null)
    setPage(0)
  }

  function downloadCsv() {
    if (!csv) return
    // Leading BOM so Excel opens UTF-8 characters correctly.
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputFileName(fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast(`Downloaded ${outputFileName(fileName)}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="json-to-csv-app-schema" data={APP_SCHEMA} />
      <JsonLd id="json-to-csv-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'JSON to CSV' }]} />

      <ToolHeader
        title="JSON to Clean CSV"
        highlight="& Excel"
        description="Flatten nested JSON into a spreadsheet-ready CSV with a live table preview. Your data is parsed in this tab and never uploaded."
        badges={[
          { icon: Table2, label: 'Excel & Sheets ready' },
          { icon: ShieldCheck, label: '100% in-browser' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            { label: 'Rows', value: analysis.rows.length.toLocaleString(), icon: Rows3 },
            { label: 'Columns', value: analysis.columns.length.toLocaleString(), icon: Columns3 },
            {
              label: 'Est. file size',
              value: hasOutput ? sizeLabel : '—',
              icon: HardDrive,
            },
          ]}
        />

        {error && !errorDismissed ? (
          <ErrorBanner
            message={error}
            onDismiss={() => setErrorDismissed(true)}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="JSON input"
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
                accept=".json,application/json,text/plain"
                fileName={fileName}
                onFile={handleFile}
                title="Drop a .json file, or click to browse"
                hint="Read in this tab only. Nothing is uploaded."
                icon={FileJson}
              />

              <div className="relative">
                <label htmlFor="json-input" className="sr-only">
                  JSON content
                </label>
                <textarea
                  id="json-input"
                  value={source}
                  onChange={(event) => {
                    setSource(event.target.value)
                    setFileName(null)
                    setReadError(null)
                  }}
                  spellCheck={false}
                  aria-invalid={Boolean(error)}
                  aria-describedby="json-input-hint"
                  placeholder={'Paste JSON here…\n\n[{ "id": 1, "user": { "name": "Ada" } }]'}
                  className="scroll-slim min-h-[240px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
                />
                {source && (
                  <span className="pointer-events-none absolute right-3 bottom-2.5 rounded bg-white/90 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 backdrop-blur dark:bg-slate-900/90 dark:text-slate-400">
                    {source.length.toLocaleString()} chars
                  </span>
                )}
              </div>

              <p
                id="json-input-hint"
                className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"
              >
                <ClipboardPaste className="size-3.5 shrink-0" />
                Single objects, arrays of objects and nested keys are all supported.
              </p>
            </div>
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="CSV output">
              <div className="space-y-5">
                <div>
                  <span
                    id="delimiter-label"
                    className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                  >
                    Delimiter
                  </span>
                  <div
                    role="group"
                    aria-labelledby="delimiter-label"
                    className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {DELIMITERS.map((option) => {
                      const isActive = delimiter === option.value
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setDelimiter(option.value)}
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

                <Switch
                  checked={quoteAll}
                  onChange={setQuoteAll}
                  label="Quote wrapping"
                  description="Surround every field with double quotes."
                />

                <div className="space-y-2 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={downloadCsv}
                    disabled={!hasOutput}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <Download className="size-4" />
                    Download .CSV
                  </button>

                  <CopyButton
                    value={csv}
                    label="Copy to clipboard"
                    copiedLabel="Copied!"
                    className="w-full py-2.5 text-[13px]"
                    disabled={!hasOutput}
                    toastMessage="Copied to clipboard!"
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

                <p className="flex items-center gap-1.5 border-t border-slate-200 pt-4 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <Lock className="size-3.5 shrink-0" />
                  Generated on this device · 0 bytes uploaded
                </p>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>

        <PreviewTable
          rows={analysis.rows}
          columns={analysis.columns}
          page={page}
          onPageChange={setPage}
        />
      </div>

      <JsonToCsvContent />
    </div>
  )
}
