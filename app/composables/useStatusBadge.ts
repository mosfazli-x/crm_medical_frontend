export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار تایید',
  confirmed: 'تایید شده',
  rejected: 'رد شده',
  cancelled: 'لغو شده',
  completed: 'تکمیل شده',
  approved: 'تأیید شده',
  active: 'فعال',
  inactive: 'غیرفعال',
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'crm-badge crm-badge-pending',
  confirmed: 'crm-badge crm-badge-confirmed',
  rejected: 'crm-badge crm-badge-rejected',
  cancelled: 'crm-badge crm-badge-cancelled',
  completed: 'crm-badge crm-badge-completed',
  approved: 'crm-badge crm-badge-completed',
  active: 'crm-badge crm-badge-completed',
  inactive: 'crm-badge crm-badge-neutral',
}

export const useStatusBadge = () => {
  const badgeClass = (status: string) => STATUS_CLASSES[status] || 'crm-badge crm-badge-neutral'
  const badgeLabel = (status: string) => STATUS_LABELS[status] || status

  return { badgeClass, badgeLabel, STATUS_LABELS, STATUS_CLASSES }
}
