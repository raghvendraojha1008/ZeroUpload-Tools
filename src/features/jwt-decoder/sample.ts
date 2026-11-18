function base64Url(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Builds a realistic HS256 sample whose timestamps are relative to now, so the
 * expiry countdown in the UI always demonstrates something meaningful.
 */
export function makeSampleToken(): string {
  const issuedAt = Math.floor(Date.now() / 1000) - 600
  const header = { alg: 'HS256', typ: 'JWT', kid: 'zu-demo-2026' }
  const payload = {
    iss: 'https://auth.zeroupload.tools',
    sub: 'user_8f21c4d9',
    aud: ['api.zeroupload.tools', 'app.zeroupload.tools'],
    name: 'Ada Lovelace',
    email: 'ada@analytical.dev',
    role: 'admin',
    scope: 'tools:read tools:write billing:read',
    iat: issuedAt,
    nbf: issuedAt,
    exp: issuedAt + 7200,
    jti: '6f1b2c3d-4e5f-6789-abcd-ef0123456789',
  }
  const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  return `${base64Url(header)}.${base64Url(payload)}.${signature}`
}
