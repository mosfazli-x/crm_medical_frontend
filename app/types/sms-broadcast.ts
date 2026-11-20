// ─────────────────────────────────────────────────────────────
// SMS Broadcast types — mirrors backend
// src/modules/sms-broadcast/sms-broadcast.schema.ts & controller
// Day-of-week uses JavaScript getDay(): 0 = Sunday … 6 = Saturday.
// ─────────────────────────────────────────────────────────────

export type BroadcastTargetType = 'all' | 'specific'
export type BroadcastLogStatus = 'sent' | 'failed' | 'skipped'
export type BroadcastRunReason = 'channel_disabled' | 'no_credit' | 'already_ran' | null

export interface SmsBroadcast {
  id: string
  name: string
  message: string
  targetType: BroadcastTargetType
  targetPatientIds: string[] | null
  daysOfWeek: number[]
  hour: number
  minute: number
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
  lastRunAt: string | null
  nextRunAt: string | null
  totalSent: number
  totalFailed: number
  /** Number of eligible, deliverable recipients (computed server-side). */
  recipientCount?: number
}

export interface SmsBroadcastLog {
  id: string
  broadcastId: string
  patientId: string
  sentAt: string
  status: BroadcastLogStatus
  error: string | null
  phone: string | null
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/** POST /:id/run → { sent, failed, skipped, recipientCount, reason, forced } */
export interface BroadcastRunResult {
  sent: number
  failed: number
  skipped: number
  recipientCount: number
  reason: BroadcastRunReason
  forced: boolean
}

/** POST /run-due → { broadcasts, sent, failed, skipped } */
export interface BroadcastDueResult {
  broadcasts: number
  sent: number
  failed: number
  skipped: number
}

export interface BroadcastFormInput {
  name: string
  message: string
  targetType: BroadcastTargetType
  targetPatientIds: string[]
  daysOfWeek: number[]
  hour: number
  minute: number
}

export interface BroadcastUpdateInput extends Partial<BroadcastFormInput> {
  isActive?: boolean
}

// ── Raw API envelopes (as returned by the Fastify controller) ──

export interface BroadcastListResponse {
  success: boolean
  data: SmsBroadcast[]
  pagination: ApiPagination
}

export interface BroadcastLogsResponse {
  success: boolean
  data: SmsBroadcastLog[]
  pagination: ApiPagination
}

export interface BroadcastDetailResponse {
  success: boolean
  data: {
    broadcast: SmsBroadcast
    recipientCount: number
    recentLogs: SmsBroadcastLog[]
  }
}

export interface BroadcastMutationResponse {
  success: boolean
  data: SmsBroadcast
}

export interface BroadcastRunResponse {
  success: boolean
  data: BroadcastRunResult
}

export interface BroadcastDueResponse {
  success: boolean
  data: BroadcastDueResult
}

export interface BroadcastDeleteResponse {
  success: boolean
  message?: string
}

// ── Weekday metadata (getDay() convention, Persian labels) ──

export interface WeekdayOption {
  value: number
  label: string
  short: string
}

export const WEEKDAYS: WeekdayOption[] = [
  { value: 6, label: 'شنبه', short: 'ش' },
  { value: 0, label: 'یک‌شنبه', short: 'ی' },
  { value: 1, label: 'دوشنبه', short: 'د' },
  { value: 2, label: 'سه‌شنبه', short: 'س' },
  { value: 3, label: 'چهارشنبه', short: 'چ' },
  { value: 4, label: 'پنج‌شنبه', short: 'پ' },
  { value: 5, label: 'جمعه', short: 'ج' },
]

/** Weekdays in display order (Saturday-first, Persian calendar). */
export const WEEKDAYS_BY_VALUE: Record<number, WeekdayOption> = Object.fromEntries(
  WEEKDAYS.map((d) => [d.value, d])
) as Record<number, WeekdayOption>

export const weekdayLabel = (value: number): string => WEEKDAYS_BY_VALUE[value]?.label ?? String(value)

export const formatBroadcastTime = (hour: number, minute: number): string =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

/** Sort a set of weekday numbers into Persian display order (Sat → Fri). */
export const sortWeekdays = (days: number[]): number[] => {
  const order = WEEKDAYS.map((d) => d.value)
  return [...new Set(days)].sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

/**
 * Normalise an Iranian mobile number to `09XXXXXXXXX`. Mirrors the backend
 * helper so the picker can preview exactly who will receive a broadcast.
 */
export const normalizeMobile = (input: string | null | undefined): string | null => {
  if (!input) return null
  let value = String(input).replace(/[\s\-()_.]/g, '')
  if (!value) return null
  if (value.startsWith('0098')) value = `0${value.slice(4)}`
  else if (value.startsWith('+98')) value = `0${value.slice(3)}`
  else if (value.startsWith('98') && value.length === 12) value = `0${value.slice(2)}`
  else if (value.startsWith('9') && value.length === 10) value = `0${value}`
  return /^09\d{9}$/.test(value) ? value : null
}

export const isDeliverablePhone = (phone: string | null | undefined): boolean =>
  normalizeMobile(phone) !== null
