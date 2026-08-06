import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

/**
 * Landing ambient-music player.
 *
 * Follows the site's browser autoplay reality: music with sound can never be
 * guaranteed to start without a user gesture. The player therefore:
 *  - attempts playback as soon as the page mounts (works where allowed);
 *  - if the browser blocks it, arms a one-tap fallback — the next pointer/key
 *    interaction anywhere on the page (except on the music control itself)
 *    starts the track. Events inside the control are ignored so the control's
 *    own button keeps a single, clean click→play/click→pause toggle instead of
 *    double-firing through both the gesture handler and the button's click;
 *  - pauses while the tab is hidden and resumes on return;
 *  - remembers the visitor's last on/off choice and volume across visits;
 *  - never auto-plays or arms the one-tap fallback for visitors who prefer
 *    reduced motion — they start the track explicitly.
 *
 * All consumers share one module-level audio element and one set of document
 * listeners, so exactly one track plays no matter how many components mount.
 * Playback belongs to the landing page: when the last consumer unmounts the
 * element is released and the music stops.
 */

interface LandingMusicPref {
  v: number
  muted: boolean
  volume: number
}

const STORAGE_KEY = 'hasti.music.v1'
const DEFAULT_VOLUME = 0.65
const AUDIO_SRC = '/audio/ambient.mp3'

/* ------------------------------------------------------------------ */
/* Shared, client-only state                                           */
/* ------------------------------------------------------------------ */

const isPlaying = shallowRef(false)
const needsGesture = shallowRef(false)
const hasError = shallowRef(false)
const isReady = shallowRef(false)
const volume = shallowRef(DEFAULT_VOLUME)
const userMuted = shallowRef(false)

let audio: HTMLAudioElement | null = null
let mountedCount = 0
let initialized = false
let gestureArmed = false
let resumeOnReturn = false
let reducedMotion = false
let controlEl: HTMLElement | null = null

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

function loadPref(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as LandingMusicPref
    if (parsed && typeof parsed.v === 'number') {
      userMuted.value = Boolean(parsed.muted)
      const next = Number(parsed.volume)
      volume.value = Number.isFinite(next) ? Math.min(1, Math.max(0, next)) : DEFAULT_VOLUME
    }
  } catch {
    /* corrupted storage — keep defaults */
  }
}

function savePref(): void {
  if (typeof window === 'undefined') return
  try {
    const pref: LandingMusicPref = { v: 1, muted: userMuted.value, volume: volume.value }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pref))
  } catch {
    /* storage unavailable (private mode, quota) — music still works */
  }
}

/* ------------------------------------------------------------------ */
/* Audio element                                                       */
/* ------------------------------------------------------------------ */

function ensureAudio(): HTMLAudioElement | null {
  if (audio) return audio
  if (typeof document === 'undefined') return null
  const el = new Audio()
  el.src = AUDIO_SRC
  el.loop = true
  el.preload = 'auto'
  el.style.display = 'none'
  el.addEventListener('canplay', () => {
    isReady.value = true
  })
  el.addEventListener('error', () => {
    hasError.value = true
    needsGesture.value = false
  })
  el.addEventListener('playing', () => {
    isPlaying.value = true
    needsGesture.value = false
  })
  el.addEventListener('pause', () => {
    isPlaying.value = false
  })
  document.body.appendChild(el)
  audio = el
  return el
}

function applyVolume(): void {
  if (audio) audio.volume = userMuted.value ? 0 : volume.value
}

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

async function play(): Promise<boolean> {
  const el = ensureAudio()
  if (!el || hasError.value) return false
  try {
    await el.play()
    isPlaying.value = true
    needsGesture.value = false
    disarmGesture()
    userMuted.value = false
    savePref()
    return true
  } catch {
    armGesture()
    return false
  }
}

function pause(): void {
  const el = ensureAudio()
  if (!el) return
  el.pause()
  isPlaying.value = false
  userMuted.value = true
  savePref()
}

function toggle(): void {
  if (isPlaying.value) pause()
  else void play()
}

function setVolume(next: number): void {
  const v = Math.min(1, Math.max(0, next))
  volume.value = v
  if (v > 0) userMuted.value = false
  applyVolume()
  savePref()
}

/* ------------------------------------------------------------------ */
/* One-tap fallback                                                    */
/* ------------------------------------------------------------------ */

function eventInsideControl(e: Event): boolean {
  if (!controlEl) return false
  const target = e.target
  return target instanceof Node && controlEl.contains(target)
}

function onGesture(e: Event): void {
  if (eventInsideControl(e)) return
  void play()
}

function onGestureKeydown(e: KeyboardEvent): void {
  if (eventInsideControl(e)) return
  if (e.key === 'Enter' || e.key === ' ') onGesture(e)
}

function armGesture(): void {
  if (gestureArmed || typeof document === 'undefined') return
  gestureArmed = true
  needsGesture.value = true
  document.addEventListener('pointerdown', onGesture, { capture: true, passive: true })
  document.addEventListener('keydown', onGestureKeydown, { capture: true, passive: true })
}

function disarmGesture(): void {
  if (!gestureArmed || typeof document === 'undefined') return
  gestureArmed = false
  needsGesture.value = false
  document.removeEventListener('pointerdown', onGesture, { capture: true })
  document.removeEventListener('keydown', onGestureKeydown, { capture: true })
}

/* ------------------------------------------------------------------ */
/* Tab visibility                                                      */
/* ------------------------------------------------------------------ */

function handleVisibility(): void {
  if (typeof document === 'undefined') return
  if (document.visibilityState === 'hidden') {
    if (isPlaying.value) {
      resumeOnReturn = true
      audio?.pause()
    }
  } else if (resumeOnReturn) {
    resumeOnReturn = false
    void play()
  }
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

function init(): void {
  if (initialized || typeof document === 'undefined') return
  initialized = true
  loadPref()
  ensureAudio()
  applyVolume()
  document.addEventListener('visibilitychange', handleVisibility)
  reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!userMuted.value && !reducedMotion) {
    // Defer one frame so the element can start fetching; browsers that allow
    // autoplay will begin immediately, the rest fall into the one-tap state.
    window.setTimeout(() => {
      void play()
    }, 0)
  }
}

function registerControl(el: HTMLElement): void {
  controlEl = el
}

function unregisterControl(el: HTMLElement): void {
  if (controlEl === el) controlEl = null
}

function teardown(): void {
  if (!initialized) return
  initialized = false
  reducedMotion = false
  resumeOnReturn = false
  disarmGesture()
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibility)
  }
  audio?.pause()
  audio?.removeAttribute('src')
  audio?.load()
  audio?.parentNode?.removeChild(audio)
  audio = null
  controlEl = null
  isPlaying.value = false
  isReady.value = false
  needsGesture.value = false
  hasError.value = false
}

export function useLandingMusic() {
  onMounted(() => {
    mountedCount += 1
    if (mountedCount === 1) init()
  })

  onBeforeUnmount(() => {
    mountedCount -= 1
    if (mountedCount === 0) teardown()
  })

  return {
    isPlaying,
    needsGesture,
    hasError,
    isReady,
    volume,
    userMuted,
    toggle,
    setVolume,
    registerControl,
    unregisterControl,
  }
}
