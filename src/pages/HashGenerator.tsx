import { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  UploadCloud,
  Lock,
  Binary,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { Switch } from '../components/Switch'
import { FileDropZone } from '../components/FileDropZone'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { useToast } from '../components/Toast'
import { computeHashes, type ComputedHashes } from '../features/hash-generator/hash'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/hash-generator/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

type InputMode = 'text' | 'file'

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Cryptographic Hash & Checksum Generator (SHA-256, SHA-512, MD5)',
  description:
    'Generate SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes for text and files locally using the native WebCrypto API with zero server uploads.',
  features: [
    'Computes SHA-256, SHA-512, SHA-384, SHA-1 and MD5 in parallel',
    'Drag-and-drop local file hashing without uploading to any server',
    'Real-time checksum comparator for download and integrity verification',
    'Uppercase and lowercase hex output toggle',
    '100% private in-browser execution with zero network transmission',
  ],
})

export function HashGenerator() {
  const toast = useToast()
  usePageMeta(PAGE_META.hashGenerator)

  const [mode, setMode] = useState<InputMode>('text')
  const [textInput, setTextInput] = useState('CleanDevTools: Fast, Private, In-Browser Utilities')
  const [file, setFile] = useState<File | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  const [isUppercase, setIsUppercase] = useState(false)
  const [compareHash, setCompareHash] = useState('')

  const [hashes, setHashes] = useState<ComputedHashes>({
    sha256: '',
    sha512: '',
    sha384: '',
    sha1: '',
    md5: '',
  })

  useEffect(() => {
    let canceled = false

    async function runHash() {
      if (typeof window === 'undefined') return

      let result: ComputedHashes
      if (mode === 'text') {
        result = await computeHashes(textInput)
      } else if (fileBuffer) {
        result = await computeHashes(fileBuffer)
      } else {
        result = { sha256: '', sha512: '', sha384: '', sha1: '', md5: '' }
      }

      if (!canceled) {
        setHashes(result)
      }
    }

    runHash()
    return () => {
      canceled = true
    }
  }, [mode, textInput, fileBuffer])

  function handleFileSelected(selectedFile: File) {
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        setFileBuffer(e.target.result)
        toast(`Loaded ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const formatHash = (h: string) => (isUppercase ? h.toUpperCase() : h.toLowerCase())

  const trimmedCompare = compareHash.trim().toLowerCase()
  const matchedAlgorithm = useMemo(() => {
    if (!trimmedCompare) return null
    if (hashes.sha256.toLowerCase() === trimmedCompare) return 'SHA-256'
    if (hashes.sha512.toLowerCase() === trimmedCompare) return 'SHA-512'
    if (hashes.sha384.toLowerCase() === trimmedCompare) return 'SHA-384'
    if (hashes.sha1.toLowerCase() === trimmedCompare) return 'SHA-1'
    if (hashes.md5.toLowerCase() === trimmedCompare) return 'MD5'
    return false
  }, [trimmedCompare, hashes])

  const stats = [
    {
      label: 'Input Source',
      value: mode === 'text' ? 'Plain Text' : file ? file.name : 'No file',
      icon: mode === 'text' ? FileText : UploadCloud,
    },
    {
      label: 'Engine',
      value: 'WebCrypto',
      icon: Binary,
    },
    {
      label: 'Integrity Match',
      value: matchedAlgorithm ? `Match (${matchedAlgorithm})` : trimmedCompare ? 'Mismatch' : 'Ready',
      icon: ShieldCheck,
      tone: (matchedAlgorithm ? 'ok' : trimmedCompare ? 'warn' : 'default') as 'ok' | 'warn' | 'default',
    },
  ]

  const HASH_LIST = [
    { name: 'SHA-256', val: formatHash(hashes.sha256), bits: '256 bits · standard' },
    { name: 'SHA-512', val: formatHash(hashes.sha512), bits: '512 bits · high security' },
    { name: 'SHA-384', val: formatHash(hashes.sha384), bits: '384 bits' },
    { name: 'SHA-1', val: formatHash(hashes.sha1), bits: '160 bits · legacy git' },
    { name: 'MD5', val: formatHash(hashes.md5), bits: '128 bits · checksum verification' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="hash-generator-app-schema" data={APP_SCHEMA} />
      <JsonLd id="hash-generator-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Hash Generator' }]} />

      <ToolHeader
        title="Hash & Checksum"
        highlight="Generator"
        description="Compute SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes for text and files locally in your browser. 100% private, zero server uploads."
        badges={[
          { icon: ShieldCheck, label: 'WebCrypto acceleration' },
          { icon: Lock, label: 'Zero file upload' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip items={stats} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-4">
            <Panel
              title="Input Source"
              icon={Binary}
              action={
                <div
                  role="group"
                  aria-label="Input mode"
                  className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => setMode('text')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium transition',
                      mode === 'text'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium transition',
                      mode === 'file'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )}
                  >
                    File
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                {mode === 'text' ? (
                  <div>
                    <label htmlFor="hash-text" className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Plain Text
                    </label>
                    <textarea
                      id="hash-text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type or paste text..."
                      rows={6}
                      spellCheck={false}
                      className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                    />
                  </div>
                ) : (
                  <div>
                    <FileDropZone
                      accept="*/*"
                      fileName={file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : null}
                      onFile={handleFileSelected}
                      title="Drop any local file to hash"
                      hint="Read into device memory via FileReader — never uploaded"
                    />
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                  <Switch checked={isUppercase} onChange={setIsUppercase} label="Uppercase Hex" />
                </div>
              </div>
            </Panel>

            <Panel title="Checksum Verification" icon={ShieldCheck}>
              <div className="space-y-3">
                <div>
                  <label htmlFor="compare-hash" className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Compare Expected Hash
                  </label>
                  <input
                    id="compare-hash"
                    type="text"
                    value={compareHash}
                    onChange={(e) => setCompareHash(e.target.value)}
                    placeholder="Paste expected checksum..."
                    spellCheck={false}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                {trimmedCompare && (
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-lg border p-2.5 text-[11px] font-medium',
                      matchedAlgorithm
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-950/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-950/60 dark:bg-rose-950/40 dark:text-rose-300',
                    )}
                  >
                    {matchedAlgorithm ? (
                      <>
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>Exact match verified against {matchedAlgorithm}!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>Mismatch with computed hashes.</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
            <Panel title="Calculated Cryptographic Hashes" icon={Lock}>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {HASH_LIST.map((h) => (
                  <div key={h.name} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-24 shrink-0">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {h.name}
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{h.bits}</p>
                    </div>
                    <div className="min-w-0 flex-1 px-1">
                      <div className="overflow-x-auto rounded border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-mono text-[11px] text-slate-800 select-all dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                        {h.val || '—'}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <CopyButton value={h.val} label="Copy" variant="ghost" />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to calculate cryptographic hashes"
        howToIntro="Compute SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes instantly from text or files with zero data uploaded."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Questions about WebCrypto, SHA-256 vs MD5, collision resistance, and file security."
        faqs={FAQ_ITEMS}
        toolId="hash-generator"
        category="Security"
      />
    </div>
  )
}
