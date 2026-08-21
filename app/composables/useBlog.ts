export const useBlog = () => {
  const { apiFetch } = useApi()

  // ─── Public ─────────────────────────────────────────

  const listPublishedPosts = async (page = 1, limit = 12, categoryId?: string) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (categoryId) params.set('category_id', categoryId)
      const result = await apiFetch(`/api/blog?${params.toString()}`) as { success: boolean; data: any[]; pagination: any }
      return { data: result.data || [], pagination: result.pagination }
    } catch {
      return { data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } }
    }
  }

  const getPostBySlug = async (slug: string) => {
    try {
      const result = await apiFetch(`/api/blog/${slug}`) as { success: boolean; data: any }
      return result.data
    } catch {
      return null
    }
  }

  const getApprovedComments = async (postId: string) => {
    try {
      const result = await apiFetch(`/api/blog/${postId}/comments`) as { success: boolean; data: any[] }
      return result.data || []
    } catch {
      return []
    }
  }

  const submitComment = async (postId: string, dto: { author_name: string; author_email: string; content: string }) => {
    const result = await apiFetch(`/api/blog/${postId}/comments`, {
      method: 'POST',
      body: dto,
    }) as { success: boolean; data: any }
    return result.data
  }

  const listCategories = async () => {
    try {
      const result = await apiFetch('/api/blog/categories') as { success: boolean; data: any[] }
      return result.data || []
    } catch {
      return []
    }
  }

  // ─── Admin ──────────────────────────────────────────

  const listAllPosts = async (page = 1, limit = 20) => {
    try {
      const result = await apiFetch(`/api/blog/admin/posts?page=${page}&limit=${limit}`) as { success: boolean; data: any[]; pagination: any }
      return { data: result.data || [], pagination: result.pagination }
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    }
  }

  const createPost = async (dto: any) => {
    const result = await apiFetch('/api/blog/posts', {
      method: 'POST',
      body: dto,
    }) as { success: boolean; data: any }
    return result.data
  }

  const updatePost = async (id: string, dto: any) => {
    const result = await apiFetch(`/api/blog/posts/${id}`, {
      method: 'PATCH',
      body: dto,
    }) as { success: boolean; data: any }
    return result.data
  }

  const deletePost = async (id: string) => {
    const result = await apiFetch(`/api/blog/posts/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return result.data
  }

  const listAllComments = async (page = 1, limit = 20, status?: string) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set('status', status)
      const result = await apiFetch(`/api/blog/admin/comments?${params.toString()}`) as { success: boolean; data: any[]; pagination: any }
      return { data: result.data || [], pagination: result.pagination }
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    }
  }

  const updateCommentStatus = async (id: string, status: string) => {
    const result = await apiFetch(`/api/blog/admin/comments/${id}`, {
      method: 'PATCH',
      body: { status },
    }) as { success: boolean; data: any }
    return result.data
  }

  const deleteComment = async (id: string) => {
    const result = await apiFetch(`/api/blog/admin/comments/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return result.data
  }

  const createCategory = async (dto: any) => {
    const result = await apiFetch('/api/blog/admin/categories', {
      method: 'POST',
      body: dto,
    }) as { success: boolean; data: any }
    return result.data
  }

  const deleteCategory = async (id: string) => {
    const result = await apiFetch(`/api/blog/admin/categories/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return result.data
  }

  return {
    listPublishedPosts,
    getPostBySlug,
    getApprovedComments,
    submitComment,
    listCategories,
    listAllPosts,
    createPost,
    updatePost,
    deletePost,
    listAllComments,
    updateCommentStatus,
    deleteComment,
    createCategory,
    deleteCategory,
  }
}
