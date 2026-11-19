import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Braces,
  CircleAlert,
  Copy,
  Link2,
  Lock,
  Plus,
  Route,
  SlidersHorizontal,
  Sparkles,
  Trash2,
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
import {
  analyseUrl,
  buildUrl,
  countPathSegments,
  decodeUrl,
  type UrlParam,
} from '../features/url-parser/parse'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/url-parser/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'

const SAMPLE_TRACKING =
  'https://shop.example.com:8443/checkout/complete?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale&session=abc123&redirect=https%3A%2F%2Fexample.com%2Faccount#order-summary'

const SAMPLE_OAUTH =
  'https://auth.example.com/oauth2/authorize?client_id=web_app&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&scope=openid%20profile%20email&state=x8f2k9'

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'URL Parser & Query String Inspector',
  description:
    'Deconstruct any URL into protocol, host, port, path, fragment and query parameters, edit the query string inline and copy the reassembled URL.',
  features: [
    'Protocol, host, port and path breakdown',
    'Editable query parameter table',
    'Duplicate keys preserved',
    'Encoded and decoded output',
    'Copy the rebuilt URL',
    'Client-side processing',
  ],
})

const INPUT_CLASS =
  'h-8 w-full rounded-md border border-slate-200 bg-white px-2 font-mono text-[12px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60'

