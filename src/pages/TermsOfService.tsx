import { FileText, CheckCircle2 } from 'lucide-react'
import { PAGE_META } from '../lib/pageMeta'
import { JsonLd } from '../components/FaqAccordion'
import { usePageMeta } from '../lib/usePageMeta'
import { buildWebPageSchema } from '../lib/schema'

import { Breadcrumbs } from '../components/Breadcrumbs'

const PAGE_SCHEMA = buildWebPageSchema(PAGE_META.termsOfService)

export function TermsOfService() {
  usePageMeta(PAGE_META.termsOfService)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <JsonLd id="terms-page-schema" data={PAGE_SCHEMA} />
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: November 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <FileText className="size-5 text-indigo-500" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using CleanDevTools ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="size-5 text-indigo-500" />
              2. Use License & Availability
            </h2>
            <p>
              CleanDevTools provides free, client-side developer and data transformation utilities. You are free to use these tools for personal, academic, and commercial purposes without subscription fees or licensing royalties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              3. Disclaimer of Warranties
            </h2>
            <p>
              The tools and utilities are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we strive for absolute accuracy in data parsing, regex matching, fee computations, and token decoding, CleanDevTools does not warrant that the service will be uninterrupted, error-free, or entirely bug-free.
            </p>
            <p>
              You assume full responsibility for verifying the accuracy of any critical computations (including financial calculations and tax figures) before relying on them for commercial transactions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              4. Limitation of Liability
            </h2>
            <p>
              In no event shall CleanDevTools, its authors, or operators be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the site or its client-side utilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              5. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the website following any updates constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
