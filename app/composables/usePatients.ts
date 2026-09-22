import type { PatientsListResponse } from '~/types/patient'

export interface PatientListFilters {
  page?: number
  limit?: number
  q?: string
  maritalStatus?: string
  insuranceType?: string
  createdFrom?: string
  createdTo?: string
  birthFrom?: string
  birthTo?: string
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
    if (filters.insuranceType && filters.insuranceType !== 'all') params.insurance_type = filters.insuranceType
    if (filters.createdFrom) params.created_from = filters.createdFrom
    if (filters.createdTo) params.created_to = filters.createdTo
    if (filters.birthFrom) params.birth_from = filters.birthFrom
    if (filters.birthTo) params.birth_to = filters.birthTo
    if (filters.sort) params.sort = filters.sort
    return apiFetch<PatientsListResponse>('/api/patients', { params })
  }

  return { listPatients }
}
