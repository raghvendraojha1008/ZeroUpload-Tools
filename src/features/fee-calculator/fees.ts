export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR'

export const CURRENCIES: Array<{ code: CurrencyCode; symbol: string; label: string }> = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
]

export interface FeeProvider {
  id: string
  name: string
  /** Percentage fee, e.g. 2.9 for 2.9%. Editable because rates change by region. */
  percent: number
  /** Fixed per-transaction fee, in the billing currency. */
  fixed: number
  note: string
}

export const DEFAULT_PROVIDERS: FeeProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    percent: 2.9,
    fixed: 0.3,
    note: 'Standard domestic card rate. Cards issued abroad typically add ~1.5%.',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    percent: 3.49,
    fixed: 0.49,
    note: 'Commercial payment, domestic. International payments add ~1.5%.',
  },
  {
    id: 'wise',
    name: 'Wise',
    percent: 0.6,
    fixed: 0.3,
    note: 'Business receiving plus conversion. Bank transfers are often cheaper than cards.',
  },
]

export type CalculatorMode = 'net' | 'gross'

export function feeAmount(gross: number, percent: number, fixed: number): number {
  return (gross * percent) / 100 + fixed
}

export function netFromGross(gross: number, percent: number, fixed: number): number {
  return gross - feeAmount(gross, percent, fixed)
}

/** Solves gross = net + gross * rate + fixed. Returns Infinity above a 100% fee. */
export function grossFromNet(net: number, percent: number, fixed: number): number {
  const rate = percent / 100
  if (rate >= 1) return Number.POSITIVE_INFINITY
  return (net + fixed) / (1 - rate)
}

export interface ProviderResult {
  provider: FeeProvider
  invoice: number
  fee: number
  payout: number
  impossible: boolean
}

/**
 * With mode 'net' the input is the payout you want, so each provider returns the
 * invoice needed. With mode 'gross' the input is the invoice and each provider
 * returns what actually lands in your account.
 */
export function compareProviders(
  amount: number,
  mode: CalculatorMode,
  providers: FeeProvider[],
): ProviderResult[] {
  return providers.map((provider) => {
    if (mode === 'gross') {
      const fee = feeAmount(amount, provider.percent, provider.fixed)
      return {
        provider,
        invoice: amount,
        fee,
        payout: amount - fee,
        impossible: false,
      }
    }

    const invoice = grossFromNet(amount, provider.percent, provider.fixed)
    if (!Number.isFinite(invoice)) {
      return { provider, invoice: 0, fee: 0, payout: amount, impossible: true }
    }

    return {
      provider,
      invoice,
      fee: invoice - amount,
      payout: amount,
      impossible: false,
    }
  })
}

export function formatMoney(value: number, currency: CurrencyCode): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}

/** Parses user input like "1 200,50" or "$1,200.50" into a number. */
export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, '').trim()
  if (!cleaned) return 0

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalised = cleaned

  if (lastComma > lastDot) {
    normalised = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    normalised = cleaned.replace(/,/g, '')
  }

  const value = Number(normalised)
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function ratesAreDefault(providers: FeeProvider[]): boolean {
  return providers.every((provider) => {
    const original = DEFAULT_PROVIDERS.find((item) => item.id === provider.id)
    if (!original) return false
    return original.percent === provider.percent && original.fixed === provider.fixed
  })
}
