import { useState, useEffect, useMemo } from 'react'
import {
  History,
  Clock,
  Pause,
  Play,
  ShieldCheck,
  Lock,
  Calendar,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { formatTimestamp, dateToTimestamp } from '../features/unix-timestamp/converter'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/unix-timestamp/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Unix Timestamp & Epoch Converter',
  description:
    'Convert Unix epoch timestamps (seconds and milliseconds) to human dates (Local, UTC, ISO 8601) and calculate timestamps from any date.',
  features: [
    'Live real-time ticking Unix epoch clock with pause toggle',
    'Automatic detection of seconds (10-digit) and milliseconds (13-digit)',
    'Dual conversion: Epoch to Human Date and Human Date to Epoch',
    'Displays Local, UTC/GMT, ISO 8601, and relative human offsets',
    '100% private in-browser date arithmetic with zero tracking',
  ],
})

export function UnixTimestampConverter() {
  usePageMeta(PAGE_META.unixTimestampConverter)

  const [currentMs, setCurrentMs] = useState(1795340000000)
  const [isLive, setIsLive] = useState(true)
  const [epochInput, setEpochInput] = useState('1700000000')

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [day, setDay] = useState(now.getDate())
  const [hour, setHour] = useState(now.getHours())
  const [minute, setMinute] = useState(now.getMinutes())
  const [second, setSecond] = useState(now.getSeconds())
  const [isUtcMode, setIsUtcMode] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setCurrentMs(Date.now())
    if (!isLive) return

    const interval = setInterval(() => {
      setCurrentMs(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive])

  const currentSec = Math.floor(currentMs / 1000)
  const parsedDate = useMemo(() => formatTimestamp(epochInput), [epochInput])
  const generatedEpoch = useMemo(
    () => dateToTimestamp(year, month, day, hour, minute, second, isUtcMode),
    [year, month, day, hour, minute, second, isUtcMode],
  )

  const stats = [
    {
      label: 'Live Epoch',
      value: String(currentSec),
      icon: Clock,
      tone: (isLive ? 'ok' : 'default') as 'ok' | 'default',
    },
    {
      label: 'Input Units',
      value: parsedDate ? (parsedDate.isMilliseconds ? 'Milliseconds' : 'Seconds') : 'Invalid',
      icon: History,
    },
    {
      label: 'Relative Time',
      value: parsedDate ? parsedDate.relative : '—',
      icon: Calendar,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="unix-timestamp-app-schema" data={APP_SCHEMA} />
      <JsonLd id="unix-timestamp-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Unix Timestamp Converter' }]} />

      <ToolHeader
        title="Unix Timestamp"
        highlight="Converter"
        description="Convert seconds and milliseconds to human dates in Local, UTC, and ISO 8601 formats, or generate Unix timestamps from any calendar date."
        badges={[
          { icon: ShieldCheck, label: 'Instant conversion' },
          { icon: Lock, label: 'Zero tracking' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip items={stats} />

        {/* Live Clock Bar */}
        <Panel
          title="Current Unix Epoch Time"
          icon={Clock}
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {isLive ? <Pause className="size-3" /> : <Play className="size-3" />}
                {isLive ? 'Pause' : 'Resume'}
              </button>
              <CopyButton value={String(currentSec)} label="Copy seconds" />
            </div>
          }
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {currentSec}
              </span>
              <span className="ml-3 font-mono text-xs text-slate-400 dark:text-slate-500">
                ({currentMs} ms)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEpochInput(String(currentSec))}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              Use as converter input →
            </button>
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Timestamp to Date */}
          <Panel title="Epoch Timestamp to Date" icon={History}>
            <div className="space-y-4">
              <div>
                <label htmlFor="epoch-val" className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Unix Timestamp (seconds or ms)
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="epoch-val"
                    type="text"
                    value={epochInput}
                    onChange={(e) => setEpochInput(e.target.value)}
                    placeholder="1700000000"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <CopyButton value={epochInput} label="Copy" />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Now', val: String(currentSec) },
                  { label: '-1h', val: String(currentSec - 3600) },
                  { label: '-1d', val: String(currentSec - 86400) },
                  { label: '+1d', val: String(currentSec + 86400) },
                  { label: '+1w', val: String(currentSec + 604800) },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => setEpochInput(btn.val)}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {parsedDate ? (
                <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Local Time</span>
                    <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      <span>{parsedDate.local}</span>
                      <CopyButton value={parsedDate.local} variant="ghost" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                    <span className="text-[11px] font-medium text-slate-500">UTC / GMT</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-800 dark:text-slate-200">
                      <span>{parsedDate.utc}</span>
                      <CopyButton value={parsedDate.utc} variant="ghost" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                    <span className="text-[11px] font-medium text-slate-500">ISO 8601</span>
                    <div className="flex items-center gap-1.5 font-mono text-indigo-600 dark:text-cyan-400">
                      <span>{parsedDate.iso}</span>
                      <CopyButton value={parsedDate.iso} variant="ghost" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                    <span className="text-[11px] font-medium text-slate-500">Offset</span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-300">
                      {parsedDate.relative}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-600">Please enter a valid numeric Unix timestamp.</p>
              )}
            </div>
          </Panel>

          {/* Date to Timestamp */}
          <Panel
            title="Date to Unix Epoch"
            icon={Calendar}
            action={
              <div
                role="group"
                aria-label="Timezone"
                className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => setIsUtcMode(false)}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[11px] font-medium transition',
                    !isUtcMode
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                  )}
                >
                  Local
                </button>
                <button
                  type="button"
                  onClick={() => setIsUtcMode(true)}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[11px] font-medium transition',
                    isUtcMode
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                  )}
                >
                  UTC
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-medium uppercase text-slate-500">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase text-slate-500">Month</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase text-slate-500">Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase text-slate-500">Hour (0-23)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hour}
                    onChange={(e) => setHour(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase text-slate-500">Min</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minute}
                    onChange={(e) => setMinute(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase text-slate-500">Sec</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={second}
                    onChange={(e) => setSecond(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium uppercase text-slate-500">Seconds</span>
                    <p className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                      {generatedEpoch.seconds}
                    </p>
                  </div>
                  <CopyButton value={String(generatedEpoch.seconds)} label="Copy" />
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                  <div>
                    <span className="text-[10px] font-medium uppercase text-slate-500">Milliseconds</span>
                    <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {generatedEpoch.milliseconds}
                    </p>
                  </div>
                  <CopyButton value={String(generatedEpoch.milliseconds)} label="Copy" variant="ghost" />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to convert Unix timestamps and dates"
        howToIntro="Convert between Unix epoch numbers and standard calendar dates with automatic timezone handling."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Learn about Unix time, Y2038 compliance, seconds vs milliseconds, and ISO 8601 formatting."
        faqs={FAQ_ITEMS}
        toolId="unix-timestamp-converter"
        category="Dev"
      />
    </div>
  )
}
