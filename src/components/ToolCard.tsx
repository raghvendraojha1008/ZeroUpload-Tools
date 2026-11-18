import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Tool } from '../lib/tools'

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon

  return (
    <Link
      to={tool.href}
      className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.06] dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:shadow-black/40"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition group-hover:border-indigo-500/30 group-hover:bg-indigo-500/[0.08] group-hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:group-hover:border-indigo-400/30 dark:group-hover:text-indigo-300">
          <Icon className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {tool.category}
          </span>
          <ArrowUpRight className="size-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400" />
        </div>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {tool.name}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
        {tool.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tool.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-white/[0.07] dark:bg-slate-900/60 dark:text-slate-400"
          >
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
