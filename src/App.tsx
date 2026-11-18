import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout, NotFound } from './components/Layout'

// Route-level chunks keep the first paint small; each tool loads on demand.
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const JsonToCsv = lazy(() =>
  import('./pages/JsonToCsv').then((module) => ({ default: module.JsonToCsv })),
)
const JwtDecoder = lazy(() =>
  import('./pages/JwtDecoder').then((module) => ({ default: module.JwtDecoder })),
)
const CsvColumnCleaner = lazy(() =>
  import('./pages/CsvColumnCleaner').then((module) => ({ default: module.CsvColumnCleaner })),
)
const FreelanceFeeCalculator = lazy(() =>
  import('./pages/FreelanceFeeCalculator').then((module) => ({
    default: module.FreelanceFeeCalculator,
  })),
)
const RegexTester = lazy(() =>
  import('./pages/RegexTester').then((module) => ({ default: module.RegexTester })),
)
const PrivacyPolicy = lazy(() =>
  import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })),
)
const TermsOfService = lazy(() =>
  import('./pages/TermsOfService').then((module) => ({ default: module.TermsOfService })),
)
const About = lazy(() =>
  import('./pages/About').then((module) => ({ default: module.About })),
)

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-24 text-[13px] text-slate-500 sm:px-6 dark:text-slate-400"
    >
      <span className="size-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500 dark:border-slate-700 dark:border-t-indigo-400" />
      Loading tool…
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="tools/json-to-csv"
            element={
              <Suspense fallback={<RouteFallback />}>
                <JsonToCsv />
              </Suspense>
            }
          />
          <Route
            path="tools/jwt-decoder"
            element={
              <Suspense fallback={<RouteFallback />}>
                <JwtDecoder />
              </Suspense>
            }
          />
          <Route
            path="tools/csv-column-cleaner"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CsvColumnCleaner />
              </Suspense>
            }
          />
          <Route
            path="tools/freelance-fee-calculator"
            element={
              <Suspense fallback={<RouteFallback />}>
                <FreelanceFeeCalculator />
              </Suspense>
            }
          />
          <Route
            path="tools/regex-tester"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RegexTester />
              </Suspense>
            }
          />
          <Route
            path="privacy"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="terms"
            element={
              <Suspense fallback={<RouteFallback />}>
                <TermsOfService />
              </Suspense>
            }
          />
          <Route
            path="about"
            element={
              <Suspense fallback={<RouteFallback />}>
                <About />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
