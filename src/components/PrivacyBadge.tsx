import { useEffect, useState } from 'react'
import { Lock, ShieldCheck } from 'lucide-react'
import { cn } from '../lib/cn'

interface NetworkState {
  external: number
  uploads: number
}

const EMPTY: NetworkState = { external: 0, uploads: 0 }

/**
 * Counts every request this tab makes after mount that could carry data
 * off-device: cross-origin requests and same-origin non-GET calls.
 *
 * Same-origin GETs are the site's own JS/CSS/font assets, so they are not
 * "network calls" in the sense the badge promises. Nothing is reported
 * anywhere — the counters only exist in this component's state.
 */
export function PrivacyBadge() {
  const [state, setState] = useState<NetworkState>(EMPTY)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const origin = window.location.origin
    const externalOrigins = new Set<string>()
    let uploads = 0
    let cancelled = false

    function publish() {
      if (cancelled) return
      setState({ external: externalOrigins.size, uploads })
    }

    function record(rawUrl: string, method = 'GET') {
      let parsed: URL
      try {
        parsed = new URL(rawUrl, origin)
      } catch {
        return
      }

      const verb = method.toUpperCase()
      if (parsed.origin !== origin) {
        externalOrigins.add(parsed.origin)
      } else if (verb !== 'GET' && verb !== 'HEAD') {
        uploads += 1
      }
      publish()
    }

    const originalFetch = window.fetch.bind(window)
    const patchedFetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      const method = init?.method ?? (input instanceof Request ? input.method : 'GET')
      record(url, method)
      return originalFetch(input, init)
    }
    window.fetch = patchedFetch as typeof window.fetch

    const originalOpen = XMLHttpRequest.prototype.open
    type OpenArgs = Parameters<typeof originalOpen>
    const patchedOpen = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ) {
      record(String(url), method)
      return (originalOpen as (...args: unknown[]) => void).apply(this, [
        method,
        url,
        ...rest,
      ] as unknown as OpenArgs)
    }
    XMLHttpRequest.prototype.open = patchedOpen as typeof originalOpen

    const originalBeacon = navigator.sendBeacon?.bind(navigator)
    if (originalBeacon) {
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
        record(String(url), 'POST')
        return originalBeacon(url, data)
      }
    }

    const observer =
      'PerformanceObserver' in window
        ? new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) record(entry.name, 'GET')
          })
        : null
    observer?.observe({ type: 'resource', buffered: false })

    return () => {
      cancelled = true
      window.fetch = originalFetch
      XMLHttpRequest.prototype.open = originalOpen
      if (originalBeacon) navigator.sendBeacon = originalBeacon
      observer?.disconnect()
    }
  }, [])

  const total = state.external + state.uploads
  const clean = total === 0

  return (
    <div className="fixed bottom-4 left-4 z-30 print:hidden">
      {open ? (
        <div
          role="dialog"
          aria-label="Privacy verification details"
          className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
        >
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-slate-100">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Verified in this tab
          </p>
          <dl className="mt-3 space-y-1.5 text-[11.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500 dark:text-slate-400">Cross-origin requests</dt>
              <dd className="font-mono text-slate-900 dark:text-slate-100">{state.external}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500 dark:text-slate-400">Uploads (POST / beacon)</dt>
              <dd className="font-mono text-slate-900 dark:text-slate-100">{state.uploads}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Counted since this page loaded, with fetch, XHR and beacon patched locally. Same-origin
            asset loads are the site’s own files, not data leaving your device.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={
          clean
            ? 'Privacy status: 0 network calls observed in this tab. Show details.'
            : `Privacy status: ${total} external request${total === 1 ? '' : 's'} observed. Show details.`
        }
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium shadow-sm backdrop-blur transition',
          clean
            ? 'border-emerald-500/25 bg-white/85 text-emerald-700 hover:border-emerald-500/40 dark:border-emerald-400/25 dark:bg-slate-900/85 dark:text-emerald-300'
            : 'border-amber-500/30 bg-white/85 text-amber-700 hover:border-amber-500/50 dark:border-amber-400/25 dark:bg-slate-900/85 dark:text-amber-300',
        )}
      >
        <span className="relative flex size-1.5" aria-hidden="true">
          {clean ? (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
          ) : null}
          <span
            className={cn(
              'relative inline-flex size-1.5 rounded-full',
              clean ? 'bg-emerald-500' : 'bg-amber-500',
            )}
          />
        </span>
        <Lock className="size-2.5" aria-hidden="true" />
        <span>{clean ? '0 Network Calls' : `${total} External Request${total === 1 ? '' : 's'}`}</span>
        <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">
          ·
        </span>
        <span className="text-slate-600 dark:text-slate-300">100% Private</span>
      </button>
    </div>
  )
}
