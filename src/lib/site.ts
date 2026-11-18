/**
 * Single source of truth for site configuration, domain, and monetization.
 * Update these values when you attach your custom domain or get approved for AdSense.
 */
export const SITE_URL = 'https://cleandevtools.com'
export const SITE_NAME = 'CleanDevTools'
export const SITE_DESCRIPTION = 'Fast, free, clean and 100% private developer utilities that run entirely in your browser.'
export const CONTACT_EMAIL = 'support@cleandevtools.com'

/**
 * Monetization & Analytics Configuration
 * Leave empty or replace with your actual IDs when ready.
 */
export const ADSENSE_CLIENT_ID = '' // e.g. 'ca-pub-1234567890123456'
export const GOOGLE_ANALYTICS_ID = '' // e.g. 'G-XXXXXXXXXX'

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
