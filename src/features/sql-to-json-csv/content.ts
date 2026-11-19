import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Paste the INSERT statements',
    body: 'Drop a .sql dump or paste INSERT INTO … VALUES (…) lines. Multi-row value lists, quoted identifiers and CREATE TABLE column definitions are all read locally.',
  },
  {
    title: 'Pick the table',
    body: 'A dump with several tables is split per table, so you can switch between them. The stat strip shows how many statements, columns and rows were parsed.',
  },
  {
    title: 'Switch to JSON or CSV',
    body: 'Toggle the output format, check that NULLs and quoted strings look right, then copy the result or download a .json / .csv file.',
  },
]

export const PRIVACY_INTRO =
  'A SQL dump is usually a copy of a production database — customer records, password hashes, internal IDs and billing data. Uploading that file to a random converter means handing a stranger the whole table.'

export const PRIVACY_POINTS = [
  'The dump is tokenised by JavaScript in this tab; no statement ever reaches a server.',
  'Nothing is written to localStorage, a cache or an analytics event — closing the tab clears it.',
  'Because parsing is local, the tool keeps working offline, which a server-side converter cannot do.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Which SQL dialects are supported?',
    answer:
      'The parser is deliberately tolerant of INSERT syntax: MySQL backticks, PostgreSQL double quotes and MSSQL brackets around identifiers, INSERT OR REPLACE / INSERT IGNORE prefixes, doubled quotes, backslash escapes and multi-row VALUES lists all work. It does not execute the SQL or check schema constraints — it only reads the value tuples.',
  },
  {
    question: 'Can it convert a whole mysqldump or pg_dump file?',
    answer:
      'Yes, as long as the rows are INSERT INTO statements. CREATE TABLE blocks are scanned too, so a dump that omits the column list still produces named JSON keys instead of column_1, column_2. Statements that stream data through COPY … FROM stdin are not supported.',
  },
  {
    question: 'How are NULL, numbers and booleans handled?',
    answer:
      'NULL becomes a real JSON null, unquoted numeric literals become numbers, and TRUE / FALSE become booleans. Anything the parser cannot evaluate — DEFAULT, NOW(), hex literals — is kept as text so nothing is silently invented. In CSV, null is written as an empty field.',
  },
  {
    question: 'Why do my columns show up as column_1, column_2?',
    answer:
      'That happens when the INSERT has no column list and the paste does not include a CREATE TABLE for the table. Add the column list, or paste the table definition above the INSERT statements, and the real names are picked up automatically.',
  },
  {
    question: 'Is there a row limit?',
    answer:
      'Each table is capped at 5,000 rows so the browser stays responsive, and the output panel tells you when the cap was reached. Split larger dumps into several statements if you need the remaining rows.',
  },
]
