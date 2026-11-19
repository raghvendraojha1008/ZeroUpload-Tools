import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT_ID, ADSENSE_SLOT_BANNER, ADSENSE_SLOT_RAIL } from '../lib/site'
import { cn } from '../lib/cn'

interface AdSlotProps {
  variant: 'banner' | 'rail'
  className?: string
}

const SIZES = {
  banner: { height: 'min-h-[90px]', slot: ADSENSE_SLOT_BANNER },
  rail: { height: 'min-h-[250px]', slot: ADSENSE_SLOT_RAIL },
} as const

/**
 * Renders nothing at all until an AdSense client ID is configured, so the
 * shipped pages stay completely clean. Once an ID exists it reserves the same
 * space as before and mounts the standard AdSense container.
 */
export function AdSlot({ variant, className }: AdSlotProps) {
  const containerRef = useRef<HTMLModElement>(null)
  const size = SIZES[variant]

  useEffect(() => {
    // Ads are off, or the Ins element is not mounted.
    if (!ADSENSE_CLIENT_ID || !containerRef.current) return

    const scope = window as unknown as { adsbygoogle?: unknown[] }
    scope.adsbygoogle = scope.adsbygoogle ?? []
    scope.adsbygoogle.push({})
  }, [])

  if (!ADSENSE_CLIENT_ID) return null

  return (
    <aside aria-label="Advertisement" className={cn(size.height, className)}>
      <ins
        ref={containerRef}
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={size.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
