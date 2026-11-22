import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Enter or paste a cron expression',
    body: 'Type a standard 5-part cron syntax (minute, hour, day-of-month, month, day-of-week) or choose from ready-made presets like "Every hour" or "Weekdays at 9am".',
  },
  {
    title: 'Inspect human-readable breakdown',
    body: 'Read the plain English explanation and explore each field in isolation to verify step intervals, ranges, and weekday mappings.',
  },
  {
    title: 'Verify upcoming scheduled runs',
    body: 'Review the next 10 calculated execution dates down to the second in your local timezone and UTC to ensure your background worker fires exactly when expected.',
  },
]

export const PRIVACY_INTRO =
  'Scheduling critical background jobs and lambda triggers requires complete accuracy without leaking schedule patterns or server configuration details.'

export const PRIVACY_POINTS = [
  'Cron parsing and schedule calculations run 100% inside your browser using pure JavaScript.',
  'No cron expressions, server schedules, or client timezones are ever transmitted to any remote server.',
  'Full offline functionality: test and verify cron schedules anytime, even without an internet connection.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is standard 5-field cron syntax?',
    answer:
      'Standard cron expressions consist of five space-separated fields: minute (0–59), hour (0–23), day of the month (1–31), month (1–12 or JAN–DEC), and day of the week (0–6 or SUN–SAT, with 0 and 7 representing Sunday).',
  },
  {
    question: 'How do step values (/) and ranges (-) work?',
    answer:
      'A hyphen represents an inclusive range (e.g., "1-5" for Monday through Friday). A slash specifies step increments within a range or wildcard (e.g., "*/15" in the minute field triggers every 15 minutes, while "10-30/5" triggers at minutes 10, 15, 20, 25, and 30).',
  },
  {
    question: 'What happens when both Day of Month and Day of Week are specified?',
    answer:
      'In standard POSIX cron implementations, when both the day-of-month and day-of-week fields are specified (not wildcarded with "*"), the job triggers when EITHER condition is met (an OR relationship). Our calculator strictly models this behavior.',
  },
  {
    question: 'Does this calculator support seconds (6-field cron)?',
    answer:
      'This tool focuses on standard 5-field POSIX/Linux cron syntax, which is universally used in crontab, GitHub Actions, AWS EventBridge, Kubernetes CronJobs, and Node-cron. Seconds fields are typically vendor-specific (like Quartz).',
  },
  {
    question: 'Why do my scheduled runs match my local time?',
    answer:
      'The execution timetable calculates dates relative to your browser’s current local clock and timezone. When deploying to cloud environments like AWS or Linux servers, remember that system clocks often default to UTC.',
  },
]
