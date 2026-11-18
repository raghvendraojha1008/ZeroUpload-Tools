import { Check, ShieldCheck } from 'lucide-react'
import { FaqAccordion, type FaqItem } from '../../components/FaqAccordion'
import { AdSlot } from '../../components/AdSlot'

const STEPS = [
  {
    title: 'Add your JSON',
    body: 'Drop a .json file, paste a response from your API, or load the sample data. Arrays of objects, single objects and deeply nested payloads are all accepted.',
  },
  {
    title: 'Review the flattened preview',
    body: 'Nested keys become underscore columns — user.address.city turns into user_address_city — and every row is padded to the full column set.',
  },
  {
    title: 'Choose a format and export',
    body: 'Pick a comma, semicolon or tab delimiter, optionally quote-wrap every field, then download the .csv or copy it straight into Excel or Sheets.',
  },
]

const PRIVACY_POINTS = [
  'No request is made with your data — the file is read with the browser File API and parsed in memory.',
  'Nothing is written to a database, a cache or an analytics service. Closing the tab discards it.',
  'The converter keeps working offline once the page has loaded, which is only possible because the work never leaves your device.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is my JSON uploaded to a server?',
    answer:
      'No. The file is read locally with the browser File API and parsed with JSON.parse inside this tab. There is no upload endpoint, so your data cannot be transmitted, logged or stored.',
  },
  {
    question: 'How are nested objects and arrays converted to columns?',
    answer:
      'Nested objects are flattened with underscore paths, so {"user":{"address":{"city":"London"}}} becomes user_address_city. Arrays of primitives are joined with a semicolon, while arrays of objects are indexed as items_0_sku, items_1_sku and so on.',
  },
  {
    question: 'Will the CSV open correctly in Excel or Google Sheets?',
    answer:
      'Yes. The export uses CRLF line endings and UTF-8 with a byte-order mark, which Excel detects automatically. Fields containing the delimiter, quotes or newlines are escaped according to RFC 4180.',
  },
  {
    question: 'Is there a file size limit?',
    answer:
      'No artificial limit. The only constraint is your available browser memory. Because nothing is uploaded, large exports convert at the speed of your machine rather than your connection.',
  },
]

export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON to CSV Converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  description:
    'Convert JSON to clean CSV entirely in your browser. Flattens nested keys, previews rows and exports Excel-ready files without uploading anything.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Nested key flattening',
    'Live table preview',
    'Comma, semicolon and tab delimiters',
    'CSV quote wrapping',
    'Client-side processing',
  ],
}

export function JsonToCsvContent() {
  return (
    <section className="mt-16 border-t border-slate-200 pt-12 dark:border-slate-800">
      <AdSlot variant="banner" className="mb-10" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            How to convert JSON to CSV
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Three steps, no sign-up, no waiting on an upload. Everything below runs inside this
            browser tab.
          </p>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <span className="flex size-6 items-center justify-center rounded-md border border-slate-200 bg-slate-100 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Why client-side conversion is safer
              </h2>
            </div>
            <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
              Most online converters upload your file to a server, transform it there and hand back
              a download link — which means your customer list, API response or financial export
              sits on someone else’s disk, often indefinitely. This tool removes that step entirely.
            </p>
            <ul className="mt-4 space-y-2.5">
              {PRIVACY_POINTS.map((point) => (
                <li key={point} className="flex gap-2.5 text-[13px] leading-relaxed">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-slate-600 dark:text-slate-400">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Everything about flattening, escaping and export formats.
          </p>
          <div className="mt-5">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </div>
    </section>
  )
}
