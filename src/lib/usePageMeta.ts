import { useEffect } from 'react'
import { SITE_NAME, absoluteUrl } from './site'

interface PageMeta {
  /** Page-specific title, without the site suffix. */
  title: string
  description: string
  /** Route path, e.g. "/tools/jwt-decoder". */
  path: string
}

function upsertMeta(key: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = href
}

/**
 * Keeps the title, description, Open Graph/Twitter tags and canonical URL in
 * sync with the active route. The page is client-rendered, so the head is
 * updated on mount and whenever the copy changes.
 */
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const fullTitle = `${title} · ${SITE_NAME}`
    const url = absoluteUrl(path)

    document.title = fullTitle
    upsertMeta('description', description)
    upsertMeta('og:title', fullTitle, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:url', url, 'property')
    upsertMeta('twitter:title', fullTitle)
    upsertMeta('twitter:description', description)
    upsertCanonical(url)
  }, [title, description, path])
}
