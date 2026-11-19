export interface EncodedFile {
  name: string
  size: number
  mime: string
  base64: string
  dataUri: string
}

export type DecodedKind = 'image' | 'text' | 'binary'

export type DecodeResult =
  | {
      ok: true
      mime: string
      bytes: Uint8Array<ArrayBuffer>
      base64: string
      kind: DecodedKind
      text: string | null
      dataUri: string
    }
  | { ok: false; error: string }

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/bmp': 'bmp',
  'application/pdf': 'pdf',
  'application/json': 'json',
  'application/xml': 'xml',
  'application/zip': 'zip',
  'application/gzip': 'gz',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'text/html': 'html',
  'text/css': 'css',
  'application/javascript': 'js',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'video/mp4': 'mp4',
  'font/woff': 'woff',
  'font/woff2': 'woff2',
}

const TEXT_MIME = /^(text\/|application\/(json|xml|javascript|x-httpd-php|sql)|image\/svg\+xml)/i

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }

  return btoa(binary)
}

export function base64ToBytes(input: string): Uint8Array<ArrayBuffer> {
  const cleaned = input.replace(/\s+/g, '')
  if (!cleaned) throw new Error('The Base64 string is empty.')

  const normalized = cleaned.replace(/-/g, '+').replace(/_/g, '/')
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
    throw new Error('This does not look like Base64 — it contains characters outside the Base64 alphabet.')
  }

  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

export function extensionFor(mime: string): string {
  return EXTENSION_BY_MIME[mime.toLowerCase()] ?? 'bin'
}

/** Reads a picked file into raw Base64 plus a ready-to-paste data URI. */
export async function readFileAsBase64(file: File): Promise<EncodedFile> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const base64 = bytesToBase64(bytes)
  const mime = file.type || 'application/octet-stream'

  return {
    name: file.name,
    size: file.size,
    mime,
    base64,
    dataUri: `data:${mime};base64,${base64}`,
  }
}

function looksLikeText(bytes: Uint8Array): boolean {
  const sample = bytes.subarray(0, 4096)
  let printable = 0

  for (const byte of sample) {
    if (byte === 0) return false
    if (byte === 9 || byte === 10 || byte === 13) {
      printable += 1
      continue
    }
    if (byte >= 32 && byte < 127) printable += 1
    else if (byte >= 0xc0) printable += 1
  }

  return sample.length > 0 && printable / sample.length > 0.9
}

/**
 * Accepts a raw Base64 payload or a full data URI and works out what it holds,
 * so the preview can render an image, show text or offer a binary download.
 */
export function decodeBase64Input(input: string): DecodeResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: 'Paste a Base64 string or a data URI to decode it.' }

  let payload = trimmed
  let mime = ''

  if (/^data:/i.test(trimmed)) {
    const comma = trimmed.indexOf(',')
    if (comma === -1) {
      return { ok: false, error: 'This data URI has no comma separating its metadata from its payload.' }
    }

    const meta = trimmed.slice(5, comma)
    if (!/;base64$/i.test(meta)) {
      return {
        ok: false,
        error: 'This data URI is percent-encoded, not Base64. Only base64 data URIs can be decoded here.',
      }
    }

    mime = meta.replace(/;base64$/i, '')
    payload = trimmed.slice(comma + 1)
  }

  try {
    const bytes = base64ToBytes(payload)
    const base64 = bytesToBase64(bytes)
    const resolvedMime = mime || 'application/octet-stream'
    const isText = TEXT_MIME.test(resolvedMime) || (!mime && looksLikeText(bytes))

    const kind: DecodedKind = resolvedMime.startsWith('image/')
      ? 'image'
      : isText
        ? 'text'
        : 'binary'

    return {
      ok: true,
      mime: mime || (isText ? 'text/plain' : resolvedMime),
      bytes,
      base64,
      kind,
      text: kind === 'text' ? new TextDecoder('utf-8').decode(bytes) : null,
      dataUri: `data:${mime || (isText ? 'text/plain' : resolvedMime)};base64,${base64}`,
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'That Base64 string could not be decoded.',
    }
  }
}
