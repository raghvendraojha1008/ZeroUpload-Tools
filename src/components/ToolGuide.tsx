import { Check, ShieldCheck } from 'lucide-react'
import { FaqAccordion, type FaqItem } from './FaqAccordion'
import { AdSlot } from './AdSlot'

export interface GuideStep {
  title: string
  body: string
}

export interface ToolGuideProps {
  howToTitle: string
  howToIntro: string
  steps: GuideStep[]
  privacyIntro: string
  privacyPoints: string[]
  faqTitle?: string
  faqIntro: string
  faqs: FaqItem[]
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function buildAppSchema(input: {
  name: string
  description: string
  features: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: input.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    description: input.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: input.features,
  }
}

/** Shared how-it-works, privacy and FAQ block that closes every tool page. */
export function ToolGuide({
  howToTitle,
  howToIntro,
  steps,
  privacyIntro,
  privacyPoints,
  faqTitle = 'Frequently asked questions',
  faqIntro,
  faqs,
}: ToolGuideProps) {
  return (
    <section className="mt-16 border-t border-slate-200 pt-12 dark:border-slate-800">
      <AdSlot variant="banner" className="mb-10" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            {howToTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {howToIntro}
          </p>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
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
                Why client-side processing is safer
              </h2>
            </div>
            <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
              {privacyIntro}
            </p>
            <ul className="mt-4 space-y-2.5">
              {privacyPoints.map((point) => (
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
            {faqTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {faqIntro}
          </p>
          <div className="mt-5">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </div>
    </section>
  )
}
