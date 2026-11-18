/**
 * Single source of truth for site configuration, domain, and monetization.
 * Update these values when you attach your custom domain or get approved for AdSense.
 */
export const SITE_URL = 'https://zeroupload.tools'
export const SITE_NAME = 'ZeroUpload Tools'
export const SITE_DESCRIPTION = 'Fast, free and 100% private developer utilities that run entirely in your browser.'
export const CONTACT_EMAIL = 'support@zeroupload.tools'

/**
 * Monetization & Analytics Configuration
 * Leave empty or replace with your actual IDs when ready.
 */
export const ADSENSE_CLIENT_ID = '' // e.g. 'ca-pub-1234567890123456'
export const GOOGLE_ANALYTICS_ID = '' // e.g. 'G-XXXXXXXXXX'

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
