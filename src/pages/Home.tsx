import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Gauge, Search, ShieldCheck, X, Zap } from 'lucide-react'
import { CATEGORIES, TOOLS, matchesTool, type CategoryFilter } from '../lib/tools'
import { JsonLd } from '../components/FaqAccordion'
import { ToolCard } from '../components/ToolCard'
import { PAGE_META } from '../lib/pageMeta'
import { buildWebSiteSchema } from '../lib/schema'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const WEBSITE_SCHEMA = buildWebSiteSchema()

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Nothing is uploaded',
    body: 'Files are read with the browser File API and processed in this tab — there is no server endpoint.',
  },
  {
    icon: Zap,
    title: 'Instant results',
    body: 'No request round-trips and no queues. Parsing, conversion and download all happen on your machine.',
  },
  {
    icon: Gauge,
    title: 'No file size limits',
    body: 'Your RAM is the only ceiling. Handle multi-megabyte exports without waiting on an upload.',
  },
]

export function Home() {
  usePageMeta(PAGE_META.home)

  const location = useLocation()
  const heroSearchRef = useRef<HTMLInputElement>(null)
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [category, setCategory] = useState<CategoryFilter>('All')

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  // The header shortcut sends small screens here, where the hero search lives.
  useEffect(() => {
    if ((location.state as { focusSearch?: boolean } | null)?.focusSearch) {
      heroSearchRef.current?.focus()
    }
  }, [location.state])

  const visibleTools = useMemo(
    () =>
      TOOLS.filter(
        (tool) => (category === 'All' || tool.category === category) && matchesTool(tool, query),
      ),
    [category, query],
  )

  const isFiltered = category !== 'All' || query.trim().length > 0

  return (
    <>
      <JsonLd id="home-website-schema" data={WEBSITE_SCHEMA} />

      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div
          aria-hidden="true"
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_72%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Private by architecture · 0 uploads
          </span>

          <h1 className="mt-6 max-w-3xl text-balance text-[34px] font-semibold leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.06]">
            Fast, free &amp; 100% private{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              developer utilities.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
            Files never leave your browser. Convert, clean and inspect your data with tools that
            run entirely on your machine — no uploads, no accounts, no limits.
          </p>

          <div className="relative mt-7 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              ref={heroSearchRef}
              id="tool-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools, formats or tasks…"
              aria-label="Search tools"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] text-slate-900 shadow-sm shadow-slate-900/[0.03] outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Try “JSON”, “CSV”, “token” or “fees”.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Tools directory</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              {isFiltered
                ? `Showing ${visibleTools.length} of ${TOOLS.length} tools`
                : `${TOOLS.length} tools · every one runs on your device`}
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {CATEGORIES.map((item) => {
              const count = TOOLS.filter(
                (tool) => item === 'All' || tool.category === item,
              ).length
              const isActive = category === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={isActive}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100',
                  )}
                >
                  {item}
                  <span
                    className={cn(
                      'ml-1.5 font-mono text-[10px]',
                      isActive ? 'opacity-60' : 'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {visibleTools.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No tools match “{query}”
            </p>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Try a broader term, or reset the filters to see everything.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCategory('All')
              }}
              className="mt-5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon
            return (
              <div
                key={point.title}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <Icon className="size-4 text-indigo-500 dark:text-indigo-400" />
                <h3 className="mt-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                  {point.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {point.body}
                </p>
              </div>
            )
          })}
        </div>

        {!isFiltered && (
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Everything here runs on your device. Nothing you paste is ever collected or transmitted.
          </p>
        )}
      </section>
    </>
  )
}
