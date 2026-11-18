import { useMemo, useState } from 'react'
import { ArrowRight, BadgePercent, Calculator, Lock, RotateCcw, Wallet } from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import {
  CURRENCIES,
  DEFAULT_PROVIDERS,
  compareProviders,
  formatMoney,
  parseAmount,
  ratesAreDefault,
  type CalculatorMode,
  type CurrencyCode,
  type FeeProvider,
  type ProviderResult,
} from '../features/fee-calculator/fees'
import { FAQ_ITEMS, PRIVACY_INTRO, PRIVACY_POINTS, STEPS } from '../features/fee-calculator/content'
import { usePageMeta } from '../lib/usePageMeta'
import { cn } from '../lib/cn'

const MODES: Array<{ value: CalculatorMode; label: string; hint: string }> = [
  { value: 'net', label: 'Desired payout', hint: 'What must I invoice?' },
  { value: 'gross', label: 'Invoice amount', hint: 'What will I receive?' },
]

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'Freelance Fee Calculator',
  description:
    'Compare Stripe, PayPal and Wise processing fees and work out the exact invoice needed to receive a target payout. Editable rates, no uploads.',
  features: [
    'Precise net-to-gross fee maths',
    'Provider comparison table',
    'Editable percentage and fixed fees',
    'Multiple billing currencies',
    'Client-side processing',
  ],
})

const FIELD_CLASS =
  'h-8 w-full rounded-md border border-slate-200 bg-white px-2 font-mono text-[11.5px] text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400/60'

function bestResult(results: ProviderResult[]): ProviderResult | null {
  const usable = results.filter((result) => !result.impossible)
  if (usable.length === 0) return null
  return usable.reduce((lowest, result) => (result.fee < lowest.fee ? result : lowest))
}

