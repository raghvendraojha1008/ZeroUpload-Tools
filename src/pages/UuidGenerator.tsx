import { useState } from 'react'
import {
  Braces,
  Check,
  Download,
  Fingerprint,
  Hash,
  List,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { Switch } from '../components/Switch'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { formatUuid, generateBatch, type UuidVersion } from '../features/uuid/generate'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/uuid/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { triggerDownload } from '../lib/download'
import { cn } from '../lib/cn'

type OutputShape = 'lines' | 'json'

const VERSIONS: Array<{ value: UuidVersion; name: string; body: string }> = [
  {
    value: 'v4',
    name: 'UUID v4',
    body: '122 random bits. Best when an ID must reveal nothing about when it was created.',
  },
  {
    value: 'v7',
    name: 'UUID v7',
    body: '48-bit millisecond timestamp + randomness. Sorts by creation time, ideal for indexed keys.',
  },
]

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Bulk UUID / GUID Generator',
  description:
    'Generate up to 100 UUID v4 or time-ordered v7 values at once, with uppercase, hyphen and JSON array formatting.',
  features: [
    'UUID v4 random and v7 timestamp versions',
    'Batch of 1 to 100 identifiers',
    'Uppercase and hyphen toggles',
    'Plain list or JSON array output',
    'Copy all or download a file',
    'Client-side CSPRNG generation',
  ],
})

export function UuidGenerator() {
  const toast = useToast()
  const [version, setVersion] = useState<UuidVersion>('v4')
  const [quantity, setQuantity] = useState(10)
  const [uppercase, setUppercase] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const [shape, setShape] = useState<OutputShape>('lines')
  // Prerendering has no Web Crypto, so the static snapshot starts empty.
  const [uuids, setUuids] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : generateBatch('v4', 10),
  )

  usePageMeta(PAGE_META.uuidGenerator)

  const formatted = uuids.map((uuid) => formatUuid(uuid, { uppercase, hyphens }))
  const output = shape === 'json' ? JSON.stringify(formatted, null, 2) : formatted.join('\n')
  const extension = shape === 'json' ? 'json' : 'txt'
  const fileName = `uuids-${version}-${new Date().toISOString().slice(0, 10)}.${extension}`

  function refresh(nextVersion = version, nextQuantity = quantity) {
    setUuids(generateBatch(nextVersion, nextQuantity))
  }

  function changeVersion(next: UuidVersion) {
    setVersion(next)
    refresh(next, quantity)
  }

  function changeQuantity(next: number) {
    setQuantity(next)
    refresh(version, next)
  }

  function download() {
    triggerDownload(
      output,
      fileName,
      shape === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8',
    )
    toast(`Downloaded ${fileName}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="uuid-generator-app-schema" data={APP_SCHEMA} />
      <JsonLd id="uuid-generator-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'UUID Generator' }]} />

      <ToolHeader
        title="UUID / GUID"
        highlight="Generator"
        description="Generate a batch of random v4 or time-ordered v7 identifiers with your browser’s own CSPRNG — no API call, no logging and no rate limit."
        badges={[
          { icon: ShieldCheck, label: 'CSPRNG randomness' },
          { icon: Lock, label: 'Generated on device' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            { label: 'Generated', value: String(uuids.length), icon: Hash },
            { label: 'Version', value: version === 'v7' ? '7 · time-ordered' : '4 · random', icon: Fingerprint },
            { label: 'Output', value: shape === 'json' ? 'JSON array' : 'Plain list', icon: Braces },
          ]}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Generator" icon={Fingerprint}>
              <div className="space-y-4">
                <div role="group" aria-label="UUID version" className="space-y-2">
                  {VERSIONS.map((option) => {
                    const isActive = version === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => changeVersion(option.value)}
                        aria-pressed={isActive}
                        className={cn(
                          'w-full rounded-lg border p-3 text-left transition',
                          isActive
                            ? 'border-indigo-500/50 bg-indigo-500/[0.06] ring-1 ring-indigo-500/20 dark:border-indigo-400/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700',
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[12.5px] font-semibold text-slate-900 dark:text-slate-100">
                            {option.name}
                          </span>
                          <span
                            className={cn(
                              'flex size-4 shrink-0 items-center justify-center rounded-full border',
                              isActive
                                ? 'border-indigo-500 bg-indigo-500 text-white'
                                : 'border-slate-300 dark:border-slate-600',
                            )}
                          >
                            {isActive ? <Check className="size-2.5" /> : null}
                          </span>
                        </span>
                        <span className="mt-1 block text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {option.body}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="uuid-quantity"
                      className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                    >
                      Quantity
                    </label>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {quantity}
                    </span>
                  </div>
                  <input
                    id="uuid-quantity"
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={quantity}
                    onChange={(event) => changeQuantity(Number(event.target.value))}
                    className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-500 dark:bg-slate-700"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>1</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-3.5 dark:border-slate-800">
                  <Switch
                    checked={uppercase}
                    onChange={setUppercase}
                    label="Uppercase"
                    description="A1B2C3D4… instead of a1b2c3d4…"
                  />
                  <Switch
                    checked={hyphens}
                    onChange={setHyphens}
                    label="Hyphens"
                    description="Keep the 8-4-4-4-12 grouping."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => refresh()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <RefreshCw className="size-4" />
                  Generate fresh
                </button>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>

          <Panel
            title="Generated UUIDs"
            icon={List}
            className="lg:col-span-2"
            subtitle={`${uuids.length} ${uuids.length === 1 ? 'value' : 'values'}`}
            action={
              <div
                role="group"
                aria-label="Output format"
                className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800"
              >
                {(
                  [
                    { value: 'lines', label: 'List' },
                    { value: 'json', label: 'JSON' },
                  ] as const
                ).map((option) => {
                  const isActive = shape === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setShape(option.value)}
                      aria-pressed={isActive}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-[11px] font-medium transition',
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            }
            bodyClassName="p-0"
          >
            <pre className="scroll-slim max-h-[420px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre text-slate-800 dark:text-slate-200">
              {output}
            </pre>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <CopyButton
                value={output}
                label="Copy all"
                variant="solid"
                toastMessage={`${uuids.length} UUID${uuids.length === 1 ? '' : 's'} copied`}
              />

              <button
                type="button"
                onClick={download}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <Download className="size-3.5" />
                Download .{extension}
              </button>

              <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
                {version === 'v7' ? 'timestamp prefix · sortable' : 'random · no timestamp'}
              </span>
            </div>
          </Panel>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to generate UUIDs in bulk"
        howToIntro="Pick a version, set the batch size and copy the result — the randomness comes from the operating system, not from JavaScript’s Math.random()."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="v4 versus v7, collision odds, CSPRNG randomness and database keys."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
