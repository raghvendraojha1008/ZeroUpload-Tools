export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  rawHeader: string
  rawPayload: string
}

export interface JwtDecodeResult {
  token: DecodedJwt | null
  error: string | null
}

const SEGMENT_ERROR =
  'A JWT is three dot-separated parts — header.payload.signature. Paste the full token from your auth response.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** base64url -> UTF-8 text. Padding is optional and the alphabet swaps `-_` for `+/`. */
export function decodeBase64Url(segment: string): string {
  const normalised = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalised.padEnd(normalised.length + ((4 - (normalised.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function decodeJsonSegment(segment: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(decodeBase64Url(segment))
  if (!isRecord(parsed)) throw new Error('Segment is not a JSON object')
  return parsed
}

/** Decodes a JWS token. It never verifies the signature — that needs the key and a server. */
export function decodeJwt(raw: string): JwtDecodeResult {
  const token = raw.trim().replace(/^bearer\s+/i, '').replace(/\s+/g, '')
  if (!token) return { token: null, error: null }

  const parts = token.split('.')
  if (parts.length < 2) return { token: null, error: SEGMENT_ERROR }
  if (parts.length > 3) {
    return {
      token: null,
      error: `This value has ${parts.length} segments. A signed JWT has exactly three — an encrypted token (JWE) has five and cannot be read without the key.`,
    }
  }

  let header: Record<string, unknown>
  try {
    header = decodeJsonSegment(parts[0])
  } catch {
    return {
      token: null,
      error: 'The header is not valid base64url-encoded JSON. Check that the whole token was copied.',
    }
  }

  let payload: Record<string, unknown>
  try {
    payload = decodeJsonSegment(parts[1])
  } catch {
    return {
      token: null,
      error: 'The payload is not valid base64url-encoded JSON. The token may be truncated.',
    }
  }

  return {
    token: {
      header,
      payload,
      signature: parts[2] ?? '',
      rawHeader: pretty(header),
      rawPayload: pretty(payload),
    },
    error: null,
  }
}

export function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function formatTimestamp(seconds: number): string {
  return new Date(seconds * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  })
}

export interface ExpiryInfo {
  state: 'valid' | 'expired' | 'missing'
  label: string
  detail: string
}

/** Reads `exp` (seconds since epoch) and turns it into something a human can act on. */
export function expiryInfo(payload: Record<string, unknown>, now: number): ExpiryInfo {
  const exp = payload.exp
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return {
      state: 'missing',
      label: 'No exp',
      detail: 'This token carries no expiry claim. Treat it as long-lived and revoke it deliberately.',
    }
  }

  const delta = exp * 1000 - now
  if (delta <= 0) {
    return {
      state: 'expired',
      label: 'Expired',
      detail: `Expired ${formatDuration(-delta)} ago — servers reject it.`,
    }
  }

  return {
    state: 'valid',
    label: formatDuration(delta),
    detail: `Valid for another ${formatDuration(delta)}.`,
  }
}

export const CLAIM_LABELS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration time',
  nbf: 'Not before',
  iat: 'Issued at',
  jti: 'Token ID',
  scope: 'Scope',
  scp: 'Scopes',
  azp: 'Authorized party',
  typ: 'Token type',
  alg: 'Algorithm',
  kid: 'Key ID',
}

const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat', 'auth_time', 'updated_at'])

export interface ClaimRow {
  key: string
  label: string
  value: string
  note: string | null
}

/** Flattens the payload into readable rows, decoding the registered time claims. */
export function claimRows(payload: Record<string, unknown>, now: number): ClaimRow[] {
  return Object.entries(payload).map(([key, value]) => {
    const label = CLAIM_LABELS[key] ?? key

    if (TIME_CLAIMS.has(key) && typeof value === 'number' && Number.isFinite(value)) {
      const ms = value * 1000 - now
      const moment = ms >= 0 ? `in ${formatDuration(ms)}` : `${formatDuration(-ms)} ago`
      return { key, label, value: formatTimestamp(value), note: moment }
    }

    if (Array.isArray(value)) {
      return { key, label, value: value.map((item) => String(item)).join(', '), note: null }
    }

    if (isRecord(value)) {
      return { key, label, value: JSON.stringify(value), note: null }
    }

    return { key, label, value: value === null ? 'null' : String(value), note: null }
  })
}
