import { defineI18nLocaleDetector, tryCookieLocale, tryHeaderLocale } from '#imports'

const SUPPORTED = new Set(['fa', 'en'])

function baseTag(locale: unknown): string | undefined {
  const tag = locale?.toString().toLowerCase().split('-')[0]
  return tag && SUPPORTED.has(tag) ? tag : undefined
}

/**
 * Server-side locale detection.
 *
 * 1. The `i18n_lang` cookie (set when the visitor picks a language) wins,
 *    so the site renders in the visitor's chosen language on every request.
 * 2. Otherwise the browser's `accept-language` header is used, so the first
 *    visit renders in the correct language with no client-side swap.
 * 3. Fall back to the configured default locale.
 */
export default defineI18nLocaleDetector((event, config) => {
  const cookie = tryCookieLocale(event, { lang: '', name: 'i18n_lang' })
  const fromCookie = baseTag(cookie)
  if (fromCookie) return fromCookie

  const header = tryHeaderLocale(event, { lang: '' })
  const fromHeader = baseTag(header)
  if (fromHeader) return fromHeader

  return config.defaultLocale
})
