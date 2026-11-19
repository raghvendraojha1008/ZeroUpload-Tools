import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { PAGE_META } from '../lib/pageMeta'
import { About } from '../pages/About'
import { Base64FileConverter } from '../pages/Base64FileConverter'
import { CsvColumnCleaner } from '../pages/CsvColumnCleaner'
import { FreelanceFeeCalculator } from '../pages/FreelanceFeeCalculator'
import { Home } from '../pages/Home'
import { JsonToCsv } from '../pages/JsonToCsv'
import { JwtDecoder } from '../pages/JwtDecoder'
import { MarkdownTableGenerator } from '../pages/MarkdownTableGenerator'
import { PrivacyPolicy } from '../pages/PrivacyPolicy'
import { RegexTester } from '../pages/RegexTester'
import { SqlToJsonCsv } from '../pages/SqlToJsonCsv'
import { TermsOfService } from '../pages/TermsOfService'
import { UrlParser } from '../pages/UrlParser'
import { UuidGenerator } from '../pages/UuidGenerator'

const ROUTES: Array<{ path: string; element: ReactElement }> = [
  { path: '/', element: <Home /> },
  { path: '/tools/json-to-csv', element: <JsonToCsv /> },
  { path: '/tools/jwt-decoder', element: <JwtDecoder /> },
  { path: '/tools/csv-column-cleaner', element: <CsvColumnCleaner /> },
  { path: '/tools/freelance-fee-calculator', element: <FreelanceFeeCalculator /> },
  { path: '/tools/regex-tester', element: <RegexTester /> },
  { path: '/tools/sql-to-json-csv', element: <SqlToJsonCsv /> },
  { path: '/tools/base64-file-converter', element: <Base64FileConverter /> },
  { path: '/tools/markdown-table-generator', element: <MarkdownTableGenerator /> },
  { path: '/tools/uuid-generator', element: <UuidGenerator /> },
  { path: '/tools/url-parser', element: <UrlParser /> },
  { path: '/privacy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <TermsOfService /> },
  { path: '/about', element: <About /> },
]

/** Renders a single route, including the shared header/footer shell. */
export function renderRoute(pathname: string): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route element={<Layout />}>
          {ROUTES.map(({ path, element }) =>
            path === '/' ? (
              <Route key={path} index element={element} />
            ) : (
              <Route key={path} path={path.slice(1)} element={element} />
            ),
          )}
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

export const PRERENDER_PATHS = ROUTES.map((route) => route.path)
export { PAGE_META }
