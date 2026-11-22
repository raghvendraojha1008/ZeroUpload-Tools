import { useState, useMemo } from 'react'
import {
  Terminal,
  Code2,
  Download,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { curlToCode, type CodeLanguage } from '../features/curl-to-code/parser'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/curl-to-code/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { triggerDownload } from '../lib/download'
import { cn } from '../lib/cn'

const SAMPLE_CURL = `curl -X POST https://api.stripe.com/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_51Mz..." \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 2000, "currency": "usd", "payment_method_types": ["card"]}'`

const LANGUAGES: Array<{ id: CodeLanguage; label: string; ext: string }> = [
  { id: 'fetch', label: 'JavaScript (Fetch)', ext: 'js' },
  { id: 'axios', label: 'JavaScript (Axios)', ext: 'js' },
  { id: 'python-requests', label: 'Python (Requests)', ext: 'py' },
  { id: 'python-httpx', label: 'Python (HTTPX)', ext: 'py' },
  { id: 'go', label: 'Go (net/http)', ext: 'go' },
]

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'cURL to Code Converter (Fetch, Axios, Python, Go)',
  description:
    'Convert cURL commands to JavaScript Fetch, Axios, Python requests, httpx, and Go code with zero server uploads.',
  features: [
    'Converts cURL commands to JavaScript Fetch, Axios, Python, and Go',
    'Supports headers, auth tokens, JSON payloads, and line breaks',
    '100% private in-browser parsing without leaking sensitive API keys',
    'Instant copy and code file download',
  ],
})

export function CurlToCode() {
  const toast = useToast()
  usePageMeta(PAGE_META.curlToCode)

  const [input, setInput] = useState(SAMPLE_CURL)
  const [lang, setLang] = useState<CodeLanguage>('fetch')

  const codeOutput = useMemo(() => {
    try {
      return curlToCode(input, lang)
    } catch {
      return '// Failed to parse cURL command'
    }
  }, [input, lang])

  const stats = [
    {
      label: 'Input Length',
      value: `${input.length} chars`,
      icon: Terminal,
    },
    {
      label: 'Selected Stack',
      value: LANGUAGES.find((l) => l.id === lang)?.label.split(' ')[0] || 'JavaScript',
      icon: Code2,
    },
    {
      label: 'Security Status',
      value: 'Local Memory',
      icon: ShieldCheck,
      tone: 'ok' as const,
    },
  ]

  function downloadCode() {
    if (!codeOutput) return
    const curLang = LANGUAGES.find((l) => l.id === lang)
    const filename = `request.${curLang?.ext || 'txt'}`
    triggerDownload(codeOutput, filename, 'text/plain;charset=utf-8')
    toast(`Downloaded ${filename}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="curl-to-code-app-schema" data={APP_SCHEMA} />
      <JsonLd id="curl-to-code-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'cURL to Code' }]} />

      <ToolHeader
        title="cURL to"
        highlight="Code Converter"
        description="Convert cURL terminal commands into production-ready JavaScript Fetch, Axios, Python Requests, or Go code. 100% private in-browser."
        badges={[
          { icon: ShieldCheck, label: 'Tokens stay local' },
          { icon: Lock, label: 'Zero network calls' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip items={stats} />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Input cURL */}
          <Panel
            title="cURL Command"
            icon={Terminal}
            subtitle={`${input.length} characters`}
            action={
              <button
                type="button"
                onClick={() => setInput(SAMPLE_CURL)}
                className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                Reset sample
              </button>
            }
          >
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="curl -X POST https://api.example.com -H 'Authorization: ...'"
                rows={16}
                spellCheck={false}
                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              />
            </div>
          </Panel>

          {/* Generated Code */}
          <Panel
            title="Generated Code"
            icon={Code2}
            action={
              <div
                role="group"
                aria-label="Target language"
                className="flex flex-wrap rounded-lg border border-slate-200 p-0.5 dark:border-slate-800"
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLang(l.id)}
                    aria-pressed={lang === l.id}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-medium transition',
                      lang === l.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )}
                  >
                    {l.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-4">
              <textarea
                readOnly
                value={codeOutput}
                placeholder="Generated code will appear here..."
                rows={16}
                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              />

              {codeOutput && (
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <CopyButton value={codeOutput} label="Copy Code" variant="solid" />
                  <button
                    type="button"
                    onClick={downloadCode}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to convert cURL to JavaScript, Python & Go"
        howToIntro="Paste raw cURL snippets from DevTools or documentation to immediately produce clean, idiomatic client code."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Questions about Bearer auth, multi-line commands, JSON bodies, and supported languages."
        faqs={FAQ_ITEMS}
        toolId="curl-to-code"
        category="Dev"
      />
    </div>
  )
}
