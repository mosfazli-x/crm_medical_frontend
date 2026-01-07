import { computed, watch, onMounted } from 'vue'

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    sameSite: 'lax',
  })
  const user = useState<any>('auth_user', () => null)

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

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response: any = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
        baseURL: useRuntimeConfig().public.apiBase,
      })
      if (response.success) {
        token.value = response.token
        user.value = response.user
        await navigateTo('/')
        useNuxtApp().$toast.success('خوش آمدید!')
      }
    } catch (err: any) {
      useNuxtApp().$toast.error(err.data?.error || 'خطا در ورود')
    }
  }

  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      const response: any = await $fetch('/api/auth/register', {
        method: 'POST',
        body: data,
        baseURL: useRuntimeConfig().public.apiBase,
      })
      if (response.success) {
        token.value = response.token
        user.value = response.user
        await navigateTo('/')
        useNuxtApp().$toast.success('کاربر با موفقیت ساخته شد!')
      }
    } catch (err: any) {
      useNuxtApp().$toast.error(err.data?.error || 'خطا در ثبت‌نام')
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    navigateTo('/auth/login')
    useNuxtApp().$toast.info('با موفقیت خارج شدید')
  }

  const isAuthenticated = computed(() => {
    return !!token.value
  })

  return { token, user, login, register, logout, isAuthenticated }
}