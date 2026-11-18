import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'

export interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <div
              className={cn(
                'grid transition-all duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Injects a JSON-LD block into <head> for the current page and removes it on unmount.
 * Keeps structured data colocated with the content that describes it.
 */
export function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = serialized
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [id, serialized])

  return null
}
