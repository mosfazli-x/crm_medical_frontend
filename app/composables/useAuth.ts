import { computed, watch, onMounted } from 'vue'
import type { User } from '~/types/user'

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    sameSite: 'lax',
  })
  const user = useState<User | null>('auth_user', () => null)
  // Lazy i18n translator: the composer may not be ready during early SSR.
  // Resolve on first successful call and keep it; never cache a failure.
  let _t: ((key: string) => string) | null = null
  const t = (key: string): string => {
    if (!_t) {
      try {
        _t = useI18n().t
      } catch {
        return key
      }
    }
    return _t(key)
  }

  onMounted(() => {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      if (storedToken) token.value = storedToken
      if (storedUser) user.value = JSON.parse(storedUser)
    }
  })

  watch(token, (newToken) => {
    if (process.client) {
      if (newToken) {
        localStorage.setItem('auth_token', newToken)
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        user.value = null
      }
    }
  })

  watch(user, (newUser) => {
    if (process.client && newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    }
  })

  // Resolves the message a Fastify/AppError response actually returned, so the
  // server's own (often localized) wording shows instead of a generic key.
  const resolveError = (err: any, fallbackKey: string): string => {
    const status = err?.status ?? err?.statusCode ?? err?.response?.status
    const data = err?.data ?? err?.response?.data
    const serverMessage =
      (typeof data?.error === 'string' && data.error !== 'Unknown error' && data.error) ||
      (typeof data?.message === 'string' && data.message) ||
      (Array.isArray(data?.details) && typeof data.details[0]?.message === 'string' &&
        data.details[0].message)

    if (err?.name === 'NetworkError' || (!process.server && !navigator.onLine)) {
      return t('auth.errors.networkError')
    }
    if (err?.code === 'ECONNABORTED') {
      return t('auth.errors.timeoutError')
    }
    if (status === 429) return t('auth.errors.rateLimited')
    if (status && status >= 500) return t('auth.errors.serverError')
    // 4xx validation & domain errors: the API includes the exact message.
    if (serverMessage) return serverMessage

    switch (status) {
      case 401:
        return t('auth.errors.invalidCredentials')
      case 403:
        return t('auth.errors.accountDisabled')
      case 409:
        return t('auth.errors.phoneExists')
      case 400:
        return t('auth.errors.invalidInput')
      default:
        return t(fallbackKey) || t('auth.errors.loginError') || fallbackKey
    }
  }

  const login = async (credentials: { phone: string; password: string }) => {
    try {
      const response: any = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
        baseURL: useRuntimeConfig().public.apiBase,
      })
      if (response.success) {
        token.value = response.token
        user.value = response.user
        await navigateTo('/dashboard')
        useNuxtApp().$toast.success(t('auth.login.welcome'))
      } else {
        useNuxtApp().$toast.error(response.message || t('auth.errors.loginFailed'))
      }
    } catch (err: any) {
      useNuxtApp().$toast.error(resolveError(err, 'auth.errors.loginError'))
    }
  }

  const register = async (data: { phone: string; fullName: string; password: string; role: string; website?: string }) => {
    try {
      const response: any = await $fetch('/api/auth/register', {
        method: 'POST',
        body: data,
        baseURL: useRuntimeConfig().public.apiBase,
      })
      if (response.success) {
        const isApproved = response.user?.status === 'approved'
        useNuxtApp().$toast.success(isApproved ? t('auth.register.success') : t('auth.register.successPending'))
        await navigateTo('/auth/login')
      } else {
        useNuxtApp().$toast.error(response.message || t('auth.register.error'))
      }
    } catch (err: any) {
      useNuxtApp().$toast.error(resolveError(err, 'auth.register.error'))
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
          baseURL: useRuntimeConfig().public.apiBase,
        })
      }
    } catch {
      // Silently fail - still proceed with local logout
    }
    token.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    navigateTo('/auth/login')
    useNuxtApp().$toast.info(t('auth.loggedOut'))
  }

  const isAuthenticated = computed(() => {
    return !!token.value
  })

  return { token, user, login, register, logout, isAuthenticated }
}