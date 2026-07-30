import { computed, watch, onMounted } from 'vue'
import type { User } from '~/types/user'

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    sameSite: 'lax',
  })
  const user = useState<User | null>('auth_user', () => null)
  let _t: ((key: string) => string) | null = null
  let _tFailed = false
  const t = (key: string) => {
    if (!_t && !_tFailed) {
      try {
        _t = useI18n().t
      } catch {
        _tFailed = true
        return key
      }
    }
    return _t ? _t(key) : key
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
      const status = err?.response?.status

      let message: string
      if (err?.name === 'NetworkError' || (!process.server && !navigator.onLine)) {
        message = t('auth.errors.networkError')
      } else if (status === 401) {
        message = t('auth.errors.invalidCredentials')
      } else if (status === 403) {
        message = t('auth.errors.accountDisabled')
      } else if (status === 422) {
        message = err.data?.error || t('auth.errors.invalidInput')
      } else if (status === 429) {
        message = t('auth.errors.rateLimited')
      } else if (status && status >= 500) {
        message = t('auth.errors.serverError')
      } else if (err?.code === 'ECONNABORTED') {
        message = t('auth.errors.timeoutError')
      } else {
        message = err.data?.error || t('auth.errors.loginError')
      }

      useNuxtApp().$toast.error(message)
    }
  }

  const register = async (data: { phone: string; fullName: string; password: string; role: string }) => {
    try {
      const response: any = await $fetch('/api/auth/register', {
        method: 'POST',
        body: data,
        baseURL: useRuntimeConfig().public.apiBase,
      })
      if (response.success) {
        await navigateTo('/auth/login')
        useNuxtApp().$toast.success(t('auth.register.success'))
      }
    } catch (err: any) {
      useNuxtApp().$toast.error(err.data?.error || t('auth.register.error'))
    }
  }

  const logout = () => {
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