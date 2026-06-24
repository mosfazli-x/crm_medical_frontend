export const useApi = () => {
  const { token, logout } = useAuth()
  const nuxtApp = useNuxtApp()

  const apiFetch = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    const headers = {
      Authorization: token.value ? `Bearer ${token.value}` : '',
      ...options.headers,
    }

    try {
      return await $fetch<T>(url, {
        baseURL: useRuntimeConfig().public.apiBase,
        ...options,
        headers,
      })
    } catch (err: any) {
      console.error('API Error:', err)

      const status = err.response?.status || err.status || err.data?.status

      if (status === 401) {
        nuxtApp.$toast.error('جلسه شما منقضی شده — لطفاً دوباره وارد شوید')
        logout()
        await navigateTo('/auth/login')
        return {} as T
      }

      if (status === 403) {
        nuxtApp.$toast.error('دسترسی ممنوع — نقش کافی نیست')
        await navigateTo('/dashboard')
        return {} as T
      }

      nuxtApp.$toast.error(err.data?.error || 'خطای سرور — بعداً امتحان کنید')
      throw err
    }
  }

  return { apiFetch }
}