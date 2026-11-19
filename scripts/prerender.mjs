/**
 * Post-build prerender step.
 *
 * The client build produces `dist/index.html`; this script renders every route
 * with the same React tree Node-side and writes route-specific HTML files with
 * the title, description, canonical, Open Graph tags and JSON-LD already in the
 * markup. Cloudflare serves `/tools/x.html` for `/tools/x`, and the SPA
 * `not_found_handling` fallback still covers anything else.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const ssgDir = path.join(root, '.ssg')
const templatePath = path.join(distDir, 'index.html')

function fail(message) {
  console.error(`\n[prerender] ${message}\n`)
  process.exit(1)
}

if (!fs.existsSync(templatePath)) fail('dist/index.html is missing — run `vite build` first.')
if (!fs.existsSync(ssgDir)) fail('.ssg is missing — run `npm run build:ssg` first.')

const bundleName = fs
  .readdirSync(ssgDir)
  .filter((file) => file.endsWith('.js') || file.endsWith('.mjs'))
  .sort((a, b) => (a.includes('entry-server') ? -1 : b.includes('entry-server') ? 1 : 0))[0]

if (!bundleName) fail('No server bundle found in .ssg.')

const bundle = await import(pathToFileURL(path.join(ssgDir, bundleName)).href)
const { renderRoute, PRERENDER_PATHS, PAGE_META } = bundle

if (typeof renderRoute !== 'function' || !Array.isArray(PRERENDER_PATHS)) {
  fail('The server bundle did not export renderRoute/PRERENDER_PATHS.')
}

const SITE_NAME = 'CleanDevTools'
const SITE_URL = 'https://cleandevtools.com'

// Read the template before overwriting it with the prerendered home page.
const template = fs.readFileSync(templatePath, 'utf8')

const ROOT_PATTERN = /<div id="root">\s*<\/div>/
if (!ROOT_PATTERN.test(template)) fail('Could not find an empty <div id="root"></div> in dist/index.html.')

const META_PATTERN = /<!-- route-meta:start -->[\s\S]*?<!-- route-meta:end -->/
if (!META_PATTERN.test(template)) fail('Could not find the route-meta markers in dist/index.html.')

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function headMarkup(meta) {
  const fullTitle = `${meta.title} · ${SITE_NAME}`
  const url = new URL(meta.path, SITE_URL).toString()

  return [
    '<!-- route-meta:start -->',
    `    <title>${escapeHtml(fullTitle)}</title>`,
    `    <meta name="description" content="${escapeHtml(meta.description)}" />`,
    `    <link rel="canonical" href="${url}" />`,
    '    <meta property="og:type" content="website" />',
    `    <meta property="og:site_name" content="${SITE_NAME}" />`,
    `    <meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `    <meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `    <meta property="og:url" content="${url}" />`,
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    '    <!-- route-meta:end -->',
  ].join('\n')
}

/** `/tools/jwt-decoder` -> `dist/tools/jwt-decoder.html`, `/` -> `dist/index.html`. */
function outputPathFor(routePath) {
  if (routePath === '/') return templatePath
  const relative = routePath.replace(/^\//, '')
  return path.join(distDir, `${relative}.html`)
}

const metaByPath = new Map(Object.values(PAGE_META).map((meta) => [meta.path, meta]))

const written = []

for (const routePath of PRERENDER_PATHS) {
  const meta = metaByPath.get(routePath)
  if (!meta) fail(`No PAGE_META entry for ${routePath}.`)

  let markup
  try {
    markup = renderRoute(routePath)
  } catch (error) {
    fail(`Rendering ${routePath} failed: ${error.stack ?? error}`)
  }

  const html = template
    .replace(META_PATTERN, headMarkup(meta))
    .replace(ROOT_PATTERN, () => `<div id="root">${markup}</div>`)

  const target = outputPathFor(routePath)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, html, 'utf8')
  written.push({ routePath, target, bytes: Buffer.byteLength(html) })
}

console.log(`[prerender] wrote ${written.length} route snapshots`)
for (const entry of written) {
  console.log(
    `  ${entry.routePath.padEnd(38)} ${path.relative(root, entry.target).padEnd(46)} ${(entry.bytes / 1024).toFixed(1)} kB`,
  )
}
