export const TASK_STATUSES = ['pending', 'in_progress', 'done', 'cancelled'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export interface ScheduleAssignee {
  id: string
  fullName: string | null
  phone: string
  role: string
  position: string | null
  isActive: boolean | null
}

export interface ClinicTask {
  id: string
  title: string
  description: string | null
  assigneeId: string
  assigneeName: string | null
  assigneePhone: string | null
  assigneeRole: string | null
  assigneePosition: string | null
  createdById: string
  createdByName: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  notes: string | null
  completedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TaskListResponse {
  success: boolean
  data: ClinicTask[]
  pagination: TaskPagination
}

export interface TaskFilters {
  page?: number
  limit?: number
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  assigneeId?: string | ''
  assignedToMe?: boolean
  due?: 'overdue' | 'today' | 'upcoming' | ''
  q?: string
  sort?: string
}
