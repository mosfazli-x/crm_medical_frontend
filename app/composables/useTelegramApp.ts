const SDK_URL = 'https://telegram.org/js/telegram-web-app.js'
const THEME_MAP: Record<string, string> = {
  bg_color: '--tg-bg',
  secondary_bg_color: '--tg-sec-bg',
  text_color: '--tg-text',
  hint_color: '--tg-hint',
  link_color: '--tg-link',
  button_color: '--tg-btn',
  button_text_color: '--tg-btn-text',
  header_bg_color: '--tg-header-bg',
  section_bg_color: '--tg-section-bg',
  accent_text_color: '--tg-accent',
  destructive_text_color: '--tg-destructive',
}

function loadSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const anyWin = window as any
  if (anyWin.Telegram?.WebApp) return Promise.resolve()

  return new Promise((resolve) => {
    let script = document.querySelector<HTMLScriptElement>('script[data-tg-sdk]')
    if (!script) {
      script = document.createElement('script')
      script.src = SDK_URL
      script.dataset.tgSdk = 'true'
      script.async = true
      document.head.appendChild(script)
    }
    script.onload = () => resolve()
    script.onerror = () => resolve()
  })
}

export const useTelegramApp = () => {
  const webApp = useState<any | null>('tg-webapp', () => null)
  const sdkReady = ref(false)

  const getWebApp = (): any | null => {
    if (import.meta.client) {
      const t = (window as any)?.Telegram?.WebApp
      if (t && !webApp.value) webApp.value = t
      return webApp.value || t || null
    }
    return null
  }

  const isTelegram = computed(() => {
    return import.meta.client ? !!getWebApp() : false
  })

  const initData = computed(() => {
    if (!import.meta.client) return ''
    const fromQuery = new URLSearchParams(window.location.search).get('tg_init_data')
    if (fromQuery) return fromQuery
    const dev = localStorage.getItem('tg_dev_init_data')
    if (dev) return dev
    return getWebApp()?.initData || ''
  })

  const telegramUser = computed<any | null>(() => {
    const raw = initData.value
    if (!raw) return null
    const params = new URLSearchParams(raw)
    const user = params.get('user')
    if (!user) return null
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  })

  const applyTheme = (params: Record<string, string>) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    for (const [key, cssVar] of Object.entries(THEME_MAP)) {
      if (params[key]) {
        root.style.setProperty(cssVar, params[key])
      }
    }
  }

  const setup = async () => {
    if (!import.meta.client) return
    await loadSdk()
    sdkReady.value = true
    const app = getWebApp()
    if (!app) return

    applyTheme(app.themeParams || {})
    if (app.colorScheme?.toLowerCase?.() === 'dark') {
      document.documentElement.classList.add('dark')
    }

    try {
      app.ready?.()
      app.expand?.()
      app.setHeaderColor?.(app.themeParams?.header_bg_color || app.backgroundColor || '#ffffff')
      app.setBackgroundColor?.(app.themeParams?.bg_color || '#ffffff')
      app.enableClosingConfirmation?.()
    } catch {
      /* noop */
    }
  }

  const setBackButton = (visible: boolean, onPress?: () => void) => {
    if (!import.meta.client) return
    const app = getWebApp()
    if (!app?.BackButton) return
    try {
      if (onPress) {
        app.BackButton.offClick()
        app.BackButton.onClick(onPress)
      }
      if (visible) {
        app.BackButton.show()
      } else {
        app.BackButton.hide()
      }
    } catch {
      /* noop */
    }
  }

  const showAlert = (message: string, callback?: () => void) => {
    const app = getWebApp()
    if (app?.showAlert) {
      try {
        app.showAlert({ message, callback })
        return
      } catch {
        /* fall through */
      }
    }
    window.alert(message)
    callback?.()
  }

  return {
    webApp,
    sdkReady,
    isTelegram,
    initData,
    telegramUser,
    setup,
    setBackButton,
    showAlert,
  }
}
