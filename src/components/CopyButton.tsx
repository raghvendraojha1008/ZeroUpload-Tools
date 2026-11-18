import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useToast } from './Toast'
import { cn } from '../lib/cn'

interface CopyButtonProps {
  value: string
  label?: string
  copiedLabel?: string
  variant?: 'solid' | 'outline' | 'ghost'
  className?: string
  disabled?: boolean
  toastMessage?: string
}

const VARIANTS = {
  solid:
    'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white',
} as const

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied!',
  variant = 'outline',
  className,
  disabled,
  toastMessage = 'Copied to clipboard!',
}: CopyButtonProps) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
      toast(toastMessage)
    } catch {
      setCopied(false)
      toast('Clipboard is blocked — use Download instead', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !value}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-medium transition disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? copiedLabel : label}
    </button>
  )
}
