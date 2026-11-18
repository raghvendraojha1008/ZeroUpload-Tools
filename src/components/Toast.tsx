import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { cn } from '../lib/cn'

type ToastTone = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

type ToastFn = (message: string, tone?: ToastTone) => void

const ToastContext = createContext<ToastFn>(() => {})

export function useToast(): ToastFn {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const push = useCallback<ToastFn>((message, tone = 'success') => {
    const id = nextId.current
    nextId.current += 1

    setToasts((current) => [...current.slice(-2), { id, message, tone }])

    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2600)
    timers.current.push(timer)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px] font-medium shadow-lg shadow-slate-900/10 sm:w-auto dark:shadow-black/40',
              toast.tone === 'success'
                ? 'border-emerald-500/25 bg-white text-slate-900 dark:border-emerald-400/25 dark:bg-slate-900 dark:text-slate-100'
                : 'border-rose-500/25 bg-white text-slate-900 dark:border-rose-400/25 dark:bg-slate-900 dark:text-slate-100',
              'animate-[toast-in_180ms_ease-out]',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full',
                toast.tone === 'success'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
              )}
            >
              {toast.tone === 'success' ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : (
                <TriangleAlert className="size-3.5" />
              )}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
