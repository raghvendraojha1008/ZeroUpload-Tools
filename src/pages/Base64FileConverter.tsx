import { useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Binary,
  Download,
  FileImage,
  FileText,
  HardDrive,
  ImageIcon,
  Lock,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { FileDropZone } from '../components/FileDropZone'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import {
  bytesToBase64,
  decodeBase64Input,
  extensionFor,
  readFileAsBase64,
  type EncodedFile,
} from '../features/base64-file/converter'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/base64-file/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { formatBytes, triggerDownload } from '../lib/download'
import { cn } from '../lib/cn'

type Mode = 'encode' | 'decode'

const PREVIEW_LIMIT = 4000
const TEXT_PREVIEW_LIMIT = 20_000

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'File & Image to Base64 Converter',
  description:
    'Encode any image, SVG, PDF or text file to Base64 and a data URI, or decode Base64 back into a previewable, downloadable file — entirely in the browser.',
  features: [
    'Drag-and-drop file to Base64',
    'Ready-to-paste data URIs',
    'Live image and text preview when decoding',
    'Size comparison with encoding overhead',
    'Download the decoded file',
    'Client-side processing',
  ],
})

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="140" viewBox="0 0 320 140">
  <rect width="320" height="140" rx="18" fill="#0f172a"/>
  <circle cx="42" cy="42" r="8" fill="#34d399"/>
  <text x="62" y="48" font-family="monospace" font-size="15" fill="#e2e8f0">Base64 decoded locally</text>
  <text x="24" y="96" font-family="monospace" font-size="26" fill="#818cf8">✓ image/svg+xml</text>
