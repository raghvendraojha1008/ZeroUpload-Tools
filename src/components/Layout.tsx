import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ToastProvider } from './Toast'
import { useTheme } from '../lib/useTheme'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export function Layout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  )
}

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        This tool isn’t here yet
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page you were looking for doesn’t exist. Every tool we ship lives on the tools
        directory.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <ArrowLeft className="size-4" />
        Back to all tools
      </Link>
    </div>
  )
}
