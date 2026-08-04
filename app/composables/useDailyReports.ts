import type {
  DailyReport,
  DailyReportListFilters,
  DailyReportPayload,
  DailyReportStats,
  DailyReportVisitType,
  DailyReportVisitTypePayload,
  PatientOption,
} from '~/types/report'

const toQuery = (filters: Record<string, string | number | undefined | null>) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const useDailyReports = () => {
  const { apiFetch } = useApi()

  const listPatients = () => apiFetch<{ success: boolean; data: PatientOption[] }>('/api/patients')

  const listVisitTypes = (includeInactive = false) =>
    apiFetch<{ success: boolean; data: DailyReportVisitType[] }>(
      `/api/daily-reports/visit-types${includeInactive ? '?includeInactive=true' : ''}`
    )

  const listReports = (filters: DailyReportListFilters = {}) =>
    apiFetch<{ success: boolean; data: DailyReport[] }>(
      `/api/daily-reports${toQuery({ ...filters })}`
    )

  const listStats = (filters: DailyReportListFilters = {}) =>
    apiFetch<{ success: boolean; data: DailyReportStats }>(
      `/api/daily-reports/stats${toQuery({ ...filters })}`
    )

  const createReport = (body: DailyReportPayload) =>
    apiFetch<{ success: boolean; data: DailyReport }>('/api/daily-reports', { method: 'POST', body })

  const deleteReport = (id: string) =>
    apiFetch<{ success: boolean }>(`/api/daily-reports/${id}`, { method: 'DELETE' })

  const createVisitType = (body: DailyReportVisitTypePayload) =>
    apiFetch<{ success: boolean; data: DailyReportVisitType }>('/api/daily-reports/visit-types', { method: 'POST', body })

  const updateVisitType = (id: string, body: Partial<DailyReportVisitTypePayload> & { isActive?: boolean }) =>
    apiFetch<{ success: boolean; data: DailyReportVisitType }>(`/api/daily-reports/visit-types/${id}`, { method: 'PUT', body })

  const deleteVisitType = (id: string) =>
    apiFetch<{ success: boolean }>(`/api/daily-reports/visit-types/${id}`, { method: 'DELETE' })

  return {
    listPatients,
    listVisitTypes,
    listReports,
    listStats,
    createReport,
    deleteReport,
    createVisitType,
    updateVisitType,
    deleteVisitType,
  }
}