</svg>`

function previewOf(value: string): string {
  return value.length > PREVIEW_LIMIT
    ? `${value.slice(0, PREVIEW_LIMIT)}\n\n… ${(value.length - PREVIEW_LIMIT).toLocaleString()} more characters (copy or download uses the full value)`
    : value
}

export function Base64FileConverter() {
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('encode')

  const [file, setFile] = useState<EncodedFile | null>(null)
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)

  const [encodedInput, setEncodedInput] = useState('')

  usePageMeta(PAGE_META.base64FileConverter)

  const decoded = useMemo(
    () => (encodedInput.trim() ? decodeBase64Input(encodedInput) : null),
    [encodedInput],
  )

  const overhead =
    file && file.size > 0 ? Math.round((file.base64.length / file.size - 1) * 100) : 0

  async function handleFile(next: File) {
    setReading(true)
    setReadError(null)
    try {
      setFile(await readFileAsBase64(next))
    } catch {
      setFile(null)
      setReadError('That file could not be read. Try a smaller file or a different format.')
    } finally {
      setReading(false)
    }
  }

  function loadSample() {
    const svg = SAMPLE_SVG
    setEncodedInput(
      `data:image/svg+xml;base64,${bytesToBase64(new TextEncoder().encode(svg))}`,
    )
    toast('Sample data URI loaded')
  }

  function downloadDecoded() {
    if (!decoded?.ok) return
    const name = `decoded.${extensionFor(decoded.mime)}`
    triggerDownload(decoded.bytes, name, decoded.mime)
    toast(`Downloaded ${name}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="base64-file-app-schema" data={APP_SCHEMA} />
      <JsonLd id="base64-file-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Base64 File Converter' }]} />

      <ToolHeader
        title="Base64 File"
        highlight="Encoder & Decoder"
        description="Turn any image, SVG, PDF or text file into a Base64 data URI — or paste a Base64 string and see the file come back. Both directions run inside this tab."
        badges={[
          { icon: Binary, label: 'Data URI ready' },
          { icon: Lock, label: 'Files never uploaded' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={
            mode === 'encode'
              ? [
                  { label: 'File size', value: file ? formatBytes(file.size) : '—', icon: HardDrive },
                  {
                    label: 'Base64 size',
                    value: file ? formatBytes(file.base64.length) : '—',
                    icon: Binary,
                  },
                  { label: 'Overhead', value: file ? `+${overhead}%` : '—', icon: FileImage },
                ]
              : [
                  {
                    label: 'Decoded size',
                    value: decoded?.ok ? formatBytes(decoded.bytes.length) : '—',
                    icon: HardDrive,
                  },
                  {
                    label: 'Input length',
                    value: encodedInput.trim() ? encodedInput.trim().length.toLocaleString() : '0',
                    icon: Binary,
                  },
                  {
                    label: 'Detected type',
                    value: decoded?.ok ? decoded.mime : '—',
                    icon: FileImage,
                  },
                ]
          }
        />

        <div
          role="group"
          aria-label="Conversion mode"
          className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900/60"
        >
          {(
            [
              { value: 'encode', label: 'Encode file → Base64', icon: FileImage },
              { value: 'decode', label: 'Decode Base64 → file', icon: ArrowLeftRight },
            ] as const
          ).map((option) => {
            const Icon = option.icon
            const isActive = mode === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium transition',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                )}
              >
                <Icon className="size-3.5" />
                {option.label}
              </button>
            )
          })}
        </div>

        {mode === 'encode' ? (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <Panel title="Upload a file" icon={FileImage} className="lg:col-span-2">
                <div className="space-y-3">
                  <FileDropZone
                    accept="*/*"
                    fileName={file?.name ?? null}
                    onFile={handleFile}
                    title="Drop an image, SVG, PDF or text file"
                    hint="Read with the File API on this device — nothing is uploaded."
                    icon={FileImage}
                  />

                  {reading ? (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Reading file…</p>
                  ) : null}

                  {readError ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-rose-500/30 bg-rose-50 px-3 py-2 text-[12px] text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300"
                    >
                      {readError}
                    </p>
                  ) : null}

                  {file ? (
                    <dl className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-[12px] sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900/60">
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Name
                        </dt>
                        <dd className="mt-0.5 truncate font-mono text-slate-800 dark:text-slate-200">
                          {file.name}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          MIME type
                        </dt>
                        <dd className="mt-0.5 truncate font-mono text-slate-800 dark:text-slate-200">
                          {file.mime}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                          Size change
                        </dt>
                        <dd className="mt-0.5 truncate font-mono text-slate-800 dark:text-slate-200">
                          {formatBytes(file.size)} → {formatBytes(file.base64.length)}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Base64 grows every payload by about 33%. For icons and small SVGs that is
                      cheaper than an extra request; for photos it usually is not.
                    </p>
                  )}

                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Lock className="size-3.5 shrink-0" />
                    Encoded in memory on this device · 0 bytes uploaded
                  </p>
                </div>
              </Panel>

              <div className="flex min-w-0 flex-col gap-4">
                <Panel title="How it encodes">
                  <ul className="space-y-2.5 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                    <li>
                      <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        data:image/png;base64,…
                      </span>{' '}
                      goes straight into an <code className="font-mono">img src</code>, a CSS{' '}
                      <code className="font-mono">url()</code> or a JSON field.
                    </li>
                    <li>
                      SVG, PDF and plain text keep their real MIME type, so the browser knows how to
                      render or save them.
                    </li>
                    <li>
                      Use the raw string when an API expects the payload without the{' '}
                      <code className="font-mono">data:</code> prefix.
                    </li>
                  </ul>
                </Panel>

                <Panel title="Actions">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setReadError(null)
                    }}
                    disabled={!file}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                    Clear file
                  </button>
                </Panel>

                <AdSlot variant="rail" className="hidden lg:flex" />
              </div>
            </div>

            <Panel
              title="Data URI"
              subtitle={file ? `${file.mime} · ${formatBytes(file.dataUri.length)}` : 'waiting for a file'}
              action={
                <CopyButton
                  value={file?.dataUri ?? ''}
                  label="Copy data URI"
                  variant="ghost"
                  className="px-2 py-1"
                  disabled={!file}
                  toastMessage="Data URI copied"
                />
              }
              bodyClassName="p-0"
            >
              <pre className="scroll-slim max-h-[220px] overflow-auto p-4 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {file ? previewOf(file.dataUri) : 'Upload a file to get a ready-to-paste data URI.'}
              </pre>
            </Panel>

            <Panel
              title="Raw Base64"
              subtitle={file ? `${file.base64.length.toLocaleString()} characters` : 'waiting for a file'}
              action={
                <CopyButton
                  value={file?.base64 ?? ''}
                  label="Copy Base64"
                  variant="ghost"
                  className="px-2 py-1"
                  disabled={!file}
                  toastMessage="Base64 string copied"
                />
              }
              bodyClassName="p-0"
            >
              <pre className="scroll-slim max-h-[220px] overflow-auto p-4 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {file ? previewOf(file.base64) : 'The raw Base64 payload appears here.'}
              </pre>
            </Panel>
          </>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Base64 of data URI input"
              icon={Binary}
              action={
                <button
                  type="button"
                  onClick={loadSample}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
                >
                  <Sparkles className="size-3.5" />
                  Load sample
                </button>
              }
            >
              <div className="space-y-3">
                <label htmlFor="base64-input" className="sr-only">
                  Base64 or data URI
                </label>
                <textarea
                  id="base64-input"
                  value={encodedInput}
                  onChange={(event) => setEncodedInput(event.target.value)}
                  spellCheck={false}
                  placeholder={'data:image/png;base64,iVBORw0KGgo…\n\nor just iVBORw0KGgo…'}
                  className="scroll-slim min-h-[260px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-[11.5px] leading-relaxed break-all text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
                />

                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Whitespace, URL-safe alphabet and missing padding are all handled.
                </p>

                <button
                  type="button"
                  onClick={() => setEncodedInput('')}
                  disabled={!encodedInput}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </button>
              </div>
            </Panel>

            <Panel
              title="Live preview"
              icon={ImageIcon}
              className="lg:col-span-2"
              subtitle={decoded?.ok ? decoded.mime : 'nothing decoded yet'}
              action={
                <button
                  type="button"
                  onClick={downloadDecoded}
                  disabled={!decoded?.ok}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                >
                  <Download className="size-3.5" />
                  Download file
                </button>
              }
            >
              {!decoded ? (
                <div className="py-16 text-center">
                  <Binary className="mx-auto size-6 text-slate-400 dark:text-slate-500" />
                  <p className="mt-3 text-[13px] text-slate-500 dark:text-slate-400">
                    Paste Base64 above to see the decoded file.
                  </p>
                </div>
              ) : decoded.ok ? (
                <div className="space-y-3">
                  {decoded.kind === 'image' ? (
                    <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <img
                        src={decoded.dataUri}
                        alt="Decoded Base64 preview"
                        className="max-h-[340px] w-auto max-w-full rounded-md"
                      />
                    </div>
                  ) : decoded.kind === 'text' ? (
                    <pre className="scroll-slim max-h-[340px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-words text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                      {decoded.text?.slice(0, TEXT_PREVIEW_LIMIT) || '(empty text file)'}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
                      <FileText className="size-5 text-slate-500 dark:text-slate-400" />
                      <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                        Binary file · {decoded.mime}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatBytes(decoded.bytes.length)} · use Download file to save it
                      </p>
                    </div>
                  )}

                  <dl className="grid gap-2 text-[12px] sm:grid-cols-3">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                        MIME type
                      </dt>
                      <dd className="mt-0.5 truncate font-mono text-slate-800 dark:text-slate-200">
                        {decoded.mime}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                        Decoded size
                      </dt>
                      <dd className="mt-0.5 font-mono text-slate-800 dark:text-slate-200">
                        {formatBytes(decoded.bytes.length)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                        Input size
                      </dt>
                      <dd className="mt-0.5 font-mono text-slate-800 dark:text-slate-200">
                        {formatBytes(encodedInput.trim().length)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-500/30 bg-rose-50 px-3.5 py-3 text-[12px] leading-relaxed text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  {decoded.error}
                </p>
              )}
            </Panel>
          </div>
        )}

        {mode === 'decode' && decoded?.ok && decoded.kind === 'text' ? (
          <Panel
            title="Decoded data URI"
            action={
              <CopyButton
                value={decoded.dataUri}
                label="Copy data URI"
                variant="ghost"
                className="px-2 py-1"
                toastMessage="Data URI copied"
              />
            }
            bodyClassName="p-0"
          >
            <pre className="scroll-slim max-h-[160px] overflow-auto p-4 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              {previewOf(decoded.dataUri)}
            </pre>
          </Panel>
        ) : null}
      </div>

      <ToolGuide
        howToTitle="How to encode or decode Base64"
        howToIntro="Base64 is a text-safe wrapper around binary bytes. Convert a file to a data URI, or read one back, without sending either to a server."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Data URI syntax, size overhead, MIME types and what Base64 is not."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