export function FreelanceFeeCalculator() {
  const [amountInput, setAmountInput] = useState('1200')
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [mode, setMode] = useState<CalculatorMode>('net')
  const [providers, setProviders] = useState<FeeProvider[]>(DEFAULT_PROVIDERS)

  usePageMeta({
    title: 'Freelance Fee Calculator',
    description:
      'Compare Stripe, PayPal and Wise processing fees and find the exact invoice amount that leaves you with the payout you need.',
    path: '/tools/freelance-fee-calculator',
  })

  const amount = parseAmount(amountInput)
  const results = useMemo(
    () => compareProviders(amount, mode, providers),
    [amount, mode, providers],
  )
  const best = bestResult(results)

  const symbol = CURRENCIES.find((item) => item.code === currency)?.symbol ?? '$'
  const hasResult = best !== null

  const summary = hasResult
    ? [
        `ZeroUpload fee breakdown (${currency})`,
        `Provider: ${best.provider.name} — ${best.provider.percent}% + ${formatMoney(best.provider.fixed, currency)}`,
        `Invoice: ${formatMoney(best.invoice, currency)}`,
        `Processing fee: ${formatMoney(best.fee, currency)}`,
        `You receive: ${formatMoney(best.payout, currency)}`,
        '',
        'Estimates only. Confirm current rates with your provider.',
      ].join('\n')
    : ''

  function updateRate(id: string, field: 'percent' | 'fixed', raw: string) {
    const parsed = Number(raw)
    const value = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    setProviders((current) =>
      current.map((provider) => (provider.id === id ? { ...provider, [field]: value } : provider)),
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="fee-calculator-app-schema" data={APP_SCHEMA} />
      <JsonLd id="fee-calculator-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'Freelance Fee Calculator' }]} />

      <ToolHeader
        title="Freelance Fee"
        highlight="Calculator"
        description="Work out exactly what to invoice so the amount you need lands after Stripe, PayPal or Wise take their cut. Rates are editable, maths is local."
        badges={[
          { icon: BadgePercent, label: 'Editable fee rates' },
          { icon: Lock, label: 'No uploads, no accounts' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            {
              label: mode === 'net' ? 'Invoice your client' : 'Invoice amount',
              value: hasResult
                ? formatMoney(mode === 'net' ? best.invoice : amount, currency)
                : '—',
              icon: Wallet,
            },
            {
              label: 'Processing fee',
              value: hasResult ? formatMoney(best.fee, currency) : '—',
              icon: BadgePercent,
              tone: 'warn',
            },
            {
              label: 'You receive',
              value: hasResult
                ? formatMoney(mode === 'net' ? amount : best.payout, currency)
                : '—',
              icon: Calculator,
              tone: 'ok',
            },
            {
              label: 'Cheapest provider',
              value: hasResult ? best.provider.name : '—',
              icon: ArrowRight,
            },
          ]}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
            <Panel title="What are you billing?">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fee-amount"
                    className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                  >
                    {mode === 'net' ? 'Payout you want to keep' : 'Invoice you send'}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-sm text-slate-500 dark:text-slate-400">
                        {symbol}
                      </span>
                      <input
                        id="fee-amount"
                        value={amountInput}
                        onChange={(event) => setAmountInput(event.target.value)}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="1200"
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 font-mono text-lg text-slate-900 tabular-nums outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400/60"
                      />
                    </div>

                    <label htmlFor="fee-currency" className="sr-only">
                      Currency
                    </label>
                    <select
                      id="fee-currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                      className="h-12 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-400/60"
                    >
                      {CURRENCIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} · {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {amount === 0 ? (
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      Enter an amount above zero to see the breakdown.
                    </p>
                  ) : null}
                </div>

                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Calculation mode
                  </span>
                  <div
                    role="group"
                    aria-label="Calculation mode"
                    className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {MODES.map((option) => {
                      const isActive = mode === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMode(option.value)}
                          aria-pressed={isActive}
                          className={cn(
                            'rounded-md px-2 py-2 text-left transition',
                            isActive
                              ? 'bg-white shadow-sm dark:bg-slate-700'
                              : 'hover:bg-white/60 dark:hover:bg-slate-800',
                          )}
                        >
                          <span
                            className={cn(
                              'block text-[12px] font-medium',
                              isActive
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-400',
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[10.5px] text-slate-500 dark:text-slate-400">
                            {option.hint}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="Provider comparison"
              bodyClassName="p-0"
              subtitle={`${currency} · updated live`}
              action={
                <CopyButton
                  value={summary}
                  label="Copy breakdown"
                  variant="ghost"
                  className="px-2 py-1"
                  disabled={!hasResult}
                  toastMessage="Breakdown copied"
                />
              }
            >
              <div className="scroll-slim w-full max-w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        Provider
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        Fee
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        Invoice
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        You receive
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => {
                      const isBest = best !== null && result.provider.id === best.provider.id
                      return (
                        <tr
                          key={result.provider.id}
                          className={cn(
                            'border-b border-slate-200 dark:border-slate-800',
                            isBest
                              ? 'bg-indigo-500/[0.04] dark:bg-indigo-400/[0.06]'
                              : 'bg-white dark:bg-slate-950',
                          )}
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">
                                {result.provider.name}
                              </span>
                              {isBest && !result.impossible ? (
                                <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                                  Best net
                                </span>
                              ) : null}
                            </div>
                            <span className="mt-0.5 block font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {result.provider.percent}% +{' '}
                              {formatMoney(result.provider.fixed, currency)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right align-top font-mono tabular-nums text-rose-600 dark:text-rose-400">
                            {result.impossible ? '—' : formatMoney(result.fee, currency)}
                          </td>
                          <td className="px-4 py-3 text-right align-top font-mono tabular-nums text-slate-900 dark:text-slate-100">
                            {result.impossible ? 'Impossible' : formatMoney(result.invoice, currency)}
                          </td>
                          <td className="px-4 py-3 text-right align-top font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                            {result.impossible ? '—' : formatMoney(result.payout, currency)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <p className="px-4 py-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {mode === 'net'
                  ? 'Invoice figures include the processing fee, so the client pays it and your payout stays exact to the cent.'
                  : 'Payout figures are what remains after the provider deducts its fee from the amount you invoice.'}
              </p>
            </Panel>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel
              title="Fee rates"
              subtitle={ratesAreDefault(providers) ? 'defaults' : 'custom'}
              action={
                <button
                  type="button"
                  onClick={() => setProviders(DEFAULT_PROVIDERS)}
                  disabled={ratesAreDefault(providers)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              }
            >
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                        {provider.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {provider.percent}% + {formatMoney(provider.fixed, currency)}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label
                          htmlFor={`${provider.id}-percent`}
                          className="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                        >
                          Percent
                        </label>
                        <div className="relative mt-1">
                          <input
                            id={`${provider.id}-percent`}
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={provider.percent}
                            onChange={(event) =>
                              updateRate(provider.id, 'percent', event.target.value)
                            }
                            className={cn(FIELD_CLASS, 'pr-6')}
                          />
                          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`${provider.id}-fixed`}
                          className="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                        >
                          Fixed
                        </label>
                        <input
                          id={`${provider.id}-fixed`}
                          type="number"
                          min={0}
                          step={0.01}
                          value={provider.fixed}
                          onChange={(event) => updateRate(provider.id, 'fixed', event.target.value)}
                          className={cn(FIELD_CLASS, 'mt-1')}
                        />
                      </div>
                    </div>

                    <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {provider.note}
                    </p>
                  </div>
                ))}

                <p className="border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Fixed fees are charged in {currency}. Rates are illustrative defaults — check your
                  provider’s pricing page for your country, card mix and volume.
                </p>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>
      </div>

      <ToolGuide
        howToTitle="How to price in the processing fee"
        howToIntro="Decide what you need to keep, compare providers, then quote an invoice that covers the fee exactly."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="The net-to-gross formula, why small invoices hurt, and where this estimate stops."
        faqs={FAQ_ITEMS}
      />
    </div>
  )
}
