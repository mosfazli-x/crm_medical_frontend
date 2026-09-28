export type BlogPostSort = 'newest' | 'oldest' | 'title' | 'views'
export type BlogPostStatusFilter = 'published' | 'draft'
export type BlogCommentStatus = 'pending' | 'approved' | 'rejected'

export interface ListAllPostsFilters {
  q?: string
  status?: BlogPostStatusFilter
  /** 'none' matches posts with no category. */
  categoryId?: string
  sort?: BlogPostSort
}

export interface ListAllCommentsFilters {
  q?: string
  status?: BlogCommentStatus
  /** 'oldest' surfaces the longest-waiting moderation queue first. */
  sort?: 'newest' | 'oldest'
}

export interface BlogComment {
  id: string
  postId: string
  authorName: string
  authorEmail: string
  content: string
  status: BlogCommentStatus
  createdAt: string
  /** Null when the article was deleted between submission and review. */
  postTitle: string | null
  postSlug: string | null
}

export interface BlogAdminStats {
  posts: {
    total: number
    published: number
    drafts: number
    uncategorized: number
    totalViews: number
  }
  comments: {
    pending: number
    approved: number
    rejected: number
  }
  categories: number
}

export const useBlog = () => {
  const { apiFetch } = useApi()

  /**
   * `apiFetch` resolves `{}` after a 401/403 redirect, and a rejected request
   * can also resolve `{ success: false }`, so a resolved promise is never proof
   * that a write happened. Mutations unwrap so callers can report real results.
   */
  const unwrap = <T>(result: { success?: boolean; data?: T }): T => {
    if (!result?.success) throw new Error('The request was not completed')
    return result.data as T
  }

  const commentParams = (page: number, limit: number, filters: ListAllCommentsFilters): string => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (filters.q?.trim()) params.set('q', filters.q.trim())
    if (filters.status) params.set('status', filters.status)
    if (filters.sort) params.set('sort', filters.sort)
    return params.toString()
  }

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

  const listAllPosts = async (page = 1, limit = 20, filters: ListAllPostsFilters = {}) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (filters.q?.trim()) params.set('q', filters.q.trim())
      if (filters.status) params.set('status', filters.status)
      if (filters.categoryId) params.set('category_id', filters.categoryId)
      if (filters.sort) params.set('sort', filters.sort)
      const result = await apiFetch(`/api/blog/admin/posts?${params.toString()}`) as { success: boolean; data: any[]; pagination: any }
      return { data: result.data || [], pagination: result.pagination }
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    }
  }

  /** Aggregate counters for the admin header. */
  const getAdminStats = async () => {
    const result = await apiFetch('/api/blog/admin/stats') as { success: boolean; data: BlogAdminStats }
    return result.success ? result.data : null
  }

  /**
   * Full post for editing. Uses the admin endpoint rather than the public
   * slug route, which would increment the post's public view count.
   */
  const getPostById = async (id: string) => {
    const result = await apiFetch(`/api/blog/admin/posts/${id}`) as { success: boolean; data: any }
    return result.success ? result.data : null
  }

  const createPost = async (dto: any) => {
    const result = await apiFetch('/api/blog/posts', {
      method: 'POST',
      body: dto,
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  const updatePost = async (id: string, dto: any) => {
    const result = await apiFetch(`/api/blog/posts/${id}`, {
      method: 'PATCH',
      body: dto,
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  const deletePost = async (id: string) => {
    const result = await apiFetch(`/api/blog/posts/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  const listAllComments = async (page = 1, limit = 20, filters: ListAllCommentsFilters = {}) => {
    const result = await apiFetch(`/api/blog/admin/comments?${commentParams(page, limit, filters)}`) as {
      success: boolean
      data: BlogComment[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }
    return { data: unwrap(result), pagination: result.pagination }
  }

  const updateCommentStatus = async (id: string, status: BlogCommentStatus) => {
    const result = await apiFetch(`/api/blog/admin/comments/${id}`, {
      method: 'PATCH',
      body: { status },
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  const deleteComment = async (id: string) => {
    const result = await apiFetch(`/api/blog/admin/comments/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  const createCategory = async (dto: any) => {
    const result = await apiFetch('/api/blog/admin/categories', {
      method: 'POST',
      body: dto,
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  const deleteCategory = async (id: string) => {
    const result = await apiFetch(`/api/blog/admin/categories/${id}`, {
      method: 'DELETE',
    }) as { success: boolean; data: any }
    return unwrap(result)
  }

  return {
    listPublishedPosts,
    getPostBySlug,
    getPostById,
    getApprovedComments,
    submitComment,
    listCategories,
    listAllPosts,
    getAdminStats,
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
