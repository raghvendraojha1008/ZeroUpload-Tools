import { useMemo, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Columns3,
  Copy,
  Download,
  Grid3x3,
  Lock,
  Plus,
  RotateCcw,
  Rows3,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { buildMarkdown, type Alignment } from '../features/markdown-table/table'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/markdown-table/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { triggerDownload } from '../lib/download'
import { cn } from '../lib/cn'

const SAMPLE_HEADER = ['Endpoint', 'Method', 'Auth', 'Rate limit']
const SAMPLE_ROWS = [
  ['/v1/users', 'GET', 'Bearer token', '120 / min'],
  ['/v1/users/:id', 'PATCH', 'Bearer token', '60 / min'],
  ['/v1/webhooks', 'POST', 'HMAC signature', '30 / min'],
]
const SAMPLE_ALIGNMENT: Alignment[] = ['left', 'center', 'left', 'right']

const ALIGNMENT_OPTIONS: Array<{ value: Alignment; label: string; icon: LucideIcon }> = [
  { value: 'left', label: 'left', icon: AlignLeft },
  { value: 'center', label: 'centre', icon: AlignCenter },
  { value: 'right', label: 'right', icon: AlignRight },
]

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Markdown Table Generator',
  description:
    'Build GitHub-flavoured Markdown tables in a visual spreadsheet grid, with per-column alignment and instant, copy-ready output.',
  features: [
    'Spreadsheet-style visual editor',
    'Add and remove columns and rows',
    'Per-column left, centre and right alignment',
    'Escapes pipes and line breaks',
    'Live Markdown output',
    'Client-side processing',
  ],
})

const INPUT_CLASS =
  'h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12.5px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60'

