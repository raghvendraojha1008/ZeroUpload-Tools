import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Add the CSV',
    body: 'Drop a .csv export or paste raw rows. The delimiter is detected from the first line, and quoted values containing commas stay intact.',
  },
  {
    title: 'Choose the columns and rules',
    body: 'Untick any column you do not need, then trim whitespace, drop rows that are empty across the kept columns, and optionally collapse duplicates.',
  },
  {
    title: 'Copy or download',
    body: 'Preview the cleaned table page by page, then copy it or download a UTF-8 CSV that opens cleanly in Excel and Sheets.',
  },
]

export const PRIVACY_INTRO =
  'Customer exports and billing rows are exactly the files most converters upload. This one parses them with a local tokeniser, so the sheet never crosses the network.'

export const PRIVACY_POINTS = [
  'Files are read with the File API; parsing, cleaning and export all happen in memory.',
  'No row is stored, cached or sent to an analytics service — closing the tab ends the session.',
  'The tool keeps working offline once loaded, because nothing depends on a server.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Does it handle values that contain commas or quotes?',
    answer:
      'Yes. The parser follows RFC 4180: quoted fields may contain the delimiter and line breaks, and a doubled quote ("") inside a quoted field becomes a single quote. On export those characters are escaped again, so a round trip is lossless.',
  },
  {
    question: 'What exactly does “remove duplicate rows” compare?',
    answer:
      'Only the columns you keep, after trimming if that option is on. The first occurrence is kept and later copies are dropped, so column order and whitespace decide what counts as a duplicate.',
  },
  {
    question: 'Why does my file need a different delimiter?',
    answer:
      'Excel in many European locales writes semicolons because the comma is the decimal separator. The tool detects the input delimiter automatically, and you can force the output delimiter to whichever your spreadsheet expects.',
  },
  {
    question: 'Are rows with missing cells deleted?',
    answer:
      'Only if every kept cell is empty. A row that has a name but no email is kept, because a partial record is usually still a record — untick "Drop empty rows" if you want raw output.',
  },
  {
    question: 'Does cleaning change the original file?',
    answer:
      'No. The uploaded file is never modified; the export is a new file built from the rules you chose, and the original stays exactly as it was on disk.',
  },
]
