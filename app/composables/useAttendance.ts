import moment from 'moment-jalaali'
import type {
  AttendanceKpis,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  WorkLocation,
} from '~/types/attendance'

/** A shift longer than this counts towards overtime. */
const STANDARD_WORKDAY_MINUTES = 8 * 60

/**
 * The slice of the moment-jalaali API this app relies on.
 *
 * `moment-jalaali` ships its own `JalaaliMoment` type that clashes with the
 * `moment` types the project also depends on, so the surface is described here
 * instead and the concrete objects are cast onto it.
 */
export interface JalaliMoment {
  clone(): JalaliMoment
  toDate(): Date
  format(template?: string): string
  add(amount: number, unit?: string): JalaliMoment
  subtract(amount: number, unit?: string): JalaliMoment
  startOf(unit?: string): JalaliMoment
  endOf(unit?: string): JalaliMoment
  /** Day of the Jalali month — moment's own `date()` stays on the Gregorian calendar. */
  jDate(): number
  day(): number
  diff(other: JalaliMoment, unit?: string): number
}

/** Parses a `jYYYY-jMM-jDD` string into a Jalali moment. */
export function toJalaliMoment(date: string): JalaliMoment {
  return moment(date, 'jYYYY-jMM-jDD') as unknown as JalaliMoment
}

/** The current instant as a Jalali moment. */
export function nowJalaliMoment(): JalaliMoment {
  return moment() as unknown as JalaliMoment
}

/**
 * Weekday abbreviations for the calendar header, Saturday first.
 *
 * `Intl` has no abbreviated weekday for Persian, so the letters are listed
 * once and reused for every month grid. The English row follows the same
 * order, which is why it starts with two `S` entries.
 */
const WEEKDAY_SHORT_FA = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const WEEKDAY_SHORT_EN = ['S', 'S', 'M', 'T', 'W', 'T', 'F']

export interface JalaliMonthCell {
  /** `jYYYY-jMM-jDD` — the same shape the backend stores. */
  date: string
  /** Day of the Jalali month, 1-based. */
  day: number
  /** False for the leading/trailing days borrowed from the neighbouring months. */
  inMonth: boolean
  /** Saturday-based weekday index: 0 = شنبه … 6 = جمعه. */
  weekday: number
  isToday: boolean
}

/**
 * Presentation helpers shared by every attendance surface in the app shell.
 *
 * The desktop page renders its own labels from the same `attendance.*` i18n
 * keys, so keeping the wording here means the PWA and the website never drift.
 */
