export type CodeLanguage = 'fetch' | 'axios' | 'python-requests' | 'python-httpx' | 'go'

export interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  data?: string
}

export function parseCurl(command: string): ParsedCurl {
  const clean = command
    .trim()
    .replace(/\\\r?\n/g, ' ') // join backslash line continuations
    .replace(/^curl\s+/i, '')

  let method = ''
  const headers: Record<string, string> = {}
  let data: string | undefined
  let url = ''

  // Tokenize handling quotes
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g
  const tokens: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(clean)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[0])
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token === '-X' || token === '--request') {
      method = (tokens[++i] || 'GET').toUpperCase()
    } else if (token === '-H' || token === '--header') {
      const headerVal = tokens[++i] || ''
      const colonIdx = headerVal.indexOf(':')
      if (colonIdx > 0) {
        const key = headerVal.slice(0, colonIdx).trim()
        const val = headerVal.slice(colonIdx + 1).trim()
        headers[key] = val
      }
    } else if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary'
    ) {
      data = tokens[++i] || ''
      if (!method) method = 'POST'
    } else if (token === '-u' || token === '--user') {
      const auth = tokens[++i] || ''
      try {
        headers['Authorization'] = `Basic ${btoa(auth)}`
      } catch {
        headers['Authorization'] = `Basic ${auth}`
      }
    } else if (!token.startsWith('-') && !url && (token.startsWith('http') || token.includes('.'))) {
      url = token
    }
  }

  if (!url) {
    // If not found with http, take the first non-flag argument
    for (const t of tokens) {
      if (!t.startsWith('-')) {
        url = t
        break
      }
    }
  }

  if (!url) {
    url = 'https://api.example.com/v1/resource'
  }

  if (!method) {
    method = data ? 'POST' : 'GET'
  }

  return { url, method, headers, data }
}

export function curlToCode(curlCommand: string, lang: CodeLanguage): string {
  if (!curlCommand.trim()) return ''

  const parsed = parseCurl(curlCommand)
  const { url, method, headers, data } = parsed

  switch (lang) {
    case 'fetch':
      return generateFetch(url, method, headers, data)
    case 'axios':
      return generateAxios(url, method, headers, data)
    case 'python-requests':
      return generatePythonRequests(url, method, headers, data)
    case 'python-httpx':
      return generatePythonHttpx(url, method, headers, data)
    case 'go':
      return generateGo(url, method, headers, data)
    default:
      return generateFetch(url, method, headers, data)
  }
}

function generateFetch(
  url: string,
  method: string,
  headers: Record<string, string>,
  data?: string
): string {
  const options: Record<string, unknown> = {}
  if (method !== 'GET') options.method = method
  if (Object.keys(headers).length > 0) options.headers = headers

  let bodyStr = ''
  if (data !== undefined && method !== 'GET') {
    try {
      JSON.parse(data)
      bodyStr = `\n  body: JSON.stringify(${data.trim()}),`
    } catch {
      bodyStr = `\n  body: ${JSON.stringify(data)},`
    }
  }

  const hasOptions = method !== 'GET' || Object.keys(headers).length > 0 || !!bodyStr

  if (!hasOptions) {
    return `const response = await fetch(${JSON.stringify(url)});\nconst data = await response.json();\nconsole.log(data);`
  }

  const headersStr =
    Object.keys(headers).length > 0
      ? `\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},`
      : ''

  const methodStr = method !== 'GET' ? `\n  method: '${method}',` : ''

  return `const response = await fetch(${JSON.stringify(url)}, {${methodStr}${headersStr}${bodyStr}\n});\nconst result = await response.json();\nconsole.log(result);`
}

function generateAxios(
  url: string,
  method: string,
  headers: Record<string, string>,
  data?: string
): string {
  const m = method.toLowerCase()
  const headersStr =
    Object.keys(headers).length > 0
      ? `{\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}\n}`
      : ''

  let payload = ''
  if (data) {
    try {
      payload = JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      payload = JSON.stringify(data)
    }
  }

  if (m === 'get') {
    const config = headersStr ? `, ${headersStr}` : ''
    return `import axios from 'axios';\n\nconst { data } = await axios.get(${JSON.stringify(url)}${config});\nconsole.log(data);`
  }

  const body = payload || '{}'
  const config = headersStr ? `, ${headersStr}` : ''
  return `import axios from 'axios';\n\nconst { data } = await axios.${m}(\n  ${JSON.stringify(url)},\n  ${body}${config}\n);\nconsole.log(data);`
}

function generatePythonRequests(
  url: string,
  method: string,
  headers: Record<string, string>,
  data?: string
): string {
  const lines: string[] = ['import requests', '']
  lines.push(`url = ${JSON.stringify(url)}`)

  if (Object.keys(headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`)
  }

  let isJson = false
  if (data) {
    try {
      const parsed = JSON.parse(data)
      lines.push(`payload = ${JSON.stringify(parsed, null, 4)}`)
      isJson = true
    } catch {
      lines.push(`payload = ${JSON.stringify(data)}`)
    }
  }

  const args: string[] = ['url']
  if (Object.keys(headers).length > 0) args.push('headers=headers')
  if (data) args.push(isJson ? 'json=payload' : 'data=payload')

  lines.push('')
  lines.push(`response = requests.${method.toLowerCase()}(${args.join(', ')})`)
  lines.push('print(response.json())')

  return lines.join('\n')
}

function generatePythonHttpx(
  url: string,
  method: string,
  headers: Record<string, string>,
  data?: string
): string {
  const lines: string[] = ['import httpx', '']
  lines.push(`url = ${JSON.stringify(url)}`)

  if (Object.keys(headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`)
  }

  let isJson = false
  if (data) {
    try {
      const parsed = JSON.parse(data)
      lines.push(`payload = ${JSON.stringify(parsed, null, 4)}`)
      isJson = true
    } catch {
      lines.push(`payload = ${JSON.stringify(data)}`)
    }
  }

  const args: string[] = ['url']
  if (Object.keys(headers).length > 0) args.push('headers=headers')
  if (data) args.push(isJson ? 'json=payload' : 'data=payload')

  lines.push('')
  lines.push('with httpx.Client() as client:')
  lines.push(`    response = client.${method.toLowerCase()}(${args.join(', ')})`)
  lines.push('    print(response.json())')

  return lines.join('\n')
}

function generateGo(
  url: string,
  method: string,
  headers: Record<string, string>,
  data?: string
): string {
  const lines: string[] = [
    'package main',
    '',
    'import (',
    '\t"fmt"',
    '\t"io"',
    '\t"net/http"',
  ]
  if (data) lines.push('\t"strings"')
  lines.push(')', '', 'func main() {')

  if (data) {
    lines.push(`\tbody := strings.NewReader(${JSON.stringify(data)})`)
    lines.push(`\treq, err := http.NewRequest("${method}", "${url}", body)`)
  } else {
    lines.push(`\treq, err := http.NewRequest("${method}", "${url}", nil)`)
  }

  lines.push('\tif err != nil { panic(err) }')

  for (const [k, v] of Object.entries(headers)) {
    lines.push(`\treq.Header.Set("${k}", "${v}")`)
  }

  lines.push('')
  lines.push('\tclient := &http.Client{}')
  lines.push('\tresp, err := client.Do(req)')
  lines.push('\tif err != nil { panic(err) }')
  lines.push('\tdefer resp.Body.Close()')
  lines.push('')
  lines.push('\tresBody, _ := io.ReadAll(resp.Body)')
  lines.push('\tfmt.Println(string(resBody))')
  lines.push('}')

  return lines.join('\n')
}
