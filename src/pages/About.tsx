import { ShieldCheck, Cpu, Zap, Mail } from 'lucide-react'
import { PAGE_META } from '../lib/pageMeta'
import { JsonLd } from '../components/FaqAccordion'
import { usePageMeta } from '../lib/usePageMeta'
import { buildWebPageSchema } from '../lib/schema'

import { Breadcrumbs } from '../components/Breadcrumbs'
import { Link } from 'react-router-dom'

const PAGE_SCHEMA = buildWebPageSchema(PAGE_META.about)

export function About() {
  usePageMeta(PAGE_META.about)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <JsonLd id="about-page-schema" data={PAGE_SCHEMA} />
      <Breadcrumbs items={[{ label: 'About' }]} />

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          About CleanDevTools
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          We believe routine data tasks shouldn't require sending your sensitive files across the Internet or paying costly monthly subscriptions.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
            <ShieldCheck className="size-6 text-emerald-500" />
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Privacy First</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              100% of data processing happens inside your browser using standard Web APIs. No cloud servers, no file storage, no data breaches.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
            <Zap className="size-6 text-amber-500" />
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Instant Speed</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Zero network latency. Parsing, transformations, and downloads are executed directly on your machine's CPU and RAM.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
            <Cpu className="size-6 text-indigo-500" />
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Always Free</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              No artificial 2-file-per-day caps, no email capture walls, and no paywalls. Supported by non-intrusive banner ads.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Our Story & Mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Modern web utilities have become bloated with intrusive full-screen popups, mandatory user accounts, and aggressive \$15/month subscriptions just to convert a simple JSON file or clean a spreadsheet column. Even worse, many popular converters quietly upload sensitive spreadsheets and production JWT tokens to third-party cloud servers.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            CleanDevTools was created to provide a modern, ultra-clean alternative built on modern web standards like HTML5 File API and Web Workers.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow transition hover:bg-indigo-500"
            >
              Explore All Tools
            </Link>
            <a
              href="mailto:support@cleandevtools.com"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Mail className="size-3.5" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
