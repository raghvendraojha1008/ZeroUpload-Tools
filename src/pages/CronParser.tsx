import { useState, useMemo } from 'react'
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { explainCron, getNextRuns } from '../features/cron-parser/cron'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/cron-parser/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 mins', expr: '*/5 * * * *' },
  { label: 'Every 15 mins', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Daily at 9:00 AM', expr: '0 9 * * *' },
  { label: 'Weekdays at 9:00 AM', expr: '0 9 * * 1-5' },
  { label: 'Every Sunday midnight', expr: '0 0 * * 0' },
  { label: '1st of every month', expr: '0 0 1 * *' },
]

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Cron Expression Parser & Schedule Explainer',
  description:
    'Translate standard 5-part cron syntax into clear human English, inspect field breakdowns, and calculate upcoming run times.',
  features: [
    'Plain English translation of complex cron expressions',
    'Interactive 5-field breakdown (minute, hour, day, month, weekday)',
    'Next 10 execution dates calculated relative to local timezone',
    'Quick-click presets for common automation schedules',
    '100% private in-browser parsing with zero server calls',
  ],
})

export function CronParser() {
  const [expression, setExpression] = useState('*/15 9-17 * * 1-5')
  usePageMeta(PAGE_META.cronParser)

  const { description, fields } = useMemo(() => explainCron(expression), [expression])
  const isValid = !description.startsWith('Error:') && !description.startsWith('Invalid expression')

  const nextRuns = useMemo(() => {
    if (!isValid || typeof window === 'undefined') return []
    return getNextRuns(expression, 10)
  }, [expression, isValid])

  const stats = [
    {
      label: 'Syntax Status',
      value: isValid ? 'Valid POSIX' : 'Syntax Error',
      icon: CalendarClock,
      tone: (isValid ? 'ok' : 'warn') as 'ok' | 'warn',
    },
    {
      label: 'Fields Parsed',
      value: fields.length > 0 ? '5 / 5' : '0 / 5',
      icon: Clock,
    },
    {
      label: 'Upcoming Runs',
      value: `${nextRuns.length} runs`,
      icon: Sparkles,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="cron-parser-app-schema" data={APP_SCHEMA} />
      <JsonLd id="cron-parser-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Cron Parser' }]} />

      <ToolHeader
        title="Cron Expression"
        highlight="Parser"
        description="Convert complex cron syntax into plain English, inspect each field breakdown, and preview upcoming scheduled execution dates."
        badges={[
          { icon: ShieldCheck, label: 'POSIX Crontab' },
          { icon: Lock, label: 'Evaluated locally' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip items={stats} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-4">
            <Panel
              title="Expression Input"
              icon={CalendarClock}
              action={<CopyButton value={expression} label="Copy cron" />}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="cron-input" className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Cron Syntax (5 fields)
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="cron-input"
                      type="text"
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      placeholder="* * * * *"
                      spellCheck={false}
                      className={cn(
                        'w-full rounded-lg border bg-white px-3.5 py-2.5 font-mono text-base font-bold tracking-wider outline-none transition dark:bg-slate-900',
                        isValid
                          ? 'border-slate-200 text-slate-900 focus:border-indigo-500 dark:border-slate-800 dark:text-slate-100'
                          : 'border-red-400 text-red-600 focus:border-red-500 dark:border-red-500 dark:text-red-400',
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValid ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="size-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Presets
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setExpression(p.expr)}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-[11px] font-medium transition',
                          expression === p.expr
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700',
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-lg border p-3.5 transition-colors',
                    isValid
                      ? 'border-indigo-100 bg-indigo-50/50 text-slate-900 dark:border-indigo-950/60 dark:bg-indigo-950/30 dark:text-slate-100'
                      : 'border-red-100 bg-red-50/50 text-red-800 dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-300',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                      Human Meaning
                    </span>
                    {isValid && <CopyButton value={description} label="Copy" variant="ghost" />}
                  </div>
                  <p className="mt-1 text-[12.5px] font-medium leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
            {fields.length > 0 && (
              <Panel title="Field Breakdown" icon={Clock}>
                <div className="grid gap-2 sm:grid-cols-5">
                  {fields.map((f) => (
                    <div
                      key={f.name}
                      className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{f.name}</span>
                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-600 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-400">
                          {f.raw}
                        </code>
                      </div>
                      <p className="mt-1.5 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {nextRuns.length > 0 && (
              <Panel
                title="Upcoming Scheduled Runs"
                icon={CalendarClock}
                subtitle="Next 10 executions"
                action={
                  <CopyButton
                    value={nextRuns.map((d, i) => `${i + 1}. ${d.toLocaleString()} (${d.toISOString()})`).join('\n')}
                    label="Copy list"
                  />
                }
              >
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 font-mono text-[11.5px] dark:divide-slate-800 dark:border-slate-800">
                  {nextRuns.map((run, idx) => {
                    const now = Date.now()
                    const diffMinutes = Math.round((run.getTime() - now) / 60000)
                    const relativeStr =
                      diffMinutes < 60
                        ? `in ${diffMinutes}m`
                        : diffMinutes < 1440
                        ? `in ${(diffMinutes / 60).toFixed(1)}h`
                        : `in ${(diffMinutes / 1440).toFixed(1)}d`

                    return (
                      <div
                        key={run.toISOString()}
                        className="flex flex-col gap-1 px-3.5 py-2 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {run.toLocaleString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {relativeStr}
                          </span>
                          <span className="hidden text-[10px] sm:inline">{run.toISOString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to parse and inspect cron schedules"
        howToIntro="Paste standard POSIX cron syntax to read its human meaning and preview upcoming execution times in your browser."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Everything you need to know about cron syntax, step intervals, and execution timezones."
        faqs={FAQ_ITEMS}
        toolId="cron-parser"
        category="Dev"
      />
    </div>
  )
}
