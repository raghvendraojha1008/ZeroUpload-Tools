import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Pick a version',
    body: 'UUID v4 is fully random and ideal for public identifiers. UUID v7 starts with a millisecond timestamp, so rows inserted over time stay close together in a B-tree index.',
  },
  {
    title: 'Choose the quantity and format',
    body: 'Generate between 1 and 100 at a time, then toggle uppercase, hyphens and the output shape — a newline-separated list or a JSON array for fixtures and seed files.',
  },
  {
    title: 'Generate, copy or download',
    body: '“Generate Fresh” draws new values from the browser’s CSPRNG. Copy the whole batch, or download a .txt / .json file named after the version.',
  },
]

export const PRIVACY_INTRO =
  'Identifiers are only unguessable if the randomness is real. Sending a generator request to a server means trusting that server never logs the IDs it handed out — and that its randomness is sound.'

export const PRIVACY_POINTS = [
  'Values come from crypto.getRandomValues / crypto.randomUUID, the browser platform CSPRNG.',
  'No ID is ever transmitted, stored or seeded from a predictable Math.random() sequence.',
  'The whole page works offline once loaded, so generation keeps working without a network.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is the difference between UUID v4 and v7?',
    answer:
      'A v4 UUID is 122 random bits plus a version and variant marker: impossible to predict, but scattered across the key space. A v7 UUID starts with a 48-bit Unix millisecond timestamp and fills the rest with randomness, so new IDs sort after older ones. That ordering makes v7 much friendlier to database indexes and time-ordered logs, while staying unguessable.',
  },
  {
    question: 'Are these UUIDs cryptographically random?',
    answer:
      'Yes. v4 uses crypto.randomUUID() where available, falling back to crypto.getRandomValues(); v7 uses crypto.getRandomValues() for every random bit. Both come from the operating system CSPRNG, not Math.random().',
  },
  {
    question: 'Can two generated UUIDs collide?',
    answer:
      'A v4 UUID has 122 random bits, so you would need to generate about 2.7 × 10¹⁸ values before a 50% chance of any collision — far beyond practical use. v7 keeps 74 random bits (plus the timestamp), which is still ample for application IDs; a v7 collision within the same millisecond is the only realistic edge case, and it is vanishingly rare.',
  },
  {
    question: 'Should I use v7 as a database primary key?',
    answer:
      'For most new tables, yes. Because v7 is time-ordered, inserts land at the end of the index rather than scattering across it the way random v4 values do, which reduces page splits and cache misses. If an ID must reveal nothing about creation time — for example a public share link — v4 is the safer choice.',
  },
  {
    question: 'Why do my UUIDs look different without hyphens?',
    answer:
      'The hyphens are only formatting: the 32 hex digits are the identifier. RFC 9562 uses 8-4-4-4-12 grouping for readability, but many APIs, URLs and database columns accept the unhyphenated 32-character form. The toggle lets you match whichever format your system expects.',
  },
]
