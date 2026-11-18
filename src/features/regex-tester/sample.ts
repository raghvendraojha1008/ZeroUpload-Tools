export const SAMPLE_TEXT = `2026-11-17 09:14:02 INFO  request_id=4f9c2a user=ada@analytical.dev path=/api/tools/json-to-csv status=200 ms=38
2026-11-17 09:14:19 WARN  request_id=7b1d8e user=grace@compiler.dev path=/api/tools/jwt-decoder status=401 ms=12
2026-11-17 09:15:44 ERROR request_id=c3a90f user=alan@bletchley.dev path=/api/export status=500 ms=1204
2026-11-17 09:16:01 INFO  request_id=8d2e61 user=ada@analytical.dev path=/api/tools/regex-tester status=200 ms=21`

export interface RegexPreset {
  name: string
  pattern: string
  flags: string
  text: string
  description: string
}

export const PRESETS: RegexPreset[] = [
  {
    name: 'Email addresses',
    pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.]+',
    flags: '',
    text: SAMPLE_TEXT,
    description: 'Character classes for the local part and domain.',
  },
  {
    name: 'ISO dates',
    pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
    flags: '',
    text: SAMPLE_TEXT,
    description: 'Three capture groups: year, month and day.',
  },
  {
    name: 'Log key=value',
    pattern: '(?<key>\\w+)=(?<value>[^\\s]+)',
    flags: '',
    text: SAMPLE_TEXT,
    description: 'Named capture groups, shown by name in the match list.',
  },
  {
    name: 'Hex colours',
    pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b',
    flags: '',
    text: 'Brand palette: #0f172a, #6366f1, #fff and #10b981. Not colours: #12, #1234567.',
    description: 'A non-capturing group and a word boundary.',
  },
  {
    name: 'URLs',
    pattern: 'https?://[^\\s"\']+',
    flags: 'i',
    text: 'Docs at https://example.com/docs?page=2 and HTTPS://EXAMPLE.ORG/api. Local: http://localhost:5173/',
    description: 'Case-insensitive with a negated character class.',
  },
]
