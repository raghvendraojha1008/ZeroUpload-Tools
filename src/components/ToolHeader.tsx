import type { LucideIcon } from 'lucide-react'

export interface ToolBadge {
  icon: LucideIcon
  label: string
}

interface ToolHeaderProps {
  title: string
  highlight?: string
  description: string
  badges: ToolBadge[]
}

/** Shared page heading so every tool opens with the same rhythm and badge row. */
export function ToolHeader({ title, highlight, description, badges }: ToolHeaderProps) {
  return (
    <header className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          {title}
          {highlight ? (
            <>
              {' '}
              <span className="text-slate-500 dark:text-slate-400">{highlight}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <span
              key={badge.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
            >
              <Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              {badge.label}
            </span>
          )
        })}
      </div>
    </header>
  )
}
