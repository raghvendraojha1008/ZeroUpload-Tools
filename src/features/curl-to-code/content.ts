import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Paste any cURL command',
    body: 'Copy a cURL request directly from Chrome DevTools ("Copy as cURL"), Postman, documentation, or your terminal, and paste it into the editor.',
  },
  {
    title: 'Choose target programming language',
    body: 'Select your preferred client stack: JavaScript fetch(), Axios, Python requests, Python httpx, or Go net/http.',
  },
  {
    title: 'Copy or export production code',
    body: 'Copy clean, idiomatic code with headers, auth tokens, URL query params, and JSON payloads properly formatted.',
  },
]

export const PRIVACY_INTRO =
  'Network requests copied from developer tools frequently contain live API keys, session cookies, and sensitive authorization bearer tokens that must never be transmitted to third-party endpoints.'

export const PRIVACY_POINTS = [
  'cURL parsing and code synthesis happen 100% in-browser with zero remote API calls.',
  'Your API keys, authorization tokens, cookies, and payloads remain strictly in local memory.',
  'Operates offline without an internet connection.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I copy a cURL command from Chrome or Firefox?',
    answer:
      'Open Developer Tools (F12 or Cmd+Option+I), navigate to the "Network" tab, trigger an action in the browser, right-click any network request, select "Copy", and choose "Copy as cURL" (bash or cmd).',
  },
  {
    question: 'How are multi-line cURLs with backslashes handled?',
    answer:
      'The parser automatically strips backslash line breaks ("\\") and normalizes whitespace, so multi-line commands copied directly from Unix terminals parse flawlessly.',
  },
  {
    question: 'Does this handle Basic Auth and Bearer tokens?',
    answer:
      'Yes. The parser recognizes standard -H "Authorization: Bearer ..." headers as well as the -u (or --user) shorthand flag, properly encoding username:password combinations into Base64 Basic credentials.',
  },
  {
    question: 'Does it parse JSON bodies and query parameters?',
    answer:
      'Yes. When you supply -d, --data, or --data-raw payloads containing JSON, it formats them into native JSON objects for JavaScript and Python dictionaries.',
  },
  {
    question: 'Which programming languages are supported?',
    answer:
      'The converter currently supports modern JavaScript (native fetch API & Axios), Python (requests & httpx), and Go (net/http), with more languages regularly added.',
  },
]
