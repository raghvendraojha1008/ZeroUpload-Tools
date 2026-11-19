import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Fill the grid',
    body: 'Click any header or cell and type. Add or remove columns and rows with the buttons under the grid — the Markdown on the right updates on every keystroke.',
  },
  {
    title: 'Set a column alignment',
    body: 'Each column has left, centre and right buttons. They write the :---, :---: and ---: markers into the delimiter row, which GitHub, GitLab and most static-site generators honour.',
  },
  {
    title: 'Copy into your README',
    body: 'Copy the Markdown and paste it into a README, issue, comment or docs page. Pipes inside cells are escaped and line breaks become <br>, so the table survives the round trip.',
  },
]

export const PRIVACY_INTRO =
  'Table cells often hold roadmap items, customer names or internal metrics that are not public yet. A browser-side generator means the draft never sits on someone else’s server while you format it.'

export const PRIVACY_POINTS = [
  'The grid and the generated Markdown are plain React state — no autosave, no request.',
  'Nothing is shared through a URL, so a table cannot leak through link previews or history.',
  'Copy and download use the Clipboard API and a local Blob; both stay on the device.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What syntax does this generate?',
    answer:
      'GitHub-Flavored Markdown (GFM): a header row, a delimiter row with optional alignment colons, then one row per record. The same syntax renders on GitHub, GitLab, Bitbucket, Reddit, Notion imports and static-site generators such as Docusaurus, Hugo and MkDocs.',
  },
  {
    question: 'How are pipes and line breaks handled?',
    answer:
      'A | inside a cell is escaped as \\| so it does not split the row, and a newline is written as <br> because Markdown tables cannot span lines. Backslashes are escaped too, which keeps Windows paths looking correct.',
  },
  {
    question: 'Do the alignment markers really work everywhere?',
    answer:
      'GFM defines :--- (left), :---: (centre) and ---: (right). GitHub and most renderers apply them as column styles. A few terminal renderers ignore alignment and simply left-align everything, but the table still parses correctly.',
  },
  {
    question: 'Why is the output padded with spaces?',
    answer:
      'Padding lines the pipes up in a monospace editor and keeps the raw Markdown readable in a diff. Markdown renderers collapse the extra whitespace, so the rendered table is identical either way. Clear a column to see the minimum width take over.',
  },
  {
    question: 'Is there a size limit?',
    answer:
      'There is no enforced limit, but a Markdown table is meant to be scannable — past roughly 10 columns and 50 rows, a CSV or a docs list is usually easier to read. Everything is generated in memory, so very large grids only cost your own browser performance.',
  },
]
