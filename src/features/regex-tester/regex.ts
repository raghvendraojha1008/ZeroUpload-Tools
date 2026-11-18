export const MAX_MATCHES = 2000

export interface FlagOption {
  flag: string
  description: string
}

/** Scanning is always global, so `g` is not offered — only the modifiers that change meaning. */
export const FLAG_OPTIONS: FlagOption[] = [
  { flag: 'i', description: 'Case-insensitive matching' },
  { flag: 'm', description: '^ and $ match at line breaks' },
  { flag: 's', description: '. also matches line breaks' },
  { flag: 'u', description: 'Unicode mode for code point escapes' },
]

export interface RegexMatch {
  index: number
  value: string
  groups: Array<string | null>
  named: Record<string, string>
}

export interface RegexResult {
  matches: RegexMatch[]
  error: string | null
  truncated: boolean
  groupCount: number
}

export interface Segment {
  text: string
  matchIndex: number | null
}

export function compileRegex(
  pattern: string,
  flags: string,
): { regex: RegExp | null; error: string | null } {
  if (!pattern) return { regex: null, error: null }
  try {
    return { regex: new RegExp(pattern, flags), error: null }
  } catch (error) {
    return {
      regex: null,
      error: error instanceof Error ? error.message : 'The pattern could not be compiled.',
    }
  }
}

/** Counts capturing groups, including named ones, while ignoring escapes and classes. */
export function countGroups(pattern: string): number {
  let count = 0
  let escaped = false
  let inClass = false

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index]

    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (inClass) {
      if (char === ']') inClass = false
      continue
    }
    if (char === '[') {
      inClass = true
      continue
    }
    if (char !== '(') continue

    if (pattern[index + 1] !== '?') {
      count += 1
      continue
    }

    // (?<name>…) is capturing; (?<=…) and (?<!…) are lookbehind assertions.
    const isNamed = pattern[index + 2] === '<' && pattern[index + 3] !== '=' && pattern[index + 3] !== '!'
    if (isNamed) count += 1
  }

  return count
}

export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  const { regex, error } = compileRegex(pattern, flags)
  const groupCount = countGroups(pattern)
  if (!regex) return { matches: [], error, truncated: false, groupCount }
  if (!text) return { matches: [], error: null, truncated: false, groupCount }

  const matches: RegexMatch[] = []
  let truncated = false
  regex.lastIndex = 0
  let current = regex.exec(text)

  while (current) {
    matches.push({
      index: current.index,
      value: current[0],
      groups: current.slice(1),
      named: current.groups ? { ...current.groups } : {},
    })

    if (matches.length >= MAX_MATCHES) {
      truncated = true
      break
    }

    // A zero-length match would loop forever without nudging lastIndex forward.
    if (current[0] === '') regex.lastIndex += 1
    current = regex.exec(text)
  }

  return { matches, error: null, truncated, groupCount }
}

export function buildSegments(text: string, matches: RegexMatch[]): Segment[] {
  const segments: Segment[] = []
  let cursor = 0

  matches.forEach((match, index) => {
    if (match.index < cursor) return
    if (match.index > cursor) {
      segments.push({ text: text.slice(cursor, match.index), matchIndex: null })
    }
    if (match.value.length > 0) {
      segments.push({ text: match.value, matchIndex: index })
    }
    cursor = match.index + match.value.length
  })

  if (cursor < text.length) segments.push({ text: text.slice(cursor), matchIndex: null })
  return segments
}

export function replaceMatches(
  pattern: string,
  flags: string,
  text: string,
  replacement: string,
): { output: string; error: string | null } {
  const { regex, error } = compileRegex(pattern, flags)
  if (!regex || error) return { output: '', error }
  if (!text) return { output: '', error: null }

  try {
    regex.lastIndex = 0
    return { output: text.replace(regex, replacement), error: null }
  } catch (caught) {
    return {
      output: '',
      error: caught instanceof Error ? caught.message : 'The replacement could not be applied.',
    }
  }
}

export function flagString(flags: Set<string>): string {
  return FLAG_OPTIONS.filter((option) => flags.has(option.flag))
    .map((option) => option.flag)
    .join('')
}
