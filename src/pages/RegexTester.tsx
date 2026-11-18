import { useMemo, useState } from 'react'
import {
  Code2,
  Highlighter,
  Layers,
  ListOrdered,
  Lock,
  Replace,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { ErrorBanner } from '../components/ErrorBanner'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import {
  MAX_MATCHES,
  FLAG_OPTIONS,
  buildSegments,
  flagString,
  replaceMatches,
  runRegex,
} from '../features/regex-tester/regex'
import { PRESETS, SAMPLE_TEXT } from '../features/regex-tester/sample'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/regex-tester/content'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const DISPLAY_LIMIT = 100

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Regex Tester',
  description:
    'Test JavaScript regular expressions with live highlighting, capture group inspection, named groups and a replace preview — entirely in your browser.',
  features: [
    'Live match highlighting',
    'Numbered and named capture groups',
    'i, m, s and u modifier toggles',
    'Replace preview with $1 and $<name>',
    'Preset pattern library',
    'Client-side processing',
  ],
})

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<Set<string>>(new Set())
  const [text, setText] = useState('')
  const [replacement, setReplacement] = useState('')

  usePageMeta({
    title: 'Online Regex Tester & Debugger — Instant Regex Matcher',
    description:
      'Test and debug regular expressions online with live color highlighting, capture groups breakdown, cheatsheet presets, and replace preview. 100% in-browser.',
    path: '/tools/regex-tester',
  })

  const activeFlags = flagString(flags)
  // Scanning is always global; the toggles only change how the pattern is read.
  const regexFlags = `${activeFlags}g`

  const result = useMemo(
    () => runRegex(pattern, regexFlags, text),
    [pattern, regexFlags, text],
  )
  const segments = useMemo(() => buildSegments(text, result.matches), [text, result.matches])
  const replaceResult = useMemo(
    () => replaceMatches(pattern, regexFlags, text, replacement),
    [pattern, regexFlags, text, replacement],
  )

  const copiedPattern = `/${pattern}/${activeFlags}`
  const matchJson = useMemo(
    () =>
      JSON.stringify(
        result.matches.map((match) => ({
          index: match.index,
          match: match.value,
          groups: match.groups,
          named: match.named,
        })),
        null,
        2,
      ),
    [result.matches],
  )

  function toggleFlag(flag: string) {
    setFlags((current) => {
      const next = new Set(current)
      if (next.has(flag)) next.delete(flag)
      else next.add(flag)
      return next
    })
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setPattern(preset.pattern)
    setFlags(new Set(preset.flags.split('').filter(Boolean)))
    setText(preset.text)
  }

  function reset() {
    setPattern('')
    setFlags(new Set())
    setText('')
    setReplacement('')
  }

  const matchLabel = result.truncated
    ? `${result.matches.length.toLocaleString()}+`
    : result.matches.length.toLocaleString()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="regex-tester-app-schema" data={APP_SCHEMA} />
      <JsonLd id="regex-tester-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Regex Tester' }]} />

      <ToolHeader
        title="Regex Tester"
        highlight="& Playground"
        description="Write a pattern, watch matches highlight as you type, inspect every capture group and preview a replacement — using your browser’s own regex engine."
        badges={[
          { icon: Code2, label: 'JavaScript RegExp' },
          { icon: Lock, label: 'Patterns never leave the tab' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            { label: 'Matches', value: matchLabel, icon: ListOrdered },
            {
              label: 'Capture groups',
              value: pattern && !result.error ? String(result.groupCount) : '—',
              icon: Layers,
            },
            {
              label: 'Modifiers',
              value: activeFlags || 'none',
              icon: Code2,
            },
            {
              label: 'Test length',
              value: text.length.toLocaleString(),
              icon: Highlighter,
            },
          ]}
        />

        {result.error ? (
          <ErrorBanner
            title="Pattern is not valid"
            hint="Nothing was sent anywhere — the pattern is compiled locally, so fix the syntax above and matches appear instantly."
            message={result.error}
            onDismiss={() => setPattern('')}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="Pattern & test text"
            className="lg:col-span-2"
            action={
              <button
                type="button"
                onClick={() => setText(SAMPLE_TEXT)}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Sparkles className="size-3.5" />
                Load sample text
              </button>
            }
          >
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="regex-pattern"
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                >
                  Regular expression
                </label>
                <div
                  className={cn(
                    'mt-2 flex items-center gap-1 rounded-lg border bg-white px-3 transition focus-within:ring-4 dark:bg-slate-900',
                    result.error
                      ? 'border-rose-400 focus-within:ring-rose-500/10 dark:border-rose-400/60'
                      : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-500/10 dark:border-slate-800 dark:focus-within:border-indigo-400/60',
                  )}
                >
                  <span aria-hidden="true" className="font-mono text-[13px] text-slate-400">
                    /
                  </span>
                  <input
                    id="regex-pattern"
                    value={pattern}
                    onChange={(event) => setPattern(event.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    aria-invalid={Boolean(result.error)}
                    placeholder="\buser=(?<user>[\w.@-]+)"
                    className="h-11 min-w-0 flex-1 bg-transparent font-mono text-[13px] text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
                  />
                  <span
                    aria-hidden="true"
                    className="font-mono text-[12px] text-slate-500 dark:text-slate-400"
                  >
                    /{activeFlags}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Flags
                </span>
                {FLAG_OPTIONS.map((option) => {
                  const isActive = flags.has(option.flag)
                  return (
                    <button
                      key={option.flag}
                      type="button"
                      onClick={() => toggleFlag(option.flag)}
                      aria-pressed={isActive}
                      title={option.description}
                      className={cn(
                        'rounded-md border px-2 py-1 font-mono text-[11px] transition',
                        isActive
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/40 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100',
                      )}
                    >
                      {option.flag}
                    </button>
                  )
                })}
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  global scan always on
                </span>
              </div>

              <div>
                <label
                  htmlFor="regex-text"
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                >
                  Test text
                </label>
                <textarea
                  id="regex-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  spellCheck={false}
                  placeholder="Paste the text or log lines you want to test…"
                  className="scroll-slim mt-2 min-h-[200px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
                />
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="size-3.5 shrink-0" />
                Compiled and matched on this device · 0 bytes uploaded
              </p>
            </div>
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Presets" subtitle="click to load">
              <ul className="space-y-2">
                {PRESETS.map((preset) => (
                  <li key={preset.name}>
                    <button
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                    >
                      <span className="block text-[12px] font-medium text-slate-800 dark:text-slate-200">
                        {preset.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        /{preset.pattern}/{preset.flags}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Actions">
              <div className="space-y-2">
                <CopyButton
                  value={pattern ? copiedPattern : ''}
                  label="Copy pattern"
                  variant="solid"
                  className="w-full"
                  disabled={!pattern}
                  toastMessage="Pattern copied"
                />
                <CopyButton
                  value={matchJson}
                  label="Copy match JSON"
                  variant="outline"
                  className="w-full"
                  disabled={result.matches.length === 0}
                  toastMessage="Matches copied as JSON"
                />
                <button
                  type="button"
                  onClick={reset}
                  disabled={!pattern && !text}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </button>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>

        <Panel
          title="Highlighted matches"
          subtitle={pattern ? `${result.matches.length.toLocaleString()} found` : 'waiting for a pattern'}
          bodyClassName="p-0"
        >
          <div className="scroll-slim max-h-[320px] overflow-auto p-4">
            {text ? (
              <pre className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">
                {segments.map((segment, index) =>
                  segment.matchIndex === null ? (
                    <span key={index}>{segment.text}</span>
                  ) : (
                    <mark
                      key={index}
                      className="rounded bg-indigo-500/20 px-0.5 text-slate-900 dark:bg-indigo-400/30 dark:text-white"
                    >
                      {segment.text}
                    </mark>
                  ),
                )}
              </pre>
            ) : (
              <p className="py-10 text-center text-[13px] text-slate-500 dark:text-slate-400">
                Paste test text or load the sample to see matches highlighted inline.
              </p>
            )}
          </div>
        </Panel>

        <Panel
          title="Matches"
          subtitle={
            result.matches.length > DISPLAY_LIMIT
              ? `showing first ${DISPLAY_LIMIT} of ${result.matches.length}`
              : 'offset · value · groups'
          }
          bodyClassName="p-0"
        >
          {result.matches.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-slate-500 dark:text-slate-400">
              {pattern
                ? 'No matches yet — check the flags, or loosen the pattern.'
                : 'Every match appears here with its offset and capture groups.'}
            </p>
          ) : (
            <>
              <div className="scroll-slim w-full max-w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr>
                      {['#', 'Offset', 'Match', 'Groups'].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.matches.slice(0, DISPLAY_LIMIT).map((match, index) => (
                      <tr
                        key={`${match.index}-${index}`}
                        className="bg-white transition-colors even:bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-950 dark:even:bg-slate-900/60 dark:hover:bg-slate-800/50"
                      >
                        <td className="border-b border-slate-200 px-4 py-2.5 align-top font-mono text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          {index + 1}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-2.5 align-top font-mono text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          {match.index}
                        </td>
                        <td className="max-w-[320px] border-b border-slate-200 px-4 py-2.5 align-top dark:border-slate-800">
                          <span className="font-mono text-[12px] break-all text-slate-900 dark:text-slate-100">
                            {match.value === '' ? '(empty match)' : match.value}
                          </span>
                        </td>
                        <td className="border-b border-slate-200 px-4 py-2.5 align-top dark:border-slate-800">
                          {match.groups.length === 0 &&
                          Object.keys(match.named).length === 0 ? (
                            <span className="text-slate-400 dark:text-slate-500">—</span>
                          ) : (
                            <ul className="space-y-0.5">
                              {match.groups.map((group, groupIndex) => (
                                <li
                                  key={groupIndex}
                                  className="font-mono text-[11px] text-slate-700 dark:text-slate-300"
                                >
                                  <span className="text-slate-500 dark:text-slate-400">
                                    ${groupIndex + 1}
                                  </span>{' '}
                                  {group === null ? (
                                    <span className="text-slate-400 dark:text-slate-500">
                                      unmatched
                                    </span>
                                  ) : (
                                    group || '""'
                                  )}
                                </li>
                              ))}
                              {Object.entries(match.named).map(([name, value]) => (
                                <li
                                  key={name}
                                  className="font-mono text-[11px] text-slate-700 dark:text-slate-300"
                                >
                                  <span className="text-slate-500 dark:text-slate-400">
                                    &lt;{name}&gt;
                                  </span>{' '}
                                  {value ?? 'unmatched'}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                {result.truncated
                  ? `Scanning stopped at ${MAX_MATCHES.toLocaleString()} matches to keep the tab responsive.`
                  : `${result.matches.length.toLocaleString()} match${result.matches.length === 1 ? '' : 'es'} · capture groups are numbered from $1, named groups from <name>.`}
              </p>
            </>
          )}
        </Panel>

        <Panel title="Replace preview" icon={Replace}>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="regex-replacement"
                className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
              >
                Replacement
              </label>
              <input
                id="regex-replacement"
                value={replacement}
                onChange={(event) => setReplacement(event.target.value)}
                spellCheck={false}
                placeholder="[$<key>] $<value>"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-[12.5px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
              />
            </div>

            {replaceResult.error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300">
                {replaceResult.error}
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Output
                  </span>
                  <CopyButton
                    value={replaceResult.output}
                    label="Copy output"
                    variant="ghost"
                    className="px-2 py-1"
                    disabled={!replaceResult.output}
                    toastMessage="Replaced text copied"
                  />
                </div>
                <pre className="scroll-slim max-h-[240px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3.5 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-words text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {replaceResult.output || 'The rewritten text appears here.'}
                </pre>
              </>
            )}
          </div>
        </Panel>
      </div>

      <ToolGuide
        howToTitle="How to test a regular expression"
        howToIntro="Write it, watch the highlights, then confirm the capture groups before the pattern goes into your code."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Flavour details, global scanning, capture groups and the replace preview."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
