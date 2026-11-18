import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface PanelProps {
  title: string
  icon?: LucideIcon
  action?: ReactNode
  subtitle?: string
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/** Card with a consistent header/body split, used for every tool surface. */
export function Panel({
  title,
  icon: Icon,
  action,
  subtitle,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        'min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-5 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon className="size-4 shrink-0 text-slate-500 dark:text-slate-400" /> : null}
          <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {subtitle ? (
            <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          ) : null}
        </div>
        {action}
      </div>

      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
