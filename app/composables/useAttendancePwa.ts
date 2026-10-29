import moment from 'moment-jalaali'
import type { AttendanceRecord, PendingPunch, PunchAction, WorkLocation } from '~/types/attendance'

const QUEUE_KEY = 'hhc.attendance.pending.v1'
const SNAPSHOT_KEY = 'hhc.attendance.snapshot.v1'

/** Snapshots older than this are considered stale and dropped. */
const SNAPSHOT_TTL = 1000 * 60 * 60 * 24 * 7

interface SnapshotEnvelope<T> {
  savedAt: number
  data: T
}

function readJson<T>(key: string): T | null {
  if (import.meta.server) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (import.meta.server) return false
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Private-mode Safari and a full quota both land here; the app keeps
    // working, it just loses the offline cache.
    return false
  }
}

function removeKey(key: string) {
  if (import.meta.server) return
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Pulls the HTTP status out of whatever `$fetch` threw. */
function statusOf(error: unknown): number | null {
  const err = error as {
    status?: number
    response?: { status?: number }
    data?: { status?: number }
  }
  return err?.status ?? err?.response?.status ?? err?.data?.status ?? null
}

/**
 * The outcome of a punch.
 *
 * `record` carries what the server stored; `local` carries the punch itself
 * for the punches that are still waiting in the queue.
 */
export interface PunchResult {
  ok: boolean
  /** True when the punch was stored locally and still has to be sent. */
  queued: boolean
  /** The Jalali day the punch belongs to, as the device sees it. */
  date: string
  /** The record the server stored — missing for punches that are still queued. */
  record?: AttendanceRecord
  /** The punch as it was recorded on the device — set for queued punches. */
  local?: PendingPunch
}

/**
 * Offline-first helpers for the attendance screen.
 *
 * Punches are written to a local queue when the device cannot reach the API,
 * and replayed against the regular check-in / check-out endpoints once the
 * connection is back. The last successful payload of every screen is cached as
 * well, so the app still renders something useful with no network at all.
 */
export const useAttendancePwa = () => {
  const { apiFetch } = useApi()
  const { t } = useI18n()
  const { $toast } = useNuxtApp()
  const { user } = useAuth()

  const isOnline = ref(true)
  const pending = ref<PendingPunch[]>([])
  const flushing = ref(false)

  // ── Persistence ──────────────────────────────────────────────

  function loadQueue() {
    const stored = readJson<PendingPunch[]>(QUEUE_KEY)
    pending.value = Array.isArray(stored) ? stored : []
  }

  function persistQueue() {
    if (!pending.value.length) removeKey(QUEUE_KEY)
    else writeJson(QUEUE_KEY, pending.value)
  }

  function enqueue(punch: PendingPunch) {
    pending.value = [...pending.value, punch]
    persistQueue()
  }

  function dropFromQueue(id: string) {
    pending.value = pending.value.filter((item) => item.id !== id)
    persistQueue()
  }

  // ── Cached snapshots ─────────────────────────────────────────

  /** Cache key is namespaced per user so accounts never share data. */
  function snapshotKey(scope: string) {
    return `${SNAPSHOT_KEY}.${user.value?.id || 'anon'}.${scope}`
  }

  function saveSnapshot<T>(scope: string, data: T) {
    const envelope: SnapshotEnvelope<T> = { savedAt: Date.now(), data }
    writeJson(snapshotKey(scope), envelope)
  }

  function readSnapshot<T>(scope: string): T | null {
    const envelope = readJson<SnapshotEnvelope<T>>(snapshotKey(scope))
    if (!envelope || typeof envelope.savedAt !== 'number') return null
    if (Date.now() - envelope.savedAt > SNAPSHOT_TTL) {
      removeKey(snapshotKey(scope))
      return null
    }
    return envelope.data
  }

  // ── Haptics ──────────────────────────────────────────────────

  /** Short confirmation buzz; silently ignored where the API is unavailable. */
  function buzz(pattern: number | number[] = 14) {
    if (import.meta.server) return
    try {
      navigator.vibrate?.(pattern)
    } catch {
      /* not supported */
    }
  }

  // ── Punching ─────────────────────────────────────────────────

  interface PunchOptions {
    workLocation?: WorkLocation
    notes?: string | null
  }

  /**
   * Records a check-in / check-out.
   *
   * A network failure is not an error here: the punch is queued and replayed
   * later, which is the whole point of running this screen inside the PWA.
   *
   * The punch is stamped on the device, not on the server: the clinic and the
   * server clock can sit in different timezones, and the day a punch belongs
   * to has to be the day the person actually punched.
   */
  async function punch(action: PunchAction, options: PunchOptions = {}): Promise<PunchResult> {
    const url = action === 'check-in' ? '/api/staff/attendance/check-in' : '/api/staff/attendance/check-out'
    const stamp = buildPunch(action, options)
    const body =
      action === 'check-in'
        ? { workLocation: stamp.workLocation, notes: stamp.notes, at: stamp.at, date: stamp.date }
        : { notes: stamp.notes, at: stamp.at, date: stamp.date }

    if (!isOnline.value) {
      enqueue(stamp)
      return { ok: true, queued: true, date: stamp.date, local: stamp }
    }

    try {
      const res = await apiFetch<{ success?: boolean; data?: AttendanceRecord }>(url, { method: 'POST', body })
      if (res?.success) {
        buzz()
        return { ok: true, queued: false, date: stamp.date, record: res.data }
      }
      // `apiFetch` answers with an empty object when the session expired.
      return { ok: false, queued: false, date: stamp.date }
    } catch (error) {
      const status = statusOf(error)
      // A 4xx is the server refusing the punch (e.g. checking out without
      // checking in) — retrying it later would never succeed.
      if (status !== null && status >= 400 && status < 500) {
        throw error
      }
      enqueue(stamp)
      return { ok: true, queued: true, date: stamp.date, local: stamp }
    }
  }

  function buildPunch(action: PunchAction, options: PunchOptions): PendingPunch {
    return {
      id: `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      at: new Date().toISOString(),
      date: moment().format('jYYYY-jMM-jDD'),
      workLocation: options.workLocation ?? 'clinic',
      notes: options.notes ?? null,
    }
  }

  /**
   * Replays queued punches in the order they were recorded.
   *
   * The queue stops at the first network failure so the relative order of
   * check-ins and check-outs is preserved.
   */
  async function flush(): Promise<number> {
    if (flushing.value || !pending.value.length) return 0
    if (!isOnline.value) return 0

    flushing.value = true
    let sent = 0
    try {
      for (const item of pending.value.slice()) {
        const url =
          item.action === 'check-in'
            ? '/api/staff/attendance/check-in'
            : '/api/staff/attendance/check-out'
        const body =
          item.action === 'check-in'
            ? { workLocation: item.workLocation, notes: item.notes, at: item.at, date: item.date }
            : { notes: item.notes, at: item.at, date: item.date }

        try {
          const res = await apiFetch<{ success?: boolean }>(url, { method: 'POST', body })
          if (res?.success) {
            dropFromQueue(item.id)
            sent++
          } else {
            // Session expired — drop the entry, it can never be replayed.
            dropFromQueue(item.id)
          }
        } catch (error) {
          const status = statusOf(error)
          if (status !== null && status >= 400 && status < 500) {
            // Permanently rejected by the server.
            dropFromQueue(item.id)
            continue
          }
          // Still no network — keep this one and everything after it queued.
          break
        }
      }
    } finally {
      flushing.value = false
    }

    if (sent > 0) {
      $toast.success(t('attendance.pwa.pendingFlushed', { count: sent }))
    }
    return sent
  }

  // ── Connectivity ─────────────────────────────────────────────

  function handleOnline() {
    isOnline.value = true
    void flush()
  }

  function handleOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    isOnline.value = navigator.onLine
    loadQueue()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (isOnline.value) void flush()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    pending,
    pendingCount: computed(() => pending.value.length),
    flushing,
    punch,
    flush,
    buzz,
    saveSnapshot,
    readSnapshot,
  }
}
