import type { PageMeta } from './pageMeta'
import { SITE_NAME, SITE_URL } from './site'

/** Site-level entity, including the sitelinks search box. */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Fast, free and 100% private developer utilities that run entirely in the browser.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Generic page entity for routes without a tool-specific schema. */
export function buildWebPageSchema(meta: PageMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${meta.title} · ${SITE_NAME}`,
    description: meta.description,
    url: new URL(meta.path, SITE_URL).toString(),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  }
}
