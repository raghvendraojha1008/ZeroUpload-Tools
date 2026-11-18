import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Write the pattern',
    body: 'Type the expression without the surrounding slashes and toggle the modifiers you need. The pattern is compiled with the browser’s own RegExp engine, so behaviour matches your JavaScript runtime.',
  },
  {
    title: 'Paste the text to test',
    body: 'Every match is highlighted inline while you type, and the match list shows the offset, the matched substring and each capture group.',
  },
  {
    title: 'Check the replacement',
    body: 'Add a replacement string using $1, $2 or $<name> to preview the rewritten text before you paste the pattern into your code.',
  },
]

export const PRIVACY_INTRO =
  'Test strings are frequently real log lines, tokens or customer data. Running the pattern locally means the sample never has to be pasted into a third-party service just to see whether it matches.'

export const PRIVACY_POINTS = [
  'Compilation and scanning use the browser’s RegExp engine in this tab — no request is made.',
  'The pattern, test text and replacement are held in React state only and never persisted.',
  'The page works offline once loaded, which is only possible because nothing is sent to a server.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Which regex flavour does this use?',
    answer:
      'JavaScript (ECMAScript) regular expressions, because the page runs them with the browser’s built-in RegExp constructor. Lookbehind, named groups and Unicode property escapes work in current browsers; PCRE-only syntax such as \\A or (?#comment) does not.',
  },
  {
    question: 'Why are matches always global here?',
    answer:
      'A tester is more useful when it finds everything, so the scanner loops over the text with the global flag internally. Only the modifiers that change what a pattern means — i, m, s and u — are offered as toggles.',
  },
  {
    question: 'Can a pattern freeze the browser?',
    answer:
      'Pathological backtracking can be slow, so the scanner stops after 2,000 matches and does not crawl the text in the background. Even so, a deliberately catastrophic pattern on a long string can be slow — keep the escape hatch of clearing the pattern in mind.',
  },
  {
    question: 'What do the capture groups in the list mean?',
    answer:
      'Each numbered entry is a parenthesised group in your pattern, and named groups are shown with their <name>. Non-capturing groups (?:…), lookaheads and lookbehinds do not produce entries, which is why the count can be lower than the number of parentheses.',
  },
  {
    question: 'How does the replacement preview work?',
    answer:
      'It calls String.replace with your pattern and replacement, so $1 and $<name> references behave exactly as they will in code. Special replacement patterns like $& and $$ follow the standard JavaScript rules as well.',
  },
]
