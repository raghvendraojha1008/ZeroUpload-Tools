import { useState, useMemo } from 'react'
import {
  FileCode2,
  Code2,
  Download,
  AlertCircle,
  Braces,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { Switch } from '../components/Switch'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { jsonToCode, type GeneratorTarget } from '../features/json-to-typescript/generator'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/json-to-typescript/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { triggerDownload } from '../lib/download'
import { cn } from '../lib/cn'

const SAMPLE_JSON = `{
  "id": "usr_99214a",
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "isActive": true,
  "role": "admin",
  "profile": {
    "avatarUrl": "https://example.com/avatar.png",
    "bio": "Full-stack engineer & open-source contributor",
    "followersCount": 1420
  },
  "tags": ["developer", "react", "typescript"],
  "settings": {
    "theme": "dark",
    "notificationsEnabled": true,
    "twoFactorAuth": false
  }
}`

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'JSON to TypeScript & Zod Schema Generator',
  description:
    'Convert raw JSON payloads into strongly-typed TypeScript interfaces, type aliases, or Zod schemas with nested type extraction.',
  features: [
    'Generate TypeScript interfaces, type aliases, and Zod schemas',
    'Automatic nested object and array type extraction',
    'Optional field and null detection across array items',
    'Configurable root name, readonly modifiers, and export keywords',
    '100% client-side processing with zero server uploads',
  ],
})

export function JsonToTypescript() {
  const toast = useToast()
  usePageMeta(PAGE_META.jsonToTypescript)

  const [input, setInput] = useState(SAMPLE_JSON)
  const [rootName, setRootName] = useState('UserResponse')
  const [target, setTarget] = useState<GeneratorTarget>('interfaces')
  const [exportTypes, setExportTypes] = useState(true)
  const [readonlyFields, setReadonlyFields] = useState(false)
  const [optionalNulls, setOptionalNulls] = useState(true)

  const { output, error } = useMemo(() => {
    try {
      const code = jsonToCode(input, {
        target,
        rootName,
        exportTypes,
        readonlyFields,
        optionalNulls,
      })
      return { output: code, error: null }
    } catch (err: unknown) {
      return { output: '', error: err instanceof Error ? err.message : String(err) }
    }
  }, [input, rootName, target, exportTypes, readonlyFields, optionalNulls])

  const stats = [
    {
      label: 'Input JSON',
      value: `${input.length} chars`,
      icon: Braces,
      tone: (error ? 'warn' : 'default') as 'warn' | 'default',
    },
    {
      label: 'Target Output',
      value: target === 'interfaces' ? 'Interfaces' : target === 'types' ? 'Types' : 'Zod',
      icon: Code2,
    },
    {
      label: 'Generated',
      value: output ? `${output.split('\n').length} lines` : '0 lines',
      icon: FileCode2,
      tone: (output ? 'ok' : 'default') as 'ok' | 'default',
    },
  ]

  function downloadFile() {
    if (!output) return
    const filename = `${rootName.toLowerCase() || 'types'}.${target === 'zod' ? 'ts' : 'd.ts'}`
    triggerDownload(output, filename, 'text/plain;charset=utf-8')
    toast(`Downloaded ${filename}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="json-to-ts-app-schema" data={APP_SCHEMA} />
      <JsonLd id="json-to-ts-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'JSON to TypeScript' }]} />

      <ToolHeader
        title="JSON to"
        highlight="TypeScript & Zod"
        description="Paste JSON data to instantly generate clean, production-ready TypeScript interfaces, types, or Zod schemas. 100% client-side."
        badges={[
          { icon: ShieldCheck, label: 'Zero data upload' },
          { icon: Lock, label: 'Processed in-browser' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip items={stats} />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Input Panel */}
          <Panel
            title="Raw JSON Payload"
            icon={Braces}
            subtitle={`${input.length} characters`}
            action={
              <button
                type="button"
                onClick={() => setInput(SAMPLE_JSON)}
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
                placeholder="Paste JSON object or array here..."
                rows={16}
                spellCheck={false}
                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              />

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                <div>
                  <label htmlFor="root-name" className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Root Type
                  </label>
                  <input
                    id="root-name"
                    type="text"
                    value={rootName}
                    onChange={(e) => setRootName(e.target.value)}
                    placeholder="Root"
                    className="mt-1 block rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Switch checked={exportTypes} onChange={setExportTypes} label="Export" />
                  {target !== 'zod' && (
                    <Switch checked={readonlyFields} onChange={setReadonlyFields} label="Readonly" />
                  )}
                  <Switch checked={optionalNulls} onChange={setOptionalNulls} label="Optional Nulls" />
                </div>
              </div>
            </div>
          </Panel>

          {/* Output Panel */}
          <Panel
            title={`Generated ${target === 'zod' ? 'Zod Schema' : 'TypeScript'}`}
            icon={FileCode2}
            subtitle={output ? `${output.split('\n').length} lines` : 'Waiting for JSON'}
            action={
              <div
                role="group"
                aria-label="Target format"
                className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800"
              >
                {(['interfaces', 'types', 'zod'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTarget(t)}
                    aria-pressed={target === t}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-medium capitalize transition',
                      target === t
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-4">
              {error ? (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-800 dark:border-rose-950/60 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertCircle className="size-4 shrink-0 text-rose-500" />
                  <div>
                    <span className="font-semibold">JSON Syntax Error:</span>
                    <p className="mt-0.5 font-mono">{error}</p>
                  </div>
                </div>
              ) : (
                <textarea
                  readOnly
                  value={output}
                  placeholder="Generated types will appear here..."
                  rows={16}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                />
              )}

              {output && (
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <CopyButton value={output} label="Copy Code" variant="solid" />
                  <button
                    type="button"
                    onClick={downloadFile}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download className="size-3.5" />
                    <span>Download .{target === 'zod' ? 'ts' : 'd.ts'}</span>
                  </button>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to convert JSON to TypeScript interfaces & Zod"
        howToIntro="Paste any JSON API payload to immediately generate strongly-typed TypeScript definitions or runtime validation schemas."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Questions about optional fields, nested objects, and Zod inference."
        faqs={FAQ_ITEMS}
        toolId="json-to-typescript"
        category="Dev"
      />
    </div>
  )
}
