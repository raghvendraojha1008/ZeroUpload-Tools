import { Megaphone } from 'lucide-react'
import { cn } from '../lib/cn'

interface AdSlotProps {
  variant: 'banner' | 'rail'
  className?: string
}

const SIZES = {
  banner: { height: 'min-h-[90px]', label: 'Leaderboard · 728 × 90' },
  rail: { height: 'min-h-[250px]', label: 'Medium rectangle · 300 × 250' },
} as const

/**
 * Space is reserved now (fixed min-height) so injecting real ad tags later
 * cannot shift the content around it.
 */
export function AdSlot({ variant, className }: AdSlotProps) {
  const size = SIZES[variant]

  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-100/60 px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-900/40',
        size.height,
        className,
      )}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-slate-400">
        <Megaphone className="size-3" />
        Advertisement
      </span>
      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
        {size.label}
      </span>
    </aside>
  )
}
