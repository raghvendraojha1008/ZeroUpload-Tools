import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Monitor live Unix epoch time',
    body: 'View the current live-updating Unix timestamp in both seconds and milliseconds, with pause and instant one-click copying.',
  },
  {
    title: 'Convert epoch timestamp to human date',
    body: 'Paste any Unix timestamp (seconds or milliseconds) to view the exact local date/time, UTC/GMT string, ISO 8601 representation, and relative offset.',
  },
  {
    title: 'Convert human date to Unix epoch',
    body: 'Select a custom date and time in either your local timezone or UTC to compute the corresponding seconds and millisecond epoch timestamps.',
  },
]

export const PRIVACY_INTRO =
  'Timestamp debugging routinely involves log timestamps, user session expiries, and database audit trails that must remain confidential.'

export const PRIVACY_POINTS = [
  'All epoch and date calculations run entirely inside your browser using the standard JavaScript Date API.',
  'Zero data transmission: timestamps, dates, and client timezones never leave your device.',
  'Works fully offline and in private browsing windows without external dependencies.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Unix Epoch time?',
    answer:
      'Unix epoch time is the total number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970 (not counting leap seconds). It provides an unambiguous, timezone-agnostic timestamp used across operating systems, databases, and network protocols.',
  },
  {
    question: 'How do I know if my timestamp is in seconds or milliseconds?',
    answer:
      'Timestamps with 10 digits (e.g., 1700000000) are in seconds, commonly used in Unix/Linux systems and Python. Timestamps with 13 digits (e.g., 1700000000000) are in milliseconds, standard in JavaScript and Java. This tool automatically detects both formats.',
  },
  {
    question: 'What will happen with the Year 2038 problem (Y2038)?',
    answer:
      'The Year 2038 problem affects older 32-bit signed systems storing Unix seconds, which will overflow on January 19, 2038 at 03:14:07 UTC. Modern 64-bit systems and modern JavaScript runtimes use 64-bit integers and floating points, which are safe for hundreds of billions of years.',
  },
  {
    question: 'How do timezones affect Unix timestamps?',
    answer:
      'A Unix timestamp is always UTC. The moment an event occurs, its Unix timestamp is identical whether measured in Tokyo, London, or San Francisco. Only the human-readable display string changes according to your local timezone offset.',
  },
  {
    question: 'What is ISO 8601 format?',
    answer:
      'ISO 8601 is an international standard for date and time representation (e.g., YYYY-MM-DDTHH:mm:ss.sssZ). The trailing "Z" denotes UTC (Zulu time), making it the most reliable format for API communication.',
  },
]
