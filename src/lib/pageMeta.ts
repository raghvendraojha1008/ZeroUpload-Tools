/**
 * Single source of truth for per-route SEO copy.
 *
 * Both the React pages (`usePageMeta`) and the build-time prerenderer read
 * from here, so a crawler snapshot and the client-rendered head can never
 * drift apart.
 */
export interface PageMeta {
  /** Page-specific title, without the site suffix. */
  title: string
  description: string
  /** Route path, e.g. "/tools/jwt-decoder". */
  path: string
}

export const PAGE_META = {
  home: {
    title: 'Fast, free & 100% private developer utilities',
    description:
      'Free developer utilities that run entirely in your browser. Convert JSON to CSV, decode JWTs, clean spreadsheets and test regex without uploading a byte.',
    path: '/',
  },
  jsonToCsv: {
    title: 'JSON to CSV Converter — Free, Online & 100% Private',
    description:
      'Convert JSON to clean CSV or Excel spreadsheet online for free. Auto-flattens nested objects, live table preview, 100% client-side with zero cloud uploads.',
    path: '/tools/json-to-csv',
  },
  jwtDecoder: {
    title: 'JWT Decoder & Inspector — Free Online Token Viewer',
    description:
      'Decode and inspect JSON Web Tokens (JWT) online. View headers, payloads, claims and live expiry countdown timers. 100% private in-browser decoding.',
    path: '/tools/jwt-decoder',
  },
  csvColumnCleaner: {
    title: 'CSV Column Cleaner & Filter — Drop Columns Online',
    description:
      'Clean, filter and remove CSV columns online for free. Select columns to keep, trim whitespace, drop empty or duplicate rows, and export clean CSVs locally.',
    path: '/tools/csv-column-cleaner',
  },
  freelanceFeeCalculator: {
    title: 'Freelance Fee Calculator — Stripe, PayPal & Wise Comparison',
    description:
      'Compare payment processing fees for Stripe, PayPal and Wise. Calculate net profit and find the exact invoice amount needed to hit your desired payout.',
    path: '/tools/freelance-fee-calculator',
  },
  regexTester: {
    title: 'Online Regex Tester & Debugger — Instant Regex Matcher',
    description:
      'Test and debug regular expressions online with live color highlighting, capture groups breakdown, cheatsheet presets, and replace preview. 100% in-browser.',
    path: '/tools/regex-tester',
  },
  sqlToJsonCsv: {
    title: 'SQL to JSON & CSV Converter — Convert INSERT Statements Online',
    description:
      'Convert SQL INSERT statements and table dumps into JSON or clean CSV in your browser. Reads column names, handles NULLs and multi-row values, then copies or downloads instantly.',
    path: '/tools/sql-to-json-csv',
  },
  base64FileConverter: {
    title: 'File & Image to Base64 Converter — Encode or Decode Online',
    description:
      'Convert images, SVG, PDFs and text files to Base64 data URIs, or decode any Base64 string back to a file with a live preview. 100% in-browser, no uploads.',
    path: '/tools/base64-file-converter',
  },
  markdownTableGenerator: {
    title: 'Markdown Table Generator — Visual GFM Table Builder',
    description:
      'Create GitHub-flavored Markdown tables in a visual spreadsheet editor. Add rows and columns, set per-column alignment and copy clean, padded Markdown instantly.',
    path: '/tools/markdown-table-generator',
  },
  uuidGenerator: {
    title: 'UUID Generator — Bulk UUID v4 & v7 Online',
    description:
      'Generate up to 100 UUID v4 or timestamp-based v7 identifiers instantly. Toggle uppercase, hyphens and JSON output, then copy or download. Runs fully in your browser.',
    path: '/tools/uuid-generator',
  },
  urlParser: {
    title: 'URL Parser & Query String Inspector — Break Down Any URL',
    description:
      'Inspect any URL: protocol, host, port, path, fragment and every query parameter. Edit params inline and copy the reassembled encoded or decoded URL. 100% in-browser.',
    path: '/tools/url-parser',
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    description:
      'Learn how CleanDevTools protects your data with 100% client-side in-browser processing and zero cloud retention.',
    path: '/privacy',
  },
  termsOfService: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using CleanDevTools free client-side developer utilities.',
    path: '/terms',
  },
  about: {
    title: 'About Us',
    description:
      'Learn why we built CleanDevTools: private, clean, client-side, zero-upload web utilities for developers and creators.',
    path: '/about',
  },
} as const satisfies Record<string, PageMeta>
