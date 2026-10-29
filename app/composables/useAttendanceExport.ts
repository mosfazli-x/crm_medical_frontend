import type { AttendanceRecord } from '~/types/attendance'

export type ShareOutcome = 'shared' | 'copied' | 'failed'

/** Escapes a single CSV cell and wraps it in quotes. */
function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

/**
 * Export and share helpers for attendance data.
 *
 * Both the CSV and the share text are Persian, so the payload carries a UTF-8
 * BOM — without it Excel opens the file with the wrong codepage.
 */
export const useAttendanceExport = () => {
  const { t } = useI18n()
  const { pn } = useLang()
  const { statusLabel, locationLabel, clock } = useAttendance()

  const CSV_HEADER = [
    t('attendance.pwa.csv.date'),
    t('attendance.pwa.csv.name'),
    t('attendance.pwa.csv.status'),
    t('attendance.pwa.csv.checkIn'),
    t('attendance.pwa.csv.checkOut'),
    t('attendance.pwa.csv.minutes'),
    t('attendance.pwa.csv.location'),
    t('attendance.pwa.csv.notes'),
  ]

  function toCsv(records: AttendanceRecord[]): string {
    const rows = records.map((record) => {
      const first = record.sessions?.[0]
      const last = record.sessions?.[record.sessions.length - 1]
      return [
        record.date,
        record.staffName || '',
        statusLabel(record.status),
        clock(first?.checkInTime),
        clock(last?.checkOutTime),
        record.workedMinutes || 0,
        locationLabel(record.workLocation),
        [record.notes, record.adminNotes].filter(Boolean).join(' — '),
      ]
        .map(csvCell)
        .join(',')
    })

    return `\uFEFF${[CSV_HEADER.map(csvCell).join(','), ...rows].join('\r\n')}`
  }

  function downloadCsv(records: AttendanceRecord[], filename: string) {
    if (import.meta.server) return
    const blob = new Blob([toCsv(records)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /** Human-readable digest used for both the share sheet and the clipboard. */
  function buildSummary(records: AttendanceRecord[], heading: string): string {
    if (!records.length) return `${heading}\n${t('attendance.pwa.shareEmpty')}`

    const lines = records.map((record) => {
      const first = record.sessions?.[0]
      const last = record.sessions?.[record.sessions.length - 1]
      const range = record.sessions?.length
        ? `${clock(first?.checkInTime)}–${clock(last?.checkOutTime)}`
        : '—'
      const minutes = record.workedMinutes ? ` (${pn(record.workedMinutes)} ${t('attendance.pwa.minutesShort')})` : ''
      return `${record.date} · ${record.staffName || '—'} · ${statusLabel(record.status)} · ${range}${minutes}`
    })

    return [heading, ...lines].join('\n')
  }

  async function copyToClipboard(text: string): Promise<boolean> {
    if (import.meta.server) return false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {
      /* fall through to the legacy path */
    }

    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }

  /**
   * Opens the native share sheet, falling back to the clipboard.
   *
   * A user-dismissed share sheet is not an error, so it reports `failed` only
   * when neither channel worked.
   */
  async function share(text: string, title: string): Promise<ShareOutcome> {
    if (import.meta.server) return 'failed'

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text })
        return 'shared'
      } catch (error) {
        // `AbortError` means the sheet was dismissed on purpose.
        if ((error as { name?: string })?.name === 'AbortError') return 'failed'
      }
    }

    return (await copyToClipboard(text)) ? 'copied' : 'failed'
  }

  return {
    toCsv,
    downloadCsv,
    buildSummary,
    share,
    copyToClipboard,
  }
}
