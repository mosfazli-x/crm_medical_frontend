import { useTheme } from 'vuetify'

export const useThemeMode = () => {
  const isDark = useState('theme-mode', () => false)
  const vuetifyTheme = useTheme()

  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = savedTheme === 'dark' || (!savedTheme && prefersDark)
      setDarkMode(dark)
    }
  }

  const setDarkMode = (val: boolean) => {
    isDark.value = val
    if (process.client) {
      vuetifyTheme.global.name.value = val ? 'dark' : 'light'
      if (val) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }

  const toggleTheme = () => {
    setDarkMode(!isDark.value)
  }

  return {
    isDark,
    setDarkMode,
    toggleTheme,
    initTheme
  }
}
