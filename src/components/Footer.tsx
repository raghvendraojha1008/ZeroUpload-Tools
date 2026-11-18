import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { TOOLS } from '../lib/tools'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <ShieldCheck className="size-4 text-indigo-500" />
            ZeroUpload Tools
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            Fast, free developer utilities that run entirely in your browser. No servers, no
            uploads, no tracking.
          </p>
        </div>

        <div className="flex gap-12 text-[13px]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Tools
            </p>
            <ul className="mt-3 space-y-2">
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.href}
                    className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  All tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Guarantees
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Client-side only</li>
              <li>No account needed</li>
              <li>No file size limit</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Legal &amp; About
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ZeroUpload Tools. Free forever.</p>
          <p>Built with React, Vite &amp; Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  )
}
