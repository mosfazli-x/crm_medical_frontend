import { computed } from 'vue'
import { TASK_PRIORITIES, TASK_SORTS, TASK_STATUSES } from '~/types/schedule'
import type { ClinicTask, ScheduleAssignee, TaskPriority, TaskStatus } from '~/types/schedule'

const STATUS_PILL: Record<TaskStatus, string> = {
  pending: 'asa-pill--amber',
  in_progress: 'asa-pill--indigo',
  done: 'asa-pill--green',
  cancelled: 'pf-pill--neutral',
}

const PRIORITY_PILL: Record<TaskPriority, string> = {
  low: 'pf-pill--neutral',
  medium: 'asa-pill--amber',
  high: 'asa-pill--rose',
}

const STATUS_TINT: Record<TaskStatus, string> = {
  pending: 'asa-tint--amber',
  in_progress: 'asa-tint--indigo',
  done: 'asa-tint--green',
  cancelled: 'asa-tint--orange',
}

const STATUS_DOT: Record<TaskStatus, string> = {
  pending: 'var(--asa-amber)',
  in_progress: 'var(--asa-indigo)',
  done: 'var(--asa-green)',
  cancelled: 'var(--asa-label-3)',
}

export const useTaskPresentation = () => {
  const { t } = useI18n()
  const { formatMinutes, formatJalaliDateShort, todayJalali } = useFormatting()
  const { avatarColor, assigneeInitials, assigneeLabel, isOverdue } = useHelpers()

  const today = computed(() => todayJalali())

  const statusPill = (status: TaskStatus) => STATUS_PILL[status] ?? 'pf-pill--neutral'
  const statusTint = (status: TaskStatus) => STATUS_TINT[status] ?? 'asa-tint--teal'
  const statusDot = (status: TaskStatus) => STATUS_DOT[status] ?? 'var(--asa-label-3)'
  const priorityPill = (priority: TaskPriority) => PRIORITY_PILL[priority] ?? 'pf-pill--neutral'

  const statusLabel = (status: TaskStatus) => t(`schedule.statuses.${status}`)
  const priorityLabel = (priority: TaskPriority) => t(`schedule.priorities.${priority}`)

  const statusOptions = computed(() =>
    TASK_STATUSES.map((s) => ({ title: t(`schedule.statuses.${s}`), value: s })),
  )

  const priorityOptions = computed(() =>
    TASK_PRIORITIES.map((p) => ({ title: t(`schedule.priorities.${p}`), value: p })),
  )

  const sortOptions = computed(() =>
    TASK_SORTS.map((s) => ({ title: t(`schedule.sortOptions.${s}`), value: s })),
  )

  const assigneeFullName = (a: ScheduleAssignee) =>
    a.fullName?.trim() || a.phone || t('schedule.noAssignees')

  const timeRange = (task: Pick<ClinicTask, 'spentMinutes' | 'estimatedMinutes'>): string => {
    const spent = formatMinutes(task.spentMinutes)
    if (!task.estimatedMinutes) return spent
    return `${spent} / ${formatMinutes(task.estimatedMinutes)}`
  }

  return {
    today,
    statusPill,
    statusTint,
    statusDot,
    priorityPill,
    statusLabel,
    priorityLabel,
    statusOptions,
    priorityOptions,
    sortOptions,
    assigneeFullName,
    assigneeLabel,
    assigneeInitials,
    avatarColor,
    isOverdue,
    formatJalaliDateShort,
    timeRange,
  }
}
