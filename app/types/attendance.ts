export const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'leave', 'holiday'] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const WORK_LOCATIONS = ['clinic', 'remote', 'field'] as const
export type WorkLocation = (typeof WORK_LOCATIONS)[number]

export const MONTH_KEYS = [
  'farvardin',
  'ordibehesht',
  'khordad',
  'tir',
  'mordad',
  'shahrivar',
  'mehr',
  'aban',
  'azar',
  'dey',
  'bahman',
  'esfand',
] as const

/** Editable `HH:mm` pair. An empty `checkOutTime` means the session is still open. */
export interface AttendanceSessionInput {
  checkInTime: string
  checkOutTime: string
}

export interface AttendanceSession {
  id?: string
  checkInTime: string | null
  checkOutTime: string | null
}

export interface AttendanceRecord {
  id: string
  staffId: string
  staffName?: string | null
  staffPosition?: string | null
  date: string
  status: AttendanceStatus
  workLocation: WorkLocation | null
  notes: string | null
  adminNotes: string | null
  sessions: AttendanceSession[]
  workedMinutes: number
}

export interface AttendanceSummary {
  staffId: string
  staffName: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  leaveDays: number
  holidayDays: number
  totalWorkedMinutes: number
}

export interface AttendanceReport {
  records: AttendanceRecord[]
  summary: AttendanceSummary[]
}

export interface BulkAttendanceRow {
  staffId: string
  status: AttendanceStatus
  notes: string | null
  adminNotes: string | null
  sessions: AttendanceSessionInput[]
}

/** A clinic team member that can hold an attendance record. */
export interface AttendanceStaffOption {
  id: string
  fullName: string
  role: string
}

export type PunchAction = 'check-in' | 'check-out'

/**
 * A punch that was recorded while the device was offline.
 *
 * The queue is replayed against the regular check-in / check-out endpoints once
 * connectivity returns, so the backend never needs an offline-aware code path.
 */
export interface PendingPunch {
  id: string
  action: PunchAction
  /** ISO timestamp of the moment the user punched. */
  at: string
  /** Jalali date the punch belongs to. */
  date: string
  workLocation: WorkLocation
  notes: string | null
}

/** Aggregated figures derived from a set of attendance records. */
export interface AttendanceKpis {
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  leaveDays: number
  holidayDays: number
  workedDays: number
  totalMinutes: number
  avgMinutes: number
  /** Share of recorded days that were worked, in percent. */
  rate: number
  /** Consecutive worked days ending at the most recent record. */
  streak: number
  /** Longest run of consecutive worked days in the set. */
  bestStreak: number
  /** Minutes worked beyond a standard 8-hour day. */
  overtimeMinutes: number
}
