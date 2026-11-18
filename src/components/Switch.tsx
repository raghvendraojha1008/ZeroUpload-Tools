import { useId } from 'react'
import { cn } from '../lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

/** Accessible toggle row with a title and an optional one-line explanation. */
export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span
          id={labelId}
          className="text-[13px] font-medium text-slate-800 dark:text-slate-200"
        >
          {label}
        </span>
        {description ? (
          <p
            id={descriptionId}
            className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"
          >
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:pointer-events-none disabled:opacity-40',
          checked ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700',
        )}
      >
        <span
          className={cn(
            'inline-block size-3.5 rounded-full bg-white shadow-sm transition',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          )}
        />
      </button>
    </div>
  )
}
