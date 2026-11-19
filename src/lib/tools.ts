import {
  Binary,
  Calculator,
  Code2,
  Database,
  FileSpreadsheet,
  Fingerprint,
  KeyRound,
  Link2,
  Table2,
  TableProperties,
  type LucideIcon,
} from 'lucide-react'

export type ToolCategory = 'Data' | 'Security' | 'Finance' | 'Text' | 'Dev'
export type CategoryFilter = 'All' | ToolCategory

export interface Tool {
  id: string
  name: string
  description: string
  href: string
  category: ToolCategory
  icon: LucideIcon
  tags: string[]
}

export const CATEGORIES: CategoryFilter[] = ['All', 'Data', 'Security', 'Finance', 'Text', 'Dev']

export const TOOLS: Tool[] = [
  {
    id: 'json-to-csv',
    name: 'JSON to CSV Converter',
    description:
      'Flatten nested JSON into clean, Excel-ready CSV with a live preview and full delimiter control.',
    href: '/tools/json-to-csv',
    category: 'Data',
    icon: Table2,
    tags: ['json', 'csv', 'excel', 'flatten', 'nested', 'spreadsheet', 'convert'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description:
      'Inspect decoded JWT headers, payloads and expiry countdowns without sending the token anywhere.',
    href: '/tools/jwt-decoder',
    category: 'Security',
    icon: KeyRound,
    tags: ['jwt', 'token', 'base64', 'auth', 'decode'],
  },
  {
    id: 'csv-column-cleaner',
    name: 'CSV Column Cleaner',
    description:
      'Pick the columns you need, drop empty or duplicate rows, then export a sanitized spreadsheet.',
    href: '/tools/csv-column-cleaner',
    category: 'Data',
    icon: FileSpreadsheet,
    tags: ['csv', 'clean', 'columns', 'dedupe', 'trim'],
  },
  {
    id: 'freelance-fee-calculator',
    name: 'Freelance Fee Calculator',
    description:
      'Compare Stripe, PayPal and Wise processing fees and work out exactly what to invoice a client.',
    href: '/tools/freelance-fee-calculator',
    category: 'Finance',
    icon: Calculator,
    tags: ['fees', 'stripe', 'paypal', 'wise', 'invoicing', 'net'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description:
      'Test patterns with live highlighting, capture groups, match indexes and a one-click cheat sheet.',
    href: '/tools/regex-tester',
    category: 'Text',
    icon: Code2,
    tags: ['regex', 'pattern', 'match', 'text', 'developer'],
  },
  {
    id: 'sql-to-json-csv',
    name: 'SQL to JSON / CSV',
    description:
      'Turn INSERT statements or a whole table dump into a JSON array or clean CSV, parsed in your browser.',
    href: '/tools/sql-to-json-csv',
    category: 'Data',
    icon: Database,
    tags: ['sql', 'insert', 'dump', 'mysql', 'postgres', 'json', 'csv', 'database', 'convert'],
  },
  {
    id: 'base64-file-converter',
    name: 'Base64 File Converter',
    description:
      'Encode an image, SVG, PDF or text file into Base64 and a data URI — or decode one back to a file.',
    href: '/tools/base64-file-converter',
    category: 'Data',
    icon: Binary,
    tags: ['base64', 'data uri', 'encode', 'decode', 'image', 'svg', 'pdf', 'file'],
  },
  {
    id: 'markdown-table-generator',
    name: 'Markdown Table Generator',
    description:
      'Build GitHub-flavored Markdown tables in a visual grid with per-column alignment and instant output.',
    href: '/tools/markdown-table-generator',
    category: 'Text',
    icon: TableProperties,
    tags: ['markdown', 'md', 'table', 'readme', 'gfm', 'github', 'docs', 'generator'],
  },
  {
    id: 'uuid-generator',
    name: 'UUID / GUID Generator',
    description:
      'Generate up to 100 random v4 or time-ordered v7 identifiers with format toggles and JSON output.',
    href: '/tools/uuid-generator',
    category: 'Dev',
    icon: Fingerprint,
    tags: ['uuid', 'guid', 'v4', 'v7', 'id', 'random', 'generator', 'bulk'],
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description:
      'Deconstruct any URL into host, path and query parameters, edit them inline and copy the rebuilt link.',
    href: '/tools/url-parser',
    category: 'Dev',
    icon: Link2,
    tags: ['url', 'query string', 'uri', 'parameters', 'utm', 'oauth', 'redirect', 'parse'],
  },
]

export function matchesTool(tool: Tool, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const haystack = [tool.name, tool.description, tool.category, ...tool.tags].join(' ').toLowerCase()
  return needle.split(/\s+/).every((token) => haystack.includes(token))
}
