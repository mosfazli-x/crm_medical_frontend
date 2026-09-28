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
