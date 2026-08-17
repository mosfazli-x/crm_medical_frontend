export const useFaq = () => {
  const { apiFetch } = useApi()

  const searchFaq = async (query: string, language = 'fa', category?: string, limit = 5) => {
    try {
      const params = new URLSearchParams({ q: query, language, limit: String(limit) })
      if (category) params.set('category', category)
      const result = await apiFetch(`/api/faq/search?${params.toString()}`) as { success: boolean; data: any[] }
      return result.data || []
    } catch {
      return []
    }
  }

  const getFaqById = async (id: string) => {
    try {
      const result = await apiFetch(`/api/faq/${id}`) as { success: boolean; data: any }
      return result.data
    } catch {
      return null
    }
  }

  const listFaq = async (language = 'fa', category?: string, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({ language, page: String(page), limit: String(limit) })
      if (category) params.set('category', category)
      const result = await apiFetch(`/api/faq?${params.toString()}`) as { success: boolean; data: any[]; pagination: any }
      return { data: result.data || [], pagination: result.pagination }
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    }
  }

  const createFaq = async (dto: any) => {
    const result = await apiFetch('/api/faq', {
      method: 'POST',
      body: dto,
    }) as { success: boolean; data: any }
    return result.data
  }

  const updateFaq = async (id: string, dto: any) => {
    const result = await apiFetch(`/api/faq/${id}`, {
      method: 'PATCH',
      body: dto,
    }) as { success: boolean; data: any }
    return result.data
  }

  const approveFaq = async (id: string) => {
    const result = await apiFetch(`/api/faq/${id}/approve`, {
      method: 'PATCH',
    }) as { success: boolean; data: any }
    return result.data
  }

  const deleteFaq = async (id: string) => {
    const result = await apiFetch(`/api/faq/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return result.data
  }

  const getPendingApprovals = async (page = 1, limit = 20) => {
    try {
      const result = await apiFetch(`/api/faq/admin/pending?page=${page}&limit=${limit}`) as { success: boolean; data: any[]; pagination: any }
      return { data: result.data || [], pagination: result.pagination }
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    }
  }

  return {
    searchFaq,
    getFaqById,
    listFaq,
    createFaq,
    updateFaq,
    approveFaq,
    deleteFaq,
    getPendingApprovals,
  }
}
