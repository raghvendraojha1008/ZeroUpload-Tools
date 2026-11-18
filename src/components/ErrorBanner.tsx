import { CircleAlert, X } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
  title?: string
  hint?: string
}

/**
 * Non-blocking parse-error banner: it explains what broke and leaves the rest of
 * the tool usable, instead of blanking the page or throwing.
 */
export function ErrorBanner({
  message,
  onDismiss,
  title = 'Invalid JSON',
  hint = 'Nothing was sent anywhere — fix the syntax above and the preview updates instantly.',
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-50 px-4 py-3 dark:border-rose-400/25 dark:bg-rose-500/10"
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300">
        <CircleAlert className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-rose-800 dark:text-rose-200">{title}</p>
        <p className="mt-0.5 break-words font-mono text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
          {message}
        </p>
        <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-200/70">{hint}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-rose-600/70 transition hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300/70 dark:hover:text-rose-200"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
