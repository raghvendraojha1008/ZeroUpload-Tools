// Pure JS MD5 implementation for legacy checksum validation
function md5(buffer: ArrayBuffer | string): string {
  let bytes: Uint8Array
  if (typeof buffer === 'string') {
    bytes = new TextEncoder().encode(buffer)
  } else {
    bytes = new Uint8Array(buffer)
  }

  // Pre-processing
  const originalLength = bytes.length
  const withPaddingLength = (((originalLength + 8) >>> 6) + 1) << 6
  const padded = new Uint8Array(withPaddingLength)
  padded.set(bytes)
  padded[originalLength] = 0x80

  const lengthBits = originalLength * 8
  const dataView = new DataView(padded.buffer)
  dataView.setUint32(withPaddingLength - 8, lengthBits >>> 0, true)
  dataView.setUint32(withPaddingLength - 4, Math.floor(lengthBits / 0x100000000), true)

  // Initialization
  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ]

  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]

  for (let offset = 0; offset < withPaddingLength; offset += 64) {
    const M: number[] = []
    for (let j = 0; j < 16; j++) {
      M[j] = dataView.getUint32(offset + j * 4, true)
    }

    let A = a
    let B = b
    let C = c
    let D = d

    for (let i = 0; i < 64; i++) {
      let F = 0
      let g = 0
      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }

      const temp = D
      D = C
      C = B
      const sum = (A + F + K[i] + M[g]) >>> 0
      B = (B + ((sum << S[i]) | (sum >>> (32 - S[i])))) >>> 0
      A = temp
    }

    a = (a + A) >>> 0
    b = (b + B) >>> 0
    c = (c + C) >>> 0
    d = (d + D) >>> 0
  }

  const out = new DataView(new ArrayBuffer(16))
  out.setUint32(0, a, true)
  out.setUint32(4, b, true)
  out.setUint32(8, c, true)
  out.setUint32(12, d, true)

  return Array.from(new Uint8Array(out.buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export interface ComputedHashes {
  sha256: string
  sha512: string
  sha384: string
  sha1: string
  md5: string
}

function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function computeHashes(input: string | ArrayBuffer): Promise<ComputedHashes> {
  const isString = typeof input === 'string'
  const buffer = isString ? new TextEncoder().encode(input).buffer : input

  // If in SSR without crypto.subtle, return blank hashes
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return {
      sha256: '',
      sha512: '',
      sha384: '',
      sha1: '',
      md5: '',
    }
  }

  const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
    crypto.subtle.digest('SHA-256', buffer),
    crypto.subtle.digest('SHA-512', buffer),
    crypto.subtle.digest('SHA-384', buffer),
    crypto.subtle.digest('SHA-1', buffer),
  ])

  const md5Hash = md5(buffer)

  return {
    sha256: bufToHex(sha256Buf),
    sha512: bufToHex(sha512Buf),
    sha384: bufToHex(sha384Buf),
    sha1: bufToHex(sha1Buf),
    md5: md5Hash,
  }
}
