import { SITE_URL } from './site'

/**
 * Builds an absolute, shareable URL for the current tool state.
 *
 * Runs during prerendering too, where `window` does not exist, so it falls
 * back to the canonical production origin.
 */
export function buildShareUrl(
  pathname: string,
  params: Record<string, string | null | undefined>,
): string {
  const origin = typeof window === 'undefined' ? SITE_URL : window.location.origin
  const url = new URL(pathname, origin)

  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  return url.toString()
}