export const useAttendance = () => {
  const { t } = useI18n()
  const { locale } = useI18n()
  const { pn } = useLang()

  const STATUS_PILL: Record<AttendanceStatus, string> = {
    present: 'app-pill--green',
    late: 'app-pill--amber',
    absent: 'app-pill--rose',
    leave: 'app-pill--indigo',
    holiday: 'app-pill--teal',
  }

  const LOCATION_ICON: Record<WorkLocation, string> = {
    clinic: 'lucide:building-2',
    remote: 'lucide:laptop',
    field: 'lucide:car',
  }

  const statusLabel = (status: AttendanceStatus) => t(`attendance.status.${status}`)
  const statusPill = (status: AttendanceStatus) => STATUS_PILL[status] ?? 'app-pill--neutral'
  const locationLabel = (location: WorkLocation | null | undefined) =>
    location ? t(`attendance.location.${location}`) : '—'
  const locationIcon = (location: WorkLocation | null | undefined) =>
    location ? LOCATION_ICON[location] : 'lucide:map-pin'

  function initials(name?: string | null): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '؟'
    return parts.length === 1
      ? parts[0]!.charAt(0)
      : parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  }

  // ── Calendar formatting ───────────────────────────────────────
  // `Intl` renders the Persian calendar with real Persian month and weekday
  // names, which moment only offers after a global `loadPersian()` call.
  const intlLocale = computed(() => (locale.value === 'fa' ? 'fa-IR' : 'en-US'))

  function formatParts(date: Date, options: Intl.DateTimeFormatOptions) {
    const formatter = new Intl.DateTimeFormat(intlLocale.value, {
      calendar: 'persian',
      ...options,
    })
    const parts = formatter.formatToParts(date)
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? ''
    return { formatter, parts, pick }
  }

  /** Formats a Jalali `YYYY-MM-DD` date with the Persian calendar. */
  function formatJalali(
    date: string,
    options: Intl.DateTimeFormatOptions,
  ): { formatter: Intl.DateTimeFormat; pick: (type: Intl.DateTimeFormatPartTypes) => string } {
    return formatParts(toJalaliMoment(date).toDate(), options)
  }

  /** Formats an ISO timestamp as a wall-clock `HH:mm`. */
  function clock(value: string | null | undefined): string {
    if (!value) return '--:--'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value.slice(0, 5)
    return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
  }

  const sessionLabelItem = (session: AttendanceSession) =>
    session.checkOutTime
      ? `${clock(session.checkInTime)} → ${clock(session.checkOutTime)}`
      : `${clock(session.checkInTime)} → ${t('attendance.pwa.workingNow')}`

  /** Collapses every session of a day into a single `first → last` range. */
  function sessionLabel(sessions: AttendanceSession[] | undefined): string {
    if (!sessions?.length) return '—'
    const first = sessions[0]
    const last = sessions[sessions.length - 1]
    if (!first) return '—'
    return `${clock(first.checkInTime)} → ${last?.checkOutTime ? clock(last.checkOutTime) : t('attendance.pwa.workingNow')}`
  }

  const dayOf = (date: string) => moment(date, 'jYYYY-jMM-jDD').format('jD')

  /** Full weekday name of a Jalali date — "دوشنبه". */
  function weekday(date: string): string {
    const { formatter } = formatJalali(date, { weekday: 'long' })
    return formatter.format(toJalaliMoment(date).toDate())
  }

  /** Long date — "دوشنبه ۱۲ مرداد ۱۴۰۳". */
  function prettyDate(date: string): string {
    const { pick } = formatJalali(date, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return `${pick('weekday')} ${pick('day')} ${pick('month')} ${pick('year')}`
  }

  /** Month heading — "مرداد ۱۴۰۳". */
  function monthTitle(cursor: JalaliMoment): string {
    const { pick } = formatParts(cursor.toDate(), { month: 'long', year: 'numeric' })
    return `${pick('month')} ${pick('year')}`
  }

  /** Calendar distance between two Jalali `YYYY-MM-DD` strings, in days. */
  const daysBetween = (from: string, to: string) =>
    toJalaliMoment(to).diff(toJalaliMoment(from), 'days')

  const isWorkedStatus = (status: AttendanceStatus) => status === 'present' || status === 'late'

  /** Weekday header labels for the calendar grid, Saturday first. */
  const weekdayLabels = computed(() =>
    locale.value === 'fa' ? WEEKDAY_SHORT_FA : WEEKDAY_SHORT_EN,
  )

  /**
   * Builds the calendar grid of a Jalali month.
   *
   * Moment-jalaali's `startOf('jMonth')`/`endOf('jMonth')` give the month
   * bounds; the grid is padded on both sides so every row holds seven cells.
   */
  function jalaliMonthCells(cursor: JalaliMoment): JalaliMonthCell[] {
    const monthStart = cursor.clone().startOf('jMonth')
    const monthLength = cursor.clone().endOf('jMonth').jDate()
    const today = moment().format('jYYYY-jMM-jDD')

    // moment's `day()` is Sunday-based (0 = Sunday), while the Iranian week
    // starts on Saturday — shift it so Saturday becomes column 0.
    const leading = (monthStart.day() + 1) % 7

    const cells: JalaliMonthCell[] = []
    for (let i = 0; i < leading; i++) {
      const date = monthStart.clone().subtract(leading - i, 'day')
      cells.push({
        date: date.format('jYYYY-jMM-jDD'),
        day: date.jDate(),
        inMonth: false,
        weekday: (date.day() + 1) % 7,
        isToday: date.format('jYYYY-jMM-jDD') === today,
      })
    }

    for (let day = 1; day <= monthLength; day++) {
      const date = monthStart.clone().add(day - 1, 'day')
      cells.push({
        date: date.format('jYYYY-jMM-jDD'),
        day,
        inMonth: true,
        weekday: (date.day() + 1) % 7,
        isToday: date.format('jYYYY-jMM-jDD') === today,
      })
    }

    // Pad the tail so the last row is complete.
    for (let i = 0; cells.length % 7 !== 0; i++) {
      const date = monthStart.clone().add(monthLength + i, 'day')
      cells.push({
        date: date.format('jYYYY-jMM-jDD'),
        day: date.jDate(),
        inMonth: false,
        weekday: (date.day() + 1) % 7,
        isToday: date.format('jYYYY-jMM-jDD') === today,
      })
    }

    return cells
  }

  /**
   * Aggregates a set of records into the figures shown on the dashboard cards.
   *
   * Streaks are calendar-continuous: two worked days only count towards the
   * same run when their Jalali dates are exactly one day apart.
   */
  function computeKpis(records: AttendanceRecord[]): AttendanceKpis {
    const kpis: AttendanceKpis = {
      totalDays: records.length,
      presentDays: 0,
      lateDays: 0,
      absentDays: 0,
      leaveDays: 0,
      holidayDays: 0,
      workedDays: 0,
      totalMinutes: 0,
      avgMinutes: 0,
      rate: 0,
      streak: 0,
      bestStreak: 0,
      overtimeMinutes: 0,
    }

    for (const record of records) {
      if (record.status === 'present') kpis.presentDays++
      else if (record.status === 'late') kpis.lateDays++
      else if (record.status === 'absent') kpis.absentDays++
      else if (record.status === 'leave') kpis.leaveDays++
      else if (record.status === 'holiday') kpis.holidayDays++

      if (isWorkedStatus(record.status)) kpis.workedDays++

      const minutes = record.workedMinutes || 0
      kpis.totalMinutes += minutes
      if (minutes > STANDARD_WORKDAY_MINUTES) {
        kpis.overtimeMinutes += minutes - STANDARD_WORKDAY_MINUTES
      }
    }

    kpis.avgMinutes = kpis.workedDays ? Math.round(kpis.totalMinutes / kpis.workedDays) : 0
    kpis.rate = kpis.totalDays ? Math.round((kpis.workedDays / kpis.totalDays) * 100) : 0

    const sorted = records
      .filter((record) => isWorkedStatus(record.status))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))

    let run = 0
    let previousDate: string | null = null
    for (const record of sorted) {
      run = previousDate !== null && daysBetween(previousDate, record.date) === 1 ? run + 1 : 1
      if (run > kpis.bestStreak) kpis.bestStreak = run
      previousDate = record.date
    }

    // The current streak only counts when the most recent worked day is also
    // the last day of the set — a gap at the end ends the streak.
    if (sorted.length) {
      const last = sorted[sorted.length - 1]!
      const lastRecord = records.reduce((latest, record) =>
        record.date > latest.date ? record : latest,
      )
      if (lastRecord.date === last.date) {
        let streak = 0
        let cursorDate: string | null = null
        for (let i = sorted.length - 1; i >= 0; i--) {
          const record = sorted[i]!
          if (cursorDate !== null && daysBetween(record.date, cursorDate) !== 1) break
          streak++
          cursorDate = record.date
        }
        kpis.streak = streak
      }
    }

    return kpis
  }

  return {
    pn,
    statusLabel,
    statusPill,
    locationLabel,
    locationIcon,
    initials,
    clock,
    sessionLabel,
    sessionLabelItem,
    dayOf,
    weekday,
    prettyDate,
    monthTitle,
    daysBetween,
    isWorkedStatus,
    weekdayLabels,
    jalaliMonthCells,
    computeKpis,
  }
}
