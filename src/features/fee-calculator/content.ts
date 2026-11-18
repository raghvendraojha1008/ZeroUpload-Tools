import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Pick what you know',
    body: 'Either enter the invoice you plan to send and see what lands in your account, or enter the payout you need and see the invoice that produces it.',
  },
  {
    title: 'Check the fee rates',
    body: 'Stripe, PayPal and Wise defaults are pre-filled. Every percentage and fixed fee is editable, so you can match the rate on your own account.',
  },
  {
    title: 'Invoice with confidence',
    body: 'Compare the fee and payout per provider, then copy the breakdown into your invoice notes or an email to the client.',
  },
]

export const PRIVACY_INTRO =
  'Freelance rates and client amounts are commercially sensitive. This calculator is plain arithmetic on your own numbers, run locally — which is also why it works with the network disconnected.'

export const PRIVACY_POINTS = [
  'No amount, rate or provider choice is transmitted, logged or stored between sessions.',
  'There is no account, no saved invoice history and no server-side copy of your rates.',
  'Everything is computed from the values on screen, so results update as you type without a round-trip.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How is the invoice amount calculated from my desired payout?',
    answer:
      'The fee is a percentage plus a fixed amount, so the invoice must cover both: invoice = (payout + fixed fee) / (1 − percentage). With a 2.9% + 0.30 fee and a 1,000 payout, the invoice is (1000 + 0.30) / 0.971 ≈ 1,030.17.',
  },
  {
    question: 'Why can the fee exceed the amount on small invoices?',
    answer:
      'The fixed component dominates tiny transactions: at 2.9% + 0.30, a 1.00 charge is almost entirely fee. That is why many freelancers set a minimum invoice size or absorb small payments another way.',
  },
  {
    question: 'Are these the real Stripe, PayPal and Wise rates?',
    answer:
      'They are common published card rates for a domestic transaction, used as editable defaults. Real pricing depends on your country, account type, card origin, currency conversion and negotiated volume — always confirm on the provider’s pricing page and adjust the fields here.',
  },
  {
    question: 'Should I add the fee on top of my rate, or absorb it?',
    answer:
      'Either is legitimate, but be explicit. Absorbing the fee means your quoted rate is what the client pays and the fee comes out of your side; adding it means the client pays the fee. The “desired payout” mode shows the invoice needed for the second approach.',
  },
  {
    question: 'Does this cover tax, VAT or currency conversion?',
    answer:
      'No. It models processing fees only. Sales tax, VAT, withholding tax and FX spreads are separate line items, and a currency conversion usually adds a spread on top of the percentage shown here. This is an estimate, not financial advice.',
  },
]
