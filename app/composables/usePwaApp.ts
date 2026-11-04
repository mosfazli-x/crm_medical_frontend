import { ref } from 'vue'
import type { LocationQuery } from 'vue-router'

/**
 * Detects whether the app is running as an installed PWA ("standalone" display
 * mode) and, when it is, steers the visitor into the dedicated `/app` shell.
 *
 * The standard website is never touched: this only ever runs on the client, and
 * only reacts when the browser reports an installed/standalone window.
 */

// Top-level routes that make the most sense to hand over to the app shell when
// the PWA is launched from a home-screen shortcut.
export const APP_ENTRY_ROUTES = ['/', '/landing', '/dashboard'] as const
export const APP_HOME = '/app'

const isStandalone = ref(false)
let bound = false

function detectStandalone(): boolean {
  if (!import.meta.client) return false
  const matches = (query: string) => {
    try {
      return window.matchMedia(query).matches
    } catch {
      return false
    }
  }
  return (
    matches('(display-mode: standalone)') ||
    matches('(display-mode: minimal-ui)') ||
    matches('(display-mode: window-controls-overlay)') ||
    // iOS Safari exposes its own flag instead of the display-mode media query.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isAppEntryRoute(path: string): boolean {
  return (APP_ENTRY_ROUTES as readonly string[]).includes(path)
}

export function resolveAppEntryRoute(path: string, query: LocationQuery): string | undefined {
  // Only the worksheet deep link belongs in the app shell; leave the ordinary
  // desktop report form (and other tab values) on its existing route.
  if (path === '/daily-reports' && query.tab === 'sheet') return '/app/daily-reports'
  if (isAppEntryRoute(path)) return APP_HOME
  return undefined
}

export function usePwaApp() {
  const init = () => {
    if (!import.meta.client || bound) return
    bound = true
    isStandalone.value = detectStandalone()
    const mql = window.matchMedia('(display-mode: standalone)')
    mql.addEventListener?.('change', () => {
      isStandalone.value = detectStandalone()
    })
  }

  return {
    isStandalone,
    isAppEntryRoute,
    resolveAppEntryRoute,
    detectStandalone,
    init,
  }
}
