import type {
  FollowUpFilters,
  FollowUpListResponse,
  FollowUpReminderResult,
  FollowUpSummary,
  FollowUpSweepStats,
} from '~/types/followup'

export const useFollowUps = () => {
  const { apiFetch } = useApi()

  const listFollowUps = (filters: FollowUpFilters = {}) => {
    const params: Record<string, string> = {}
    if (filters.window) params.window = filters.window
    if (filters.search && filters.search.trim()) params.search = filters.search.trim()
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    return apiFetch<FollowUpListResponse>('/api/visits/follow-ups', { params })
  }

  const getSummary = () =>
    apiFetch<{ success: boolean; data: FollowUpSummary }>('/api/visits/follow-ups/summary')

  const sendReminder = (visitId: string) =>
    apiFetch<{ success: boolean; data: FollowUpReminderResult }>(
      `/api/visits/${visitId}/follow-up-reminder`,
      { method: 'POST' }
    )

  const runSweep = () =>
    apiFetch<{ success: boolean; data: FollowUpSweepStats }>('/api/visits/follow-ups/run', {
      method: 'POST',
    })

  return { listFollowUps, getSummary, sendReminder, runSweep }
}
