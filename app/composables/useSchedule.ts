import type {
  ClinicTask,
  ScheduleAssignee,
  TaskFilters,
  TaskListResponse,
  TaskStatus,
} from '~/types/schedule'

export const useSchedule = () => {
  const { apiFetch } = useApi()

  const listTasks = (filters: TaskFilters = {}) => {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.assigneeId) params.assigneeId = filters.assigneeId
    if (filters.assignedToMe !== undefined) params.assignedToMe = String(filters.assignedToMe)
    if (filters.due) params.due = filters.due
    if (filters.q && filters.q.trim()) params.q = filters.q.trim()
    if (filters.sort) params.sort = filters.sort
    return apiFetch<TaskListResponse>('/api/schedule', { params })
  }

  const getTask = (id: string) =>
    apiFetch<{ success: boolean; data: ClinicTask }>(`/api/schedule/${id}`)

  const listAssignees = () =>
    apiFetch<{ success: boolean; data: ScheduleAssignee[] }>('/api/schedule/assignees')

  const createTask = (body: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: ClinicTask }>('/api/schedule', { method: 'POST', body })

  const updateTask = (id: string, body: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: ClinicTask }>(`/api/schedule/${id}`, { method: 'PUT', body })

  const deleteTask = (id: string) =>
    apiFetch<{ success: boolean }>(`/api/schedule/${id}`, { method: 'DELETE' })

  const changeStatus = (id: string, status: TaskStatus) =>
    apiFetch<{ success: boolean; data: ClinicTask }>(`/api/schedule/${id}/status`, {
      method: 'POST',
      body: { status },
    })

  return {
    listTasks,
    getTask,
    listAssignees,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
  }
}