export function MarkdownTableGenerator() {
  const toast = useToast()
  const [header, setHeader] = useState<string[]>(SAMPLE_HEADER)
  const [rows, setRows] = useState<string[][]>(SAMPLE_ROWS)
  const [alignment, setAlignment] = useState<Alignment[]>(SAMPLE_ALIGNMENT)

  usePageMeta(PAGE_META.markdownTableGenerator)

  const markdown = useMemo(
    () => buildMarkdown(header, rows, alignment),
    [header, rows, alignment],
  )

  function updateHeader(columnIndex: number, value: string) {
    setHeader((current) => current.map((cell, index) => (index === columnIndex ? value : cell)))
  }

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex ? row.map((cell, cellIndex) => (cellIndex === columnIndex ? value : cell)) : row,
      ),
    )
  }

  function addColumn() {
    setHeader((current) => [...current, `Column ${current.length + 1}`])
    setRows((current) => current.map((row) => [...row, '']))
    setAlignment((current) => [...current, 'left'])
  }

  function removeColumn(columnIndex: number) {
    if (header.length <= 1) return
    setHeader((current) => current.filter((_, index) => index !== columnIndex))
    setRows((current) => current.map((row) => row.filter((_, index) => index !== columnIndex)))
    setAlignment((current) => current.filter((_, index) => index !== columnIndex))
  }

  function addRow() {
    setRows((current) => [...current, header.map(() => '')])
  }

  function removeRow(rowIndex: number) {
    setRows((current) => current.filter((_, index) => index !== rowIndex))
  }

  function setColumnAlignment(columnIndex: number, value: Alignment) {
    setAlignment((current) => current.map((cell, index) => (index === columnIndex ? value : cell)))
  }

  function resetSample() {
    setHeader(SAMPLE_HEADER)
    setRows(SAMPLE_ROWS)
    setAlignment(SAMPLE_ALIGNMENT)
    toast('Sample table restored')
  }

  function download() {
    triggerDownload(markdown, 'table.md', 'text/markdown;charset=utf-8')
    toast('Downloaded table.md')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="markdown-table-app-schema" data={APP_SCHEMA} />
      <JsonLd id="markdown-table-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Markdown Table Generator' }]} />

      <ToolHeader
        title="Markdown Table"
        highlight="Generator"
        description="Build a GitHub-flavoured Markdown table in a visual grid, set the alignment per column and copy clean Markdown without counting pipes and dashes by hand."
        badges={[
          { icon: Grid3x3, label: 'Visual grid editor' },
          { icon: Lock, label: 'Runs in your browser' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            { label: 'Columns', value: String(header.length), icon: Columns3 },
            { label: 'Rows', value: String(rows.length), icon: Rows3 },
            {
              label: 'Markdown length',
              value: `${markdown.length.toLocaleString()} chars`,
              icon: Copy,
            },
          ]}
        />

        <Panel
          title="Visual table editor"
          icon={Grid3x3}
          subtitle="click any cell to edit"
          bodyClassName="p-0"
        >
          <div className="scroll-slim w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full border-collapse">
              <caption className="sr-only">Editable Markdown table</caption>
              <thead>
                <tr>
                  {header.map((value, columnIndex) => (
                    <th
                      key={columnIndex}
                      scope="col"
                      className="min-w-[170px] border-b border-slate-200 bg-slate-100 p-2 align-top dark:border-slate-800 dark:bg-slate-800/80"
                    >
                      <label htmlFor={`md-header-${columnIndex}`} className="sr-only">
                        Column {columnIndex + 1} header
                      </label>
                      <input
                        id={`md-header-${columnIndex}`}
                        value={value}
                        onChange={(event) => updateHeader(columnIndex, event.target.value)}
                        placeholder={`Column ${columnIndex + 1}`}
                        className={cn(INPUT_CLASS, 'font-medium')}
                      />

                      <div className="mt-1.5 flex items-center gap-1">
                        {ALIGNMENT_OPTIONS.map((option) => {
                          const Icon = option.icon
                          const isActive = alignment[columnIndex] === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setColumnAlignment(columnIndex, option.value)}
                              aria-pressed={isActive}
                              aria-label={`Align column ${columnIndex + 1} ${option.label}`}
                              title={`Align ${option.label}`}
                              className={cn(
                                'flex size-6 items-center justify-center rounded-md border transition',
                                isActive
                                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/40 dark:text-indigo-300'
                                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                              )}
                            >
                              <Icon className="size-3.5" />
                            </button>
                          )
                        })}

                        <button
                          type="button"
                          onClick={() => removeColumn(columnIndex)}
                          disabled={header.length <= 1}
                          aria-label={`Remove column ${columnIndex + 1}`}
                          title="Remove column"
                          className="ml-auto flex size-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-400 dark:hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="w-10 border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80"
                  >
                    <span className="sr-only">Row actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-white even:bg-slate-50/70 dark:bg-slate-950 dark:even:bg-slate-900/60"
                  >
                    {header.map((_, columnIndex) => (
                      <td
                        key={columnIndex}
                        className="border-b border-slate-200 p-1.5 dark:border-slate-800"
                      >
                        <label
                          htmlFor={`md-cell-${rowIndex}-${columnIndex}`}
                          className="sr-only"
                        >
                          Row {rowIndex + 1} column {columnIndex + 1}
                        </label>
                        <input
                          id={`md-cell-${rowIndex}-${columnIndex}`}
                          value={row[columnIndex] ?? ''}
                          onChange={(event) =>
                            updateCell(rowIndex, columnIndex, event.target.value)
                          }
                          className={INPUT_CLASS}
                        />
                      </td>
                    ))}
                    <td className="border-b border-slate-200 p-1.5 text-center dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => removeRow(rowIndex)}
                        aria-label={`Remove row ${rowIndex + 1}`}
                        title="Remove row"
                        className="flex size-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
            >
              <Plus className="size-3.5" />
              Add row
            </button>
            <button
              type="button"
              onClick={addColumn}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
            >
              <Plus className="size-3.5" />
              Add column
            </button>
            <button
              type="button"
              onClick={resetSample}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
            >
              <RotateCcw className="size-3.5" />
              Reset sample
            </button>
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="Markdown output"
            subtitle={rows.length === 0 ? 'header only' : `${rows.length} rows`}
            className="lg:col-span-2"
            bodyClassName="p-0"
          >
            <pre className="scroll-slim max-h-[420px] overflow-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre text-slate-800 dark:text-slate-200">
              {markdown}
            </pre>
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Actions">
              <div className="space-y-2">
                <CopyButton
                  value={markdown}
                  label="Copy Markdown"
                  variant="solid"
                  className="w-full"
                  toastMessage="Markdown table copied"
                />
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                >
                  <Download className="size-3.5" />
                  Download .md
                </button>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Alignment syntax
                </p>
                {[
                  { code: ':---', label: 'Left' },
                  { code: ':---:', label: 'Centre' },
                  { code: '---:', label: 'Right' },
                ].map((item) => (
                  <div key={item.code} className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] text-slate-600 dark:text-slate-400">
                      {item.label}
                    </span>
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.code}
                    </code>
                  </div>
                ))}
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to build a Markdown table"
        howToIntro="Type into the grid, choose an alignment, and the Markdown is ready to paste — pipes, padding and escaping handled for you."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="GFM syntax, escaping, alignment support and practical size limits."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
