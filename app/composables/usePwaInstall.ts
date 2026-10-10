import { computed, ref } from 'vue'

/**
 * Custom install prompt plumbing for the clinic PWA.
 *
 * The @vite-pwa/nuxt module owns the manifest + service worker; this
 * composable owns the *install* experience so we can present a branded,
 * first-visit dialog instead of the browser's default mini-infobar.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => Promise<void>
}

const DISMISS_KEY = 'hhc.pwa.install.dismissed.v1'
const INSTALLED_KEY = 'hhc.pwa.installed.v1'

// Routes that greet first-time visitors with the install invite.
const ELIGIBLE_ROUTES = ['/', '/landing', '/dashboard']

function isEligiblePath(path: string) {
  return ELIGIBLE_ROUTES.includes(path) || path.startsWith('/dashboard/')
}

// Re-ask politely a week after a "later" choice.
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 7

// ── Module-level singleton (client only) ────────────────────────────────
let deferredPrompt: BeforeInstallPromptEvent | null = null
let bound = false

const canInstall = ref(false)
const isInstalled = ref(false)
const isIos = ref(false)
const isIosSafari = ref(false)
const isAndroid = ref(false)
const dismissedForever = ref(false)
const snoozedUntil = ref(0)

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeWrite(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage disabled — ignore */
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage disabled — ignore */
  }
}

function refreshDismissal() {
  dismissedForever.value = safeRead(DISMISS_KEY) === 'forever'

  const raw = safeRead(DISMISS_KEY)
  if (raw && raw.startsWith('until:')) {
    snoozedUntil.value = Number(raw.slice(6)) || 0
  } else {
    snoozedUntil.value = 0
  }

  if (safeRead(INSTALLED_KEY) === '1') isInstalled.value = true
}

function detectDevice() {
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  const touchMac = /Mac/.test(platform) && 'ontouchend' in document
  const ios = /iphone|ipad|ipod/i.test(ua) || touchMac

  isIos.value = ios
  isAndroid.value = /android/i.test(ua)
  isIosSafari.value = ios && /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua)

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true

  if (standalone) {
    isInstalled.value = true
    safeWrite(INSTALLED_KEY, '1')
  }
}

function onBeforeInstallPrompt(e: Event) {
  // Suppress the browser's own mini-infobar — we render the invite ourselves.
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  canInstall.value = true
  // The app is installable again (fresh install or after uninstall) — if a
  // stale "installed" flag lingers, clear it so the invite can reappear.
  if (isInstalled.value) {
    isInstalled.value = false
    safeRemove(INSTALLED_KEY)
  }
}

function onAppInstalled() {
  deferredPrompt = null
  canInstall.value = false
  isInstalled.value = true
  safeWrite(INSTALLED_KEY, '1')
  safeRemove(DISMISS_KEY)
}

function onDisplayModeChange(e: MediaQueryListEvent) {
  if (e.matches) {
    isInstalled.value = true
    safeWrite(INSTALLED_KEY, '1')
  }
}

/** Idempotent — safe to call from the client plugin before any component mounts. */
export function initPwaInstall() {
  if (!import.meta.client || bound) return
  bound = true

  detectDevice()
  refreshDismissal()

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)

  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener?.('change', onDisplayModeChange)
}

export function usePwaInstall() {
  initPwaInstall()

  const route = useRoute()

  const isEligibleRoute = computed(() => isEligiblePath(route.path))

  const isDismissed = computed(
    () => dismissedForever.value || (snoozedUntil.value > 0 && Date.now() < snoozedUntil.value)
  )

  /** Which flavour of invite to render, if the browser can install at all. */
  const mode = computed<'native' | 'ios' | null>(() => {
    if (isIos.value) return 'ios'
    if (canInstall.value) return 'native'
    return null
  })

  const shouldShow = computed(
    () =>
      import.meta.client &&
      isEligibleRoute.value &&
      !isInstalled.value &&
      !isDismissed.value &&
      mode.value !== null
  )

  async function install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) return 'unavailable'

    const evt = deferredPrompt
    deferredPrompt = null
    canInstall.value = false

    await evt.prompt()
    const choice = await evt.userChoice
    if (choice.outcome === 'accepted') {
      safeWrite(INSTALLED_KEY, '1')
      safeRemove(DISMISS_KEY)
      isInstalled.value = true
    }
    return choice.outcome
  }

  /** "Later" — hides the invite for a week. */
  function snooze() {
    const until = Date.now() + SNOOZE_MS
    snoozedUntil.value = until
    safeWrite(DISMISS_KEY, `until:${until}`)
  }

  /** "Never ask again" — permanent opt-out on this device. */
  function dismissForever() {
    dismissedForever.value = true
    safeWrite(DISMISS_KEY, 'forever')
  }

  /** Re-enable the invite (used from settings/troubleshooting). */
  function reset() {
    dismissedForever.value = false
    snoozedUntil.value = 0
    safeRemove(DISMISS_KEY)
  }

  return {
    init: initPwaInstall,
    canInstall,
    isInstalled,
    isIos,
    isIosSafari,
    isAndroid,
    isEligibleRoute,
    isDismissed,
    mode,
    shouldShow,
    install,
    snooze,
    dismissForever,
    reset,
  }
}
