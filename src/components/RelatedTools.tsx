import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { TOOLS, type Tool, type ToolCategory } from '../lib/tools'

interface RelatedToolsProps {
  currentToolId: string
  category?: ToolCategory
}

export function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  // Prioritize tools in the same category, followed by other popular utilities
  const related = TOOLS.filter((tool) => tool.id !== currentToolId)
    .sort((a, b) => {
      if (a.category === category && b.category !== category) return -1
      if (b.category === category && a.category !== category) return 1
      return 0
    })
    .slice(0, 3)

  return (
    <div className="mt-14 border-t border-slate-200/80 pt-10 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-slate-100">
            Related Developer Utilities
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Explore more 100% in-browser, zero-upload tools
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          View all 10 tools
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {related.map((tool: Tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.id}
              to={tool.href}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-500/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/60 dark:text-cyan-400 dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950">
                    <Icon className="size-4" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {tool.category}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold tracking-tight text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-cyan-400">
                  {tool.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2 dark:text-slate-400">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-cyan-400">
                Launch tool
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
