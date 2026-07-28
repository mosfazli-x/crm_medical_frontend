import { ref, onMounted, onBeforeUnmount } from 'vue'

const isPlaying = ref(false)
const volume = ref(0.2)
const isReady = ref(false)
const userInteracted = ref(false)

let audioEl: HTMLAudioElement | null = null
const STORAGE_KEY = 'medvista-bg-music'

function loadPrefs() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const prefs = JSON.parse(raw)
      if (typeof prefs.volume === 'number') volume.value = prefs.volume
      if (typeof prefs.playing === 'boolean') isPlaying.value = prefs.playing
    }
  } catch {}
}

function savePrefs() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      volume: volume.value,
      playing: isPlaying.value,
    }))
  } catch {}
}

function createAudio() {
  if (audioEl || typeof Audio === 'undefined') return
  audioEl = new Audio('/audio/ambient.mp3')
  audioEl.loop = true
  audioEl.volume = volume.value
  audioEl.preload = 'auto'
  audioEl.addEventListener('canplaythrough', () => {
    isReady.value = true
  }, { once: true })
  audioEl.addEventListener('error', () => {
    isReady.value = false
  }, { once: true })
}

async function play() {
  if (!audioEl) createAudio()
  if (!audioEl) return
  try {
    audioEl.volume = volume.value
    await audioEl.play()
    isPlaying.value = true
    savePrefs()
  } catch {
    isPlaying.value = false
  }
}

function pause() {
  if (!audioEl) return
  audioEl.pause()
  isPlaying.value = false
  savePrefs()
}

function toggle() {
  if (!userInteracted.value) {
    userInteracted.value = true
  }
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function setVolume(v: number) {
  volume.value = Math.max(0, Math.min(1, v))
  if (audioEl) audioEl.volume = volume.value
  savePrefs()
}

export function useBackgroundMusic() {
  onMounted(() => {
    loadPrefs()
    createAudio()
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      isPlaying.value = false
      return
    }
    const onFirstInteraction = () => {
      if (isPlaying.value && audioEl && audioEl.paused) {
        play()
      }
      window.removeEventListener('click', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
    window.addEventListener('click', onFirstInteraction, { once: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true })
  })

  onBeforeUnmount(() => {
    if (audioEl) {
      audioEl.pause()
      audioEl.src = ''
      audioEl = null
    }
  })

  return {
    isPlaying,
    volume,
    isReady,
    toggle,
    setVolume,
  }
}
