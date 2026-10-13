import { computed } from 'vue'

/**
 * Boot splash controller for the installable app shell.
 *
 * The splash is rendered as part of the server-rendered layout markup, so it
 * paints before hydration and fully covers the first-frame flicker of an
 * installed PWA cold start. `start()` runs an honest progress ramp that eases
 * toward a soft cap while the boot signals (fonts, router, window load) settle;
 * `finish()` drives it to 100% and then hides the overlay.
 */

export const SPLASH_STATUS_COUNT = 5

// Keep the splash on screen just long enough to feel intentional, but never so
// long that it becomes a tax on a fast device.
const MIN_VISIBLE_MS = 900
const MAX_VISIBLE_MS = 4200
const SOFT_CAP = 92
const EXIT_DELAY_MS = 240
const TICK_MS = 90

export function useSplash() {
  // Shared (SSR-safe) state: the server renders it visible so the very first
  // paint is the branded splash rather than a blank shell.
  const visible = useState('app-splash:visible', () => true)
  const progress = useState('app-splash:progress', () => 6)
  const statusIndex = useState('app-splash:status', () => 0)

  let startedAt = 0
  let finished = false
  let ticker: ReturnType<typeof setTimeout> | null = null
  let maxTimer: ReturnType<typeof setTimeout> | null = null
  const pending: ReturnType<typeof setTimeout>[] = []

  const clearTimers = () => {
    if (ticker) {
      clearTimeout(ticker)
      ticker = null
    }
    if (maxTimer) {
      clearTimeout(maxTimer)
      maxTimer = null
    }
  }

  const finish = () => {
    if (!import.meta.client || finished || !startedAt) return
    finished = true
    clearTimers()

    const elapsed = Date.now() - startedAt
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)

    pending.push(
      setTimeout(() => {
        statusIndex.value = SPLASH_STATUS_COUNT - 1
        progress.value = 100
        pending.push(setTimeout(() => {
          visible.value = false
        }, EXIT_DELAY_MS))
      }, wait),
    )
  }

  const start = () => {
    if (!import.meta.client || startedAt) return
    startedAt = Date.now()
    finished = false

    // A fresh look whenever a new shell session begins.
    progress.value = Math.min(progress.value, 6)
    statusIndex.value = 0

    const step = () => {
      if (finished) return
      const remaining = SOFT_CAP - progress.value
      progress.value = Math.min(SOFT_CAP, progress.value + Math.max(remaining * 0.05, 0.15))
      statusIndex.value = Math.min(
        SPLASH_STATUS_COUNT - 1,
        Math.floor((progress.value / SOFT_CAP) * SPLASH_STATUS_COUNT),
      )
      ticker = setTimeout(step, TICK_MS)
    }

    step()
    // Absolute ceiling: the shell must always become usable, even if a boot
    // signal never resolves.
    maxTimer = setTimeout(finish, MAX_VISIBLE_MS)
  }

  const stop = () => {
    clearTimers()
    pending.forEach((t) => clearTimeout(t))
    pending.length = 0
  }

  const ready = computed(() => !visible.value)

  return {
    visible,
    progress,
    statusIndex,
    ready,
    start,
    finish,
    stop,
  }
}
