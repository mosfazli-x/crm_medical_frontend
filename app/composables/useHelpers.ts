/**
 * Shared UI helpers â€” extracted from duplicated code across
 * schedule.vue, TaskCard.vue, PatientProfile.vue, etc.
 */

export const useHelpers = () => {
  const { t } = useI18n()

  const init = (name: string | undefined | null): string => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return (parts[0] ?? '').charAt(0).toUpperCase()
    const first = (parts[0] ?? '').charAt(0)
    const last = (parts[parts.length - 1] ?? '').charAt(0)
    return (first + last).toUpperCase()
  }

  /* Initials for an assignee-like object { fullName, phone } */
  const assigneeInitials = (a: { fullName?: string | null; phone?: string | null }): string => {
    const name = (a.fullName || '').trim()
    if (!name) return (a.phone || '').slice(-2)
    const parts = name.split(/\s+/)
    if (parts.length > 1) {
      const first = (parts[0] ?? '').charAt(0)
      const second = (parts[1] ?? '').charAt(0)
      return (first + second).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const avatarColors = [
    '#A2D2FF', '#0EA5E9', '#8B5CF6', '#F59E0B',
    '#10B981', '#F43F5E', '#CDB4DB', '#0891B2',
  ] as const

  const avatarColor = (id: string): string => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
    return avatarColors[hash % avatarColors.length] as string
  }

  /* Accepts a ClinicTask-like object with dueDate + status, or a date string */
  type DueSource = string | null | undefined | { dueDate?: string | null; status?: string }
  const doneStatuses = ['done', 'cancelled']

  const isOverdue = (source: DueSource, today: string = ''): boolean => {
    if (!source) return false
    let dueDate: string | null | undefined
    let status: string | undefined
    if (typeof source === 'object') {
      dueDate = source.dueDate
      status = source.status
    } else {
      dueDate = source
    }
    if (!dueDate) return false
    if (status && doneStatuses.includes(status)) return false
    const todayRef = today || useFormatting().todayJalali()
    return dueDate < todayRef
  }

  const assigneeLabel = (a: { fullName?: string | null; position?: string | null }): string =>
    [a.fullName, a.position].filter(Boolean).join(' â€” ')

  return { initials: init, assigneeInitials, avatarColor, avatarColors, isOverdue, assigneeLabel }
}
