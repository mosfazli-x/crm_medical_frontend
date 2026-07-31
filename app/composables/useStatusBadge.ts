export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'

const STATUS_CLASSES: Record<string, string> = {
  pending: 'crm-badge crm-badge-pending',
  confirmed: 'crm-badge crm-badge-confirmed',
  rejected: 'crm-badge crm-badge-rejected',
  cancelled: 'crm-badge crm-badge-cancelled',
  completed: 'crm-badge crm-badge-completed',
  approved: 'crm-badge crm-badge-completed',
  active: 'crm-badge crm-badge-completed',
  inactive: 'crm-badge crm-badge-neutral',
  // Lead statuses
  new: 'crm-badge crm-badge-neutral',
  contacted: 'crm-badge crm-badge-blue',
  qualified: 'crm-badge crm-badge-pending',
  appointment_booked: 'crm-badge crm-badge-confirmed',
  visited: 'crm-badge crm-badge-completed',
  converted: 'crm-badge crm-badge-emerald',
  lost: 'crm-badge crm-badge-cancelled',
}

const PRIORITY_CLASSES: Record<string, string> = {
  low: 'crm-badge crm-badge-neutral',
  medium: 'crm-badge crm-badge-pending',
  high: 'crm-badge crm-badge-cancelled',
}

const SOURCE_CATEGORY_CLASSES: Record<string, string> = {
  social: 'crm-badge crm-badge-blue',
  paid_ads: 'crm-badge crm-badge-pending',
  organic: 'crm-badge crm-badge-emerald',
  referral: 'crm-badge crm-badge-confirmed',
  direct: 'crm-badge crm-badge-neutral',
  messaging: 'crm-badge crm-badge-blue',
  other: 'crm-badge crm-badge-neutral',
}

export const useStatusBadge = () => {
  const { t } = useI18n()

  const badgeClass = (status: string) => STATUS_CLASSES[status] || 'crm-badge crm-badge-neutral'
  const badgeLabel = (status: string) => {
    const key = `statuses.${status}`
    const translated = t(key)
    return translated !== key ? translated : status
  }

  const priorityClass = (priority: string) => PRIORITY_CLASSES[priority] || 'crm-badge crm-badge-neutral'
  const priorityLabel = (priority: string) => {
    const key = `leadPriorities.${priority}`
    const translated = t(key)
    return translated !== key ? translated : priority
  }

  const sourceCategoryClass = (category: string) =>
    SOURCE_CATEGORY_CLASSES[category] || 'crm-badge crm-badge-neutral'
  const sourceCategoryLabel = (category: string) => {
    const key = `leadSourceCategories.${category}`
    const translated = t(key)
    return translated !== key ? translated : category
  }

  const sourceTypeLabel = (type: string) => {
    const key = `leadSourceTypes.${type}`
    const translated = t(key)
    return translated !== key ? translated : type
  }

  const lostReasonLabel = (reason: string) => {
    const key = `leadLostReasons.${reason}`
    const translated = t(key)
    return translated !== key ? translated : reason
  }

  return {
    badgeClass,
    badgeLabel,
    priorityClass,
    priorityLabel,
    sourceCategoryClass,
    sourceCategoryLabel,
    sourceTypeLabel,
    lostReasonLabel,
    STATUS_CLASSES,
  }
}