export function UrlParser() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  // `?url=` opens the page with a shared link already inspected.
  const [input, setInput] = useState(() => searchParams.get('url') ?? '')
  const [params, setParams] = useState<UrlParam[]>([])

  usePageMeta(PAGE_META.urlParser)

  const analysis = useMemo(() => analyseUrl(input), [input])

  useEffect(() => {
    setParams(analysis.ok ? analysis.params : [])
    // Re-sync only when the pasted URL changes; parameter edits must survive.
  }, [input])

  const rebuilt = analysis.ok ? buildUrl(analysis.url, params) : ''
  const readable = rebuilt ? decodeUrl(rebuilt) : ''

  function updateParam(index: number, patch: Partial<UrlParam>) {
    setParams((current) =>
      current.map((param, position) => (position === index ? { ...param, ...patch } : param)),
    )
  }

  function removeParam(index: number) {
    setParams((current) => current.filter((_, position) => position !== index))
  }

  function loadSample(value: string, label: string) {
    setInput(value)
    toast(`${label} loaded`)
  }

  const breakdown = analysis.ok
    ? [
        { label: 'Protocol', value: analysis.url.protocol.replace(':', '') },
        { label: 'Host', value: analysis.url.hostname },
        { label: 'Port', value: analysis.url.port || 'default' },
        { label: 'Path', value: analysis.url.pathname },
        { label: 'Fragment', value: analysis.url.hash.replace('#', '') || '—' },
        { label: 'Origin', value: analysis.url.origin },
      ]
    : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="url-parser-app-schema" data={APP_SCHEMA} />
      <JsonLd id="url-parser-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'URL Parser' }]} />

      <ToolHeader
        title="URL Parser"
        highlight="& Query Inspector"
        description="Break any link into its protocol, host, port, path and query parameters, edit the query string inline and copy the reassembled URL — with nothing sent to a server."
        badges={[
          { icon: Route, label: 'Full URL breakdown' },
          { icon: Lock, label: 'Links never leave the tab' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            {
              label: 'Parameters',
              value: analysis.ok ? String(params.length) : '—',
              icon: SlidersHorizontal,
            },
            {
              label: 'Path segments',
              value: analysis.ok ? String(countPathSegments(analysis.url.pathname)) : '—',
              icon: Route,
            },
            {
              label: 'URL length',
              value: analysis.ok ? rebuildLength(rebuilt, input) : '—',
              icon: Link2,
            },
          ]}
        />

        <Panel
          title="URL input"
          icon={Link2}
          action={
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_TRACKING, 'Tracking link')}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Sparkles className="size-3.5" />
                Tracking link
              </button>
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_OAUTH, 'OAuth redirect')}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Sparkles className="size-3.5" />
                OAuth redirect
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <label htmlFor="url-input" className="sr-only">
              URL to inspect
            </label>
            <textarea
              id="url-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              rows={3}
              aria-invalid={!analysis.ok && input.trim().length > 0}
              placeholder="https://api.example.com/v1/orders?status=open&limit=50#results"
              className="scroll-slim w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-[12.5px] leading-relaxed break-all text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
            />

            {!analysis.ok && input.trim() ? (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-50 px-3 py-2 text-[12px] text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300"
              >
                <CircleAlert className="size-3.5 shrink-0" />
                {analysis.error}
              </p>
            ) : null}

            {analysis.ok && analysis.addedScheme ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                No scheme was provided, so this URL is being read as{' '}
                <span className="font-mono text-slate-700 dark:text-slate-300">https://</span>.
              </p>
            ) : null}

            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Lock className="size-3.5 shrink-0" />
              Parsed with the browser URL API · 0 bytes uploaded
            </p>
          </div>
        </Panel>

        {analysis.ok ? (
          <Panel title="URL breakdown" icon={Braces} bodyClassName="p-0">
            <dl className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-6 dark:bg-slate-800">
              {breakdown.map((item) => (
                <div key={item.label} className="min-w-0 bg-white px-3 py-3 dark:bg-slate-900/60">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </dt>
                  <dd
                    title={item.value}
                    className="mt-1 truncate font-mono text-[12px] text-slate-900 dark:text-slate-100"
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="Query parameters"
            icon={SlidersHorizontal}
            className="lg:col-span-2"
            subtitle={analysis.ok ? `${params.length} total` : 'waiting for a URL'}
            action={
              <button
                type="button"
                onClick={() => setParams((current) => [...current, { key: '', value: '' }])}
                disabled={!analysis.ok}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400"
              >
                <Plus className="size-3.5" />
                Add parameter
              </button>
            }
            bodyClassName="p-0"
          >
            {!analysis.ok ? (
              <p className="px-5 py-10 text-center text-[13px] text-slate-500 dark:text-slate-400">
                Paste a URL to inspect its query string.
              </p>
            ) : params.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-slate-500 dark:text-slate-400">
                This URL has no query parameters. Add one to build a query string.
              </p>
            ) : (
              <div className="scroll-slim w-full max-w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        Key
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="w-10 border-b border-slate-200 bg-slate-100 px-2 py-2.5 dark:border-slate-800 dark:bg-slate-800/80"
                      >
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((param, index) => (
                      <tr
                        key={index}
                        className="bg-white even:bg-slate-50/70 dark:bg-slate-950 dark:even:bg-slate-900/60"
                      >
                        <td className="border-b border-slate-200 p-1.5 dark:border-slate-800">
                          <label htmlFor={`param-key-${index}`} className="sr-only">
                            Parameter {index + 1} key
                          </label>
                          <input
                            id={`param-key-${index}`}
                            value={param.key}
                            onChange={(event) => updateParam(index, { key: event.target.value })}
                            placeholder="key"
                            className={INPUT_CLASS}
                          />
                        </td>
                        <td className="border-b border-slate-200 p-1.5 dark:border-slate-800">
                          <label htmlFor={`param-value-${index}`} className="sr-only">
                            Parameter {index + 1} value
                          </label>
                          <input
                            id={`param-value-${index}`}
                            value={param.value}
                            onChange={(event) => updateParam(index, { value: event.target.value })}
                            placeholder="value"
                            className={INPUT_CLASS}
                          />
                        </td>
                        <td className="border-b border-slate-200 p-1.5 text-center dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => removeParam(index)}
                            aria-label={`Remove parameter ${param.key || index + 1}`}
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
            )}
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Actions">
              <div className="space-y-2">
                <CopyButton
                  value={rebuilt}
                  label="Copy encoded URL"
                  variant="solid"
                  className="w-full"
                  disabled={!rebuilt}
                  toastMessage="Encoded URL copied"
                />
                <CopyButton
                  value={readable}
                  label="Copy decoded URL"
                  variant="outline"
                  className="w-full"
                  disabled={!readable}
                  toastMessage="Decoded URL copied"
                />
                <button
                  type="button"
                  onClick={() => {
                    setInput('')
                    setParams([])
                  }}
                  disabled={!input}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </button>
              </div>
              <p className="mt-3 border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Edits are written back through{' '}
                <span className="font-mono text-[10.5px] text-slate-700 dark:text-slate-300">
                  URLSearchParams
                </span>
                , so reserved characters are escaped correctly.
              </p>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>

        <Panel
          title="Reassembled URL"
          icon={Copy}
          subtitle="live from the parameter table"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Encoded
                </span>
                <CopyButton
                  value={rebuilt}
                  label="Copy"
                  variant="ghost"
                  className="px-2 py-1"
                  disabled={!rebuilt}
                  toastMessage="Encoded URL copied"
                />
              </div>
              <pre className="scroll-slim mt-2 max-h-[140px] overflow-auto font-mono text-[12px] leading-relaxed break-all whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {rebuilt || 'Paste a URL above to rebuild it here.'}
              </pre>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Decoded (human-readable)
                </span>
                <CopyButton
                  value={readable}
                  label="Copy"
                  variant="ghost"
                  className="px-2 py-1"
                  disabled={!readable}
                  toastMessage="Decoded URL copied"
                />
              </div>
              <pre className="scroll-slim mt-2 max-h-[140px] overflow-auto font-mono text-[12px] leading-relaxed break-all whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {readable || 'The decoded version appears here.'}
              </pre>
            </div>
          </div>
        </Panel>
      </div>

      <ToolGuide
        howToTitle="How to inspect a URL"
        howToIntro="A URL is a small data structure. Split it into its parts once and tracking parameters, redirect targets and broken encodings become obvious."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="URL structure, encoding, duplicate keys and fragments."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}

function rebuildLength(rebuilt: string, input: string): string {
  const length = rebuilt.length || input.trim().length
  return `${length.toLocaleString()} chars`
}
