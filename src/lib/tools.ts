import {
  Calculator,
  Code2,
  FileSpreadsheet,
  KeyRound,
  Table2,
  type LucideIcon,
} from 'lucide-react'

export type ToolCategory = 'Data' | 'Security' | 'Finance' | 'Text'
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

export const CATEGORIES: CategoryFilter[] = ['All', 'Data', 'Security', 'Finance', 'Text']

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
]

export function matchesTool(tool: Tool, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const haystack = [tool.name, tool.description, tool.category, ...tool.tags].join(' ').toLowerCase()
  return needle.split(/\s+/).every((token) => haystack.includes(token))
}
