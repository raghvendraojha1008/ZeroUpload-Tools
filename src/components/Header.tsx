import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Search, ShieldCheck, Sun } from 'lucide-react'
import type { Theme } from '../lib/useTheme'
import { cn } from '../lib/cn'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-[#08080a]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
        >
          <span className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/30">
            <ShieldCheck className="size-[18px] text-white" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">CleanDev</span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Tools
            </span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="relative ml-2 hidden flex-1 md:block md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60 dark:focus:bg-slate-900"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-700 sm:flex dark:border-emerald-400/20 dark:text-emerald-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            100% In-Browser &amp; Private
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100"
          >
            <Sun className={cn('size-4 transition-all', theme === 'dark' ? 'hidden' : 'block')} />
            <Moon className={cn('size-4 transition-all', theme === 'dark' ? 'block' : 'hidden')} />
          </button>
        </div>
      </div>
    </header>
  )
}
