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
        await navigateTo('/dashboard')
        useNuxtApp().$toast.success('خوش آمدید!')
      } else {
        useNuxtApp().$toast.error(response.message || 'ورود ناموفق بود')
      }
    } catch (err: any) {
      const status = err?.response?.status

      let message: string
      if (err?.name === 'NetworkError' || (!process.server && !navigator.onLine)) {
        message = 'خطا در اتصال به سرور. اتصال اینترنت خود را بررسی کنید'
      } else if (status === 401) {
        message = 'ایمیل یا رمز عبور اشتباه است'
      } else if (status === 403) {
        message = 'حساب کاربری شما غیرفعال شده است'
      } else if (status === 422) {
        message = err.data?.error || 'اطلاعات وارد شده معتبر نیست'
      } else if (status === 429) {
        message = 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد تلاش کنید'
      } else if (status && status >= 500) {
        message = 'خطای سرور. لطفاً چند لحظه بعد دوباره تلاش کنید'
      } else if (err?.code === 'ECONNABORTED') {
        message = 'مدت زمان پاسخ‌دهی سرور به پایان رسید. دوباره تلاش کنید'
      } else {
        message = err.data?.error || 'خطا در ورود به سیستم'
      }

      useNuxtApp().$toast.error(message)
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
        await navigateTo('/dashboard')
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