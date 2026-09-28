export const FOLLOW_UP_WINDOWS = ['pending', 'overdue', 'today', 'upcoming', 'all'] as const
export type FollowUpWindow = (typeof FOLLOW_UP_WINDOWS)[number]

/**
 * - `due`       the reminder window is open and nothing has been sent yet
 * - `sent`      the reminder was delivered
 * - `scheduled` a future follow-up whose window has not opened
 * - `overdue`   the follow-up date passed without a delivered reminder
 */
export const FOLLOW_UP_STATES = ['due', 'sent', 'scheduled', 'overdue'] as const
export type FollowUpState = (typeof FOLLOW_UP_STATES)[number]

export interface FollowUp {
  id: string
  patientId: string
  doctorId: string | null
  patientFirstName: string
  patientLastName: string
  patientFullName: string
  patientNationalId: string | null
  patientPhone: string | null
  doctorFullName: string | null
  visitDate: string
  visitType: string | null
  status: string | null
  nextVisitDate: string | null
  /** Per-visit override; null means the clinic default applies. */
  reminderDaysBefore: number | null
  reminderSentAt: string | null
  /** Resolved lead time actually used for scheduling. */
  effectiveReminderDays: number
  usesDefaultReminderDays: boolean
  /** Whole days from today; negative when the follow-up date has passed. */
  daysUntil: number | null
  reminderState: FollowUpState
  hasPhone: boolean
}

export interface FollowUpSummary {
  total: number
  pending: number
  overdue: number
  today: number
  upcoming: number
  sent: number
  dueNow: number
  missingPhone: number
  defaultReminderDays: number
}

export interface FollowUpListResponse {
  success: boolean
  data: FollowUp[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FollowUpFilters {
  window?: FollowUpWindow
  search?: string
  page?: number
  limit?: number
}

export interface FollowUpReminderResult {
  sent: boolean
  reason?: string
  reminderSentAt?: string | null
  leadDays: number
}

export interface FollowUpSweepStats {
  scanned: number
  due: number
  sent: number
  failed: number
  skipped: number
}
