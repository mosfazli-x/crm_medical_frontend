import type {
  BroadcastDeleteResponse,
  BroadcastDetailResponse,
  BroadcastDueResponse,
  BroadcastFormInput,
  BroadcastListResponse,
  BroadcastLogsResponse,
  BroadcastMutationResponse,
  BroadcastRunResponse,
  BroadcastUpdateInput,
} from '~/types/sms-broadcast'

export interface ListBroadcastFilters {
  page?: number
  limit?: number
  q?: string
  isActive?: boolean
}

export const useSmsBroadcasts = () => {
  const { apiFetch } = useApi()

  const listBroadcasts = (filters: ListBroadcastFilters = {}) => {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    if (filters.q && filters.q.trim()) params.q = filters.q.trim()
    if (filters.isActive !== undefined) params.isActive = String(filters.isActive)
    return apiFetch<BroadcastListResponse>('/api/sms-broadcast', { params })
  }

  const getBroadcast = (id: string) =>
    apiFetch<BroadcastDetailResponse>(`/api/sms-broadcast/${id}`)

  const createBroadcast = (input: BroadcastFormInput) =>
    apiFetch<BroadcastMutationResponse>('/api/sms-broadcast', {
      method: 'POST',
      body: input,
    })

  const updateBroadcast = (id: string, input: BroadcastUpdateInput) =>
    apiFetch<BroadcastMutationResponse>(`/api/sms-broadcast/${id}`, {
      method: 'PATCH',
      body: input,
    })

  const deleteBroadcast = (id: string) =>
    apiFetch<BroadcastDeleteResponse>(`/api/sms-broadcast/${id}`, { method: 'DELETE' })

  const runBroadcast = (id: string, force = false) =>
    apiFetch<BroadcastRunResponse>(`/api/sms-broadcast/${id}/run`, {
      method: 'POST',
      body: { force },
    })

  const runDueBroadcasts = () =>
    apiFetch<BroadcastDueResponse>('/api/sms-broadcast/run-due', { method: 'POST' })

  const getBroadcastLogs = (id: string, filters: ListBroadcastFilters = {}) => {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    return apiFetch<BroadcastLogsResponse>(`/api/sms-broadcast/${id}/logs`, { params })
  }

  return {
    listBroadcasts,
    getBroadcast,
    createBroadcast,
    updateBroadcast,
    deleteBroadcast,
    runBroadcast,
    runDueBroadcasts,
    getBroadcastLogs,
  }
}
