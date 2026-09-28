type ApiFetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

export const useApi = () => {
  const { token, logout } = useAuth()
  const nuxtApp = useNuxtApp()
  const { t } = useI18n()

  const apiLoadingCount = useState<number>('api-loading-count', () => 0)

  const apiLoading = computed(() => apiLoadingCount.value > 0)

  const apiFetch = async <T>(url: string, options: ApiFetchOptions = {}): Promise<T> => {
    const headers = {
      Authorization: token.value ? `Bearer ${token.value}` : '',
      ...options.headers,
    }

    apiLoadingCount.value++
    try {
      return await $fetch<T>(url, {
        baseURL: useRuntimeConfig().public.apiBase,
        ...options,
        headers,
      })
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number }
        status?: number
        data?: { status?: number }
      }

      console.error('API Error:', err)

      const status = error.response?.status || error.status || error.data?.status

      if (status === 401) {
        nuxtApp.$toast.error(t('auth.errors.sessionExpired'))
        logout()
        await navigateTo('/auth/login')
        return {} as T
      }

      if (status === 403) {
        nuxtApp.$toast.error(t('auth.errors.accessDenied'))
        await navigateTo('/dashboard')
        return {} as T
      }

      throw err
    } finally {
      apiLoadingCount.value = Math.max(0, apiLoadingCount.value - 1)
    }
  }

  return { apiFetch, apiLoading }
}