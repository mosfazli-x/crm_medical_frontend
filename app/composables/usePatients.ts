import type { PatientsListResponse } from '~/types/patient'

export interface PatientListFilters {
  page?: number
  limit?: number
  q?: string
  maritalStatus?: string
  sort?: string
}

export const usePatients = () => {
  const { apiFetch } = useApi()

  const listPatients = (filters: PatientListFilters = {}) => {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    if (filters.q && filters.q.trim()) params.q = filters.q.trim()
    if (filters.maritalStatus && filters.maritalStatus !== 'all') params.marital_status = filters.maritalStatus
    if (filters.sort) params.sort = filters.sort
    return apiFetch<PatientsListResponse>('/api/patients', { params })
  }

  return { listPatients }
}
