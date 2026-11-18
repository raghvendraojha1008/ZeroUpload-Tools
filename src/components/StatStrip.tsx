import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export interface StatItem {
  label: string
  value: string
  icon?: LucideIcon
  tone?: 'default' | 'ok' | 'warn'
}

/** Compact metric strip shown directly under every tool heading. */
export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <dl
      aria-live="polite"
      className={cn(
        'grid divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40',
        items.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3',
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="min-w-0 px-3 py-3 sm:px-5 sm:py-3.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
              <span className="truncate">{item.label}</span>
            </dt>
            <dd
              className={cn(
                'mt-1 truncate font-mono text-sm font-medium tabular-nums sm:text-lg',
                item.tone === 'warn'
                  ? 'text-rose-600 dark:text-rose-400'
                  : item.tone === 'ok'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-slate-100',
              )}
            >
              {item.value}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
