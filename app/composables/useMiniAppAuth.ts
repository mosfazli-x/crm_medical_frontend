const TOKEN_KEY = 'tg_auth_token'
const USER_KEY = 'tg_auth_user'

export interface MiniAppUser {
  id: string
  fullName: string | null
  role: string
  patientId: string | null
}

export interface TelegramUserInfo {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export const useMiniAppAuth = () => {
  const token = useState<string | null>('tg-auth-token', () => null)
  const user = useState<MiniAppUser | null>('tg-auth-user', () => null)
  const telegramUser = useState<TelegramUserInfo | null>('tg-telegram-user', () => null)
  const loading = ref(false)

  const persistSession = (t: string | null, u: MiniAppUser | null, tg?: TelegramUserInfo | null) => {
    token.value = t
    user.value = u
    if (tg !== undefined) telegramUser.value = tg
    if (import.meta.client) {
      if (t) {
        localStorage.setItem(TOKEN_KEY, t)
        localStorage.setItem(USER_KEY, JSON.stringify(u))
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
  }

  const hydrate = () => {
    if (!import.meta.client) return
    const t = localStorage.getItem(TOKEN_KEY)
    const u = localStorage.getItem(USER_KEY)
    if (t) token.value = t
    if (u) {
      try {
        user.value = JSON.parse(u)
      } catch {
        user.value = null
      }
    }
  }

  const api = async <T>(url: string, options: Record<string, any> = {}): Promise<T> => {
    const headers: Record<string, string> = {
      ...(token.value ? { authorization: `Bearer ${token.value}` } : {}),
      ...(options.headers || {}),
    }
    try {
      return await $fetch<T>(url, {
        baseURL: useRuntimeConfig().public.apiBase || '',
        ...options,
        headers,
      })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        persistSession(null, null, undefined)
      }
      throw err
    }
  }

  const autoLogin = async (rawInitData: string): Promise<{ needsLogin: boolean; telegramUser?: TelegramUserInfo }> => {
    loading.value = true
    try {
      if (!rawInitData) {
        return { needsLogin: true }
      }
      const res = await api<any>('/api/miniapp/auth/login', {
        method: 'POST',
        body: { initData: rawInitData },
      })
      if (res.success && res.token) {
        persistSession(res.token, res.user, res.telegramUser || null)
        return { needsLogin: false, telegramUser: res.telegramUser }
      }
      persistSession(null, null, res.telegramUser || null)
      return { needsLogin: true, telegramUser: res.telegramUser }
    } finally {
      loading.value = false
    }
  }

  const login = async (phone: string, password: string, rawInitData?: string): Promise<{ ok: boolean; error?: string }> => {
    loading.value = true
    try {
      const res = await api<any>('/api/miniapp/auth/phone-login', {
        method: 'POST',
        body: { phone, password, ...(rawInitData ? { initData: rawInitData } : {}) },
      })
      if (res.success && res.token) {
        persistSession(res.token, res.user, res.telegramUser || null)
        return { ok: true }
      }
      return { ok: false, error: res.error || 'نام کاربری یا رمز عبور اشتباه است' }
    } catch (err: any) {
      return {
        ok: false,
        error: err?.data?.error || (err?.response?.status === 401 ? 'نام کاربری یا رمز عبور اشتباه است' : 'خطا در ارتباط با سرور'),
      }
    } finally {
      loading.value = false
    }
  }

  const refreshToken = (newToken: string, newUser: MiniAppUser) => {
    persistSession(newToken, newUser, undefined)
  }

  const logout = () => {
    persistSession(null, null, undefined)
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    token,
    user,
    telegramUser,
    loading,
    isAuthenticated,
    hydrate,
    api,
    autoLogin,
    login,
    refreshToken,
    logout,
  }
}
