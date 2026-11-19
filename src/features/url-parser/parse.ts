export interface UrlParam {
  key: string
  value: string
}

export type UrlAnalysis =
  | {
      ok: true
      url: URL
      params: UrlParam[]
      /** True when the tool had to assume an https:// prefix. */
      addedScheme: boolean
    }
  | { ok: false; error: string }

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i

/** Accepts a full URL, or a bare host/path that is treated as https://. */
export function analyseUrl(input: string): UrlAnalysis {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Paste a URL to break it into protocol, host, path and query parameters.' }
  }

  const hasScheme = SCHEME.test(trimmed)
  const candidate = hasScheme ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    return {
      ok: true,
      url,
      params: [...url.searchParams.entries()].map(([key, value]) => ({ key, value })),
      addedScheme: !hasScheme,
    }
  } catch {
    return {
      ok: false,
      error: 'That is not a valid URL. Check for a stray space or an unclosed query value.',
    }
  }
}

/** Rebuilds the URL from the edited parameter rows, re-encoding as it goes. */
export function buildUrl(base: URL, params: UrlParam[]): string {
  const next = new URL(base.toString())
  next.search = ''

  for (const param of params) {
    if (param.key.trim()) next.searchParams.append(param.key, param.value)
  }

  return next.toString()
}

/** Human-readable variant; falls back to the encoded string if decoding fails. */
export function decodeUrl(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function countPathSegments(pathname: string): number {
  return pathname.split('/').filter(Boolean).length
}
