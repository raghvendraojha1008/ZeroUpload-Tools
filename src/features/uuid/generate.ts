export type UuidVersion = 'v4' | 'v7'

function hyphenate(bytes: Uint8Array): string {
  const hex: string[] = []
  for (const byte of bytes) hex.push(byte.toString(16).padStart(2, '0'))

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

/** UUID v4: 122 bits from the platform CSPRNG. */
export function uuidV4(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return hyphenate(bytes)
}

let lastTimestamp = -1
let sequence = 0

/**
 * UUID v7: a 48-bit Unix millisecond timestamp, a 12-bit monotonic counter and
 * random bits. The counter keeps a batch generated inside the same millisecond
 * strictly sortable, which is the whole point of using v7 for indexed keys.
 */
export function uuidV7(): string {
  let timestamp = Date.now()

  if (timestamp > lastTimestamp) {
    lastTimestamp = timestamp
    const seed = new Uint16Array(1)
    crypto.getRandomValues(seed)
    sequence = seed[0] & 0x0fff
  } else {
    timestamp = lastTimestamp
    sequence = (sequence + 1) & 0x0fff

    // 4,096 IDs in one millisecond: borrow the next millisecond rather than repeat.
    if (sequence === 0) {
      lastTimestamp += 1
      timestamp = lastTimestamp
    }
  }

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  const millis = BigInt(timestamp)
  for (let i = 0; i < 6; i += 1) {
    bytes[i] = Number((millis >> BigInt(8 * (5 - i))) & 0xffn)
  }

  bytes[6] = 0x70 | (sequence >> 8)
  bytes[7] = sequence & 0xff
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  return hyphenate(bytes)
}

export function generateUuid(version: UuidVersion): string {
  return version === 'v7' ? uuidV7() : uuidV4()
}

export function generateBatch(version: UuidVersion, quantity: number): string[] {
  const count = Math.min(Math.max(Math.round(quantity), 1), 100)
  return Array.from({ length: count }, () => generateUuid(version))
}

export function formatUuid(
  uuid: string,
  options: { uppercase: boolean; hyphens: boolean },
): string {
  const value = options.hyphens ? uuid : uuid.replace(/-/g, '')
  return options.uppercase ? value.toUpperCase() : value
}
