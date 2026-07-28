import { ref, onMounted } from 'vue'

/**
 * Lightweight theme toggle for the immersive landing page.
 * Uses `data-theme="light"` on <html> to swap CSS variables.
 * Persists preference to localStorage.
 */
export function useLandingTheme() {
  const isLight = ref(false)
  let initialized = false

  function applyTheme() {
    if (typeof document === 'undefined') return
    if (isLight.value) {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  function toggleTheme() {
    isLight.value = !isLight.value
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('landing-theme', isLight.value ? 'light' : 'dark')
    }
    applyTheme()
  }

  function initTheme() {
    if (initialized) return
    initialized = true
    if (typeof localStorage === 'undefined') return

    const saved = localStorage.getItem('landing-theme')
    if (saved === 'light') {
      isLight.value = true
    } else if (saved === 'dark') {
      isLight.value = false
    } else {
      isLight.value = !window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  return {
    isLight,
    toggleTheme,
    initTheme,
  }
}
