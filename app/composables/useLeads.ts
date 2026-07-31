import type {
  Lead,
  LeadDetail,
  LeadFilters,
  LeadSource,
  LeadStatus,
  LeadsListResponse,
  LeadSummary,
} from '~/types/lead'

export const useLeads = () => {
  const { apiFetch } = useApi()

  const listLeads = (filters: LeadFilters = {}) => {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.sourceId) params.sourceId = filters.sourceId
    if (filters.tag) params.tag = filters.tag
    if (filters.q && filters.q.trim()) params.q = filters.q.trim()
    if (filters.dueFollowUp) params.dueFollowUp = filters.dueFollowUp
    if (filters.sort) params.sort = filters.sort
    return apiFetch<LeadsListResponse>('/api/leads', { params })
  }

  const getLead = (id: string) => apiFetch<{ success: boolean; data: LeadDetail }>(`/api/leads/${id}`)

  const getSummary = () => apiFetch<{ success: boolean; data: LeadSummary }>('/api/leads/summary')

  const listSources = (includeInactive = false) =>
    apiFetch<{ success: boolean; data: LeadSource[] }>('/api/lead-sources', {
      params: includeInactive ? { includeInactive: 'true' } : undefined,
    })

  const createLead = (body: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: Lead }>('/api/leads', { method: 'POST', body })

  const updateLead = (id: string, body: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: Lead }>(`/api/leads/${id}`, { method: 'PUT', body })

  const deleteLead = (id: string) =>
    apiFetch<{ success: boolean }>(`/api/leads/${id}`, { method: 'DELETE' })

  const changeStatus = (id: string, status: LeadStatus, note?: string, lostReason?: string) =>
    apiFetch<{ success: boolean; data: Lead }>(`/api/leads/${id}/status`, {
      method: 'POST',
      body: { status, note: note || undefined, lostReason: lostReason || undefined },
    })

  const markLost = (id: string, reason: string, note?: string) =>
    apiFetch<{ success: boolean; data: Lead }>(`/api/leads/${id}/lost`, {
      method: 'POST',
      body: { reason, note: note || undefined },
    })

  const recordContact = (id: string, note?: string) =>
    apiFetch<{ success: boolean; data: Lead }>(`/api/leads/${id}/contact`, {
      method: 'POST',
      body: { note: note || undefined },
    })

  const assignLead = (id: string, body: { assignedStaffId?: string | null; assignedDoctorId?: string | null }) =>
    apiFetch<{ success: boolean; data: Lead }>(`/api/leads/${id}/assign`, { method: 'POST', body })

  const addNote = (id: string, body: string) =>
    apiFetch<{ success: boolean; data: unknown }>(`/api/leads/${id}/notes`, { method: 'POST', body: { body } })

  const convertLead = (id: string, body: Record<string, unknown> = {}) =>
    apiFetch<{ success: boolean; data: { patientId: string; patientCreated: boolean; lead: Lead } }>(
      `/api/leads/${id}/convert`,
      { method: 'POST', body }
    )

  const createSource = (body: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: LeadSource }>('/api/lead-sources', { method: 'POST', body })

  const updateSource = (id: string, body: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: LeadSource }>(`/api/lead-sources/${id}`, { method: 'PUT', body })

  const deactivateSource = (id: string) =>
    apiFetch<{ success: boolean; data: LeadSource }>(`/api/lead-sources/${id}`, { method: 'DELETE' })

  return {
    listLeads,
    getLead,
    getSummary,
    listSources,
    createLead,
    updateLead,
    deleteLead,
    changeStatus,
    markLost,
    recordContact,
    assignLead,
    addNote,
    convertLead,
    createSource,
    updateSource,
    deactivateSource,
  }
}
