<template>
  <div class="app-rise">
    <!-- ══════════ Connectivity ══════════ -->
    <div v-if="!isOnline" class="app-offline">
      <Icon name="lucide:wifi-off" size="17" />
      <span>
        <b>{{ t('attendance.pwa.offline') }}</b>
        <span class="app-offline__hint">{{ t('attendance.pwa.offlineHint') }}</span>
      </span>
    </div>

    <div v-if="pendingCount" class="app-offline app-offline--pending">
      <Icon name="lucide:cloud-upload" size="17" />
      <span>
        <b>{{ t('attendance.pwa.pending', { count: pn(pendingCount) }) }}</b>
        <span class="app-offline__hint">{{ t('attendance.pwa.pendingHint') }}</span>
      </span>
      <button
        type="button"
        class="app-btn app-btn--ghost pg-flush"
        :disabled="flushing || !isOnline"
        @click="flushPending"
      >
        <Icon name="lucide:refresh-cw" size="14" :class="{ 'app-spin': flushing }" />
        {{ t('attendance.pwa.pendingFlush') }}
      </button>
    </div>

    <div v-if="loading" class="app-list">
      <div class="app-skel" style="height: 190px;" />
      <div v-for="i in 4" :key="i" class="app-skel" style="height: 68px;" />
    </div>

    <!-- Patients cannot log attendance -->
    <div v-else-if="!canPunch" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:shield-off" size="26" /></span>
      <p>{{ t('attendance.pwa.noAccess') }}</p>
    </div>

    <template v-else>
      <!-- ══════════ Action bar ══════════ -->
      <div class="pg-bar">
        <button type="button" class="app-iconbtn" :aria-label="t('attendance.refresh')" @click="reloadAll">
          <Icon name="lucide:refresh-cw" size="17" :class="{ 'app-spin': refreshing }" />
        </button>

        <button type="button" class="app-chip" @click="exportCsv">
          <Icon name="lucide:file-spreadsheet" size="14" />
          {{ t('attendance.pwa.exportCsv') }}
        </button>

        <button type="button" class="app-chip" @click="shareReport">
          <Icon name="lucide:share-2" size="14" />
          {{ t('attendance.pwa.share') }}
        </button>

        <button v-if="isAdmin" type="button" class="app-chip" @click="bulkOpen = true">
          <Icon name="lucide:clipboard-list" size="14" />
          {{ t('attendance.manualEntry') }}
        </button>
      </div>

      <!-- ══════════ Punch card ══════════ -->
      <section class="app-card app-pad punch">
        <p class="punch__eyebrow">{{ todayLabel }}</p>

        <div
          class="app-avatar app-avatar--lg"
          :style="{ background: selfOpen ? 'var(--app-green-soft)' : 'var(--app-surface-2)' }"
        >
          <Icon :name="selfOpen ? 'lucide:log-out' : 'lucide:log-in'" size="26" />
        </div>

        <h2 class="punch__title">{{ punchTitle }}</h2>
        <p class="app-muted punch__hint">{{ punchHint }}</p>

        <div v-if="selfOpen" class="punch__timer app-timer">
          <span class="app-timer__pulse" />
          <span class="punch__timer__cap">{{ t('attendance.pwa.liveTimer') }}</span>
          <b class="app-timer__value">{{ liveElapsed }}</b>
        </div>

        <div v-if="!selfOpen" class="app-chips punch__locations">
          <button
            v-for="location in WORK_LOCATIONS"
            :key="location"
            type="button"
            class="app-chip"
            :class="{ 'app-chip--on': workLocation === location }"
            :disabled="punchBusy"
            @click="workLocation = location"
          >
            <Icon :name="locationIcon(location)" size="14" />
            {{ locationLabel(location) }}
          </button>
        </div>

        <button
          type="button"
          class="app-btn app-mt-16"
          :class="selfOpen ? 'app-btn--danger' : 'app-btn--primary'"
          :disabled="punchBusy"
          @click="togglePunch"
        >
          <Icon
            :name="punchBusy ? 'lucide:loader-2' : selfOpen ? 'lucide:log-out' : 'lucide:log-in'"
            size="19"
            :class="{ 'app-spin': punchBusy }"
          />
          {{ selfOpen ? t('attendance.checkOutBtn') : t('attendance.newCheckIn') }}
        </button>

        <p v-if="todayRecord?.workedMinutes" class="app-muted punch__worked">
          <Icon name="lucide:timer" size="14" />
          {{ t('attendance.workedToday') }} {{ formatMinutes(todayRecord.workedMinutes) }}
        </p>

        <div v-if="todayRecord?.sessions?.length" class="app-scroll-x punch__sessions">
          <span
            v-for="(session, i) in todayRecord.sessions"
            :key="i"
            class="app-pill"
            :class="session.checkOutTime ? 'app-pill--neutral' : 'app-pill--green'"
          >
            {{ sessionLabelItem(session) }}
          </span>
        </div>
      </section>

      <!-- ══════════ ADMIN ══════════ -->
      <template v-if="isAdmin">
        <!-- Filters -->
        <section class="app-card app-pad app-mt-16 pg-filters">
          <div class="pg-filters__dates">
            <AppField :label="t('attendance.fromDate')">
              <PersianDatetimePicker
                v-model="filters.startDate"
                type="date"
                format="jYYYY-jMM-jDD"
                display-format="jYYYY/jMM/jDD"
                color="#5f8feb"
                auto-submit
                clearable
                input-class="app-input"
                :placeholder="t('attendance.fromDate')"
                @change="onRangeChange"
              />
            </AppField>

            <AppField :label="t('attendance.toDate')">
              <PersianDatetimePicker
                v-model="filters.endDate"
                type="date"
                format="jYYYY-jMM-jDD"
                display-format="jYYYY/jMM/jDD"
                color="#5f8feb"
                auto-submit
                clearable
                input-class="app-input"
                :placeholder="t('attendance.toDate')"
                @change="onRangeChange"
              />
            </AppField>
          </div>

          <div class="pg-filters__block">
            <span class="pg-filters__label">{{ t('attendance.statusTitle') }}</span>
            <div class="app-chips">
              <button
                type="button"
                class="app-chip"
                :class="{ 'app-chip--on': statusFilter === null }"
                @click="statusFilter = null"
              >
                {{ t('attendance.filterAll') }}
                <span class="app-chip__count">{{ pn(records.length) }}</span>
              </button>
              <button
                v-for="status in ATTENDANCE_STATUSES"
                :key="status"
                type="button"
                class="app-chip"
                :class="{ 'app-chip--on': statusFilter === status }"
                @click="statusFilter = status"
              >
                {{ statusLabel(status) }}
                <span class="app-chip__count">{{ pn(statusCounts[status]) }}</span>
              </button>
            </div>
          </div>

          <AppField :label="t('attendance.staffLabel')" class="pg-filters__staff">
            <select v-model="staffFilter" class="app-input">
              <option value="">{{ t('attendance.pwa.allStaff') }}</option>
              <option v-for="member in staffOptions" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </select>
          </AppField>
        </section>

        <!-- Records / summary toggle -->
        <div class="app-seg app-mt-16 pg-toggle" role="group" :aria-label="t('attendance.viewToggle')">
          <button
            type="button"
            class="app-seg__btn"
            :class="{ active: adminView === 'records' }"
            :aria-pressed="adminView === 'records'"
            @click="adminView = 'records'"
          >
            {{ t('attendance.pwa.records') }}
          </button>
          <button
            type="button"
            class="app-seg__btn"
            :class="{ active: adminView === 'summary' }"
            :aria-pressed="adminView === 'summary'"
            @click="adminView = 'summary'"
          >
            {{ t('attendance.pwa.summary') }}
          </button>
        </div>

        <!-- Summary -->
        <section v-if="adminView === 'summary'" class="app-mt-16">
          <div class="app-stats">
            <div class="app-stat">
              <span class="app-stat__label">
                <Icon name="lucide:check-circle-2" size="14" /> {{ t('attendance.pwa.kpiWorked') }}
              </span>
              <span class="app-stat__value">{{ pn(adminKpis.workedDays) }}</span>
            </div>
            <div class="app-stat">
              <span class="app-stat__label">
                <Icon name="lucide:percent" size="14" /> {{ t('attendance.attendanceRate') }}
              </span>
              <span class="app-stat__value">{{ pn(adminKpis.rate) }}٪</span>
            </div>
            <div class="app-stat">
              <span class="app-stat__label">
                <Icon name="lucide:timer" size="14" /> {{ t('attendance.pwa.kpiTotal') }}
              </span>
              <span class="app-stat__value">{{ formatMinutes(adminKpis.totalMinutes) }}</span>
            </div>
            <div class="app-stat">
              <span class="app-stat__label">
                <Icon name="lucide:users" size="14" /> {{ t('attendance.pwa.kpiStaff') }}
              </span>
              <span class="app-stat__value">{{ pn(summaryRows.length) }}</span>
            </div>
          </div>

          <div v-if="!summaryRows.length" class="app-empty app-mt-16">
            <span class="app-empty__icon"><Icon name="lucide:bar-chart-3" size="26" /></span>
            <p>{{ t('attendance.noSummaryDesc') }}</p>
          </div>

          <ul v-else class="app-list app-mt-16">
            <li v-for="row in summaryRows" :key="row.staffId" class="app-row">
              <span class="app-avatar">{{ initials(row.staffName) }}</span>
              <span class="app-row__body">
                <span class="app-row__title">{{ row.staffName }}</span>
                <span class="app-row__sub">
                  {{ t('attendance.pwa.kpiPresent') }} {{ pn(row.presentDays) }} ·
                  {{ t('attendance.pwa.kpiLate') }} {{ pn(row.lateDays) }} ·
                  {{ t('attendance.pwa.kpiAbsent') }} {{ pn(row.absentDays) }} ·
                  {{ t('attendance.pwa.kpiLeave') }} {{ pn(row.leaveDays) }}
                </span>
                <span class="app-bar pg-bar-mini">
                  <span class="app-bar__fill" :style="{ width: `${row.rate}%` }" />
                </span>
              </span>
              <span class="app-row__tail">
                <span class="app-pill app-pill--green">{{ pn(row.rate) }}٪</span>
                <span class="app-muted pg-row-minutes">{{ formatMinutes(row.totalMinutes) }}</span>
              </span>
            </li>
          </ul>
        </section>

        <!-- Records -->
        <section v-else class="app-mt-16">
          <p class="app-muted pg-showing">
            {{ t('attendance.showing', { shown: pn(filteredRecords.length), total: pn(records.length) }) }}
          </p>

          <div v-if="!filteredRecords.length" class="app-empty">
            <span class="app-empty__icon"><Icon name="lucide:calendar-x" size="26" /></span>
            <p>{{ t('attendance.noRecordsDesc') }}</p>
          </div>

          <div v-else class="app-list">
            <div v-for="record in filteredRecords" :key="record.id" class="app-row">
              <span class="app-avatar">{{ initials(record.staffName) }}</span>
              <span class="app-row__body">
                <span class="app-row__title">{{ record.staffName || t('attendance.staffName') }}</span>
                <span class="app-row__sub">
                  <template v-if="record.sessions?.length">{{ sessionLabel(record.sessions) }}</template>
                  <template v-else>{{ t('attendance.notRecordedToday') }}</template>
                </span>
                <span class="app-row__sub pg-row-date">
                  {{ prettyDate(record.date) }}
                  <template v-if="record.workLocation">
                    · <Icon :name="locationIcon(record.workLocation)" size="12" />
                    {{ locationLabel(record.workLocation) }}
                  </template>
                </span>
              </span>
              <span class="app-row__tail">
                <span class="app-pill" :class="statusPill(record.status)">{{ statusLabel(record.status) }}</span>
                <span v-if="record.workedMinutes" class="app-muted pg-row-minutes">
                  {{ formatMinutes(record.workedMinutes) }}
                </span>
              </span>
              <button
                type="button"
                class="app-iconbtn"
                :aria-label="t('attendance.edit')"
                @click="openEditor(record)"
              >
                <Icon name="lucide:pencil" size="16" />
              </button>
              <button
                type="button"
                class="app-iconbtn att-del"
                :aria-label="t('attendance.delete')"
                @click="openDelete(record)"
              >
                <Icon name="lucide:trash-2" size="17" />
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- ══════════ Personal month ══════════ -->
      <section class="app-mt-16">
        <div class="app-section">
          <h2>{{ t('attendance.pwa.myMonth') }}</h2>
          <button type="button" @click="reloadSelf">{{ t('attendance.refresh') }}</button>
        </div>

        <AppMonthHeatmap
          v-model:cursor="cursor"
          :records="selfRecords"
          :selected-date="selectedDate"
          @select="selectDay"
        />

        <div class="app-stats app-mt-16">
          <div class="app-stat">
            <span class="app-stat__label">
              <Icon name="lucide:check-circle-2" size="14" /> {{ t('attendance.pwa.kpiWorked') }}
            </span>
            <span class="app-stat__value">{{ pn(selfKpis.workedDays) }}</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label">
              <Icon name="lucide:percent" size="14" /> {{ t('attendance.attendanceRate') }}
            </span>
            <span class="app-stat__value">{{ pn(selfKpis.rate) }}٪</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label">
              <Icon name="lucide:timer" size="14" /> {{ t('attendance.pwa.kpiTotal') }}
            </span>
            <span class="app-stat__value">{{ formatMinutes(selfKpis.totalMinutes) }}</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label">
              <Icon name="lucide:flame" size="14" /> {{ t('attendance.pwa.kpiStreak') }}
            </span>
            <span class="app-stat__value">{{ pn(selfKpis.streak) }}</span>
          </div>
        </div>

        <div v-if="!selfRecords.length" class="app-empty">
          <span class="app-empty__icon"><Icon name="lucide:calendar-x" size="26" /></span>
          <p>{{ t('attendance.noSelfRecordsDesc') }}</p>
        </div>

        <div v-else class="app-list app-mt-16">
          <div v-for="record in selfRecords" :key="record.id" class="app-row">
            <span class="app-avatar pg-day-avatar">{{ pn(dayOf(record.date)) }}</span>
            <span class="app-row__body">
              <span class="app-row__title">{{ weekday(record.date) }}</span>
              <span class="app-row__sub">
                <template v-if="record.sessions?.length">{{ sessionLabel(record.sessions) }}</template>
                <template v-else>—</template>
              </span>
            </span>
            <span class="app-row__tail">
              <span class="app-pill" :class="statusPill(record.status)">{{ statusLabel(record.status) }}</span>
              <span v-if="record.workedMinutes" class="app-muted pg-row-minutes">
                {{ formatMinutes(record.workedMinutes) }}
              </span>
            </span>
          </div>
        </div>
      </section>
    </template>

    <!-- ══════════ Sheets & dialogs ══════════ -->
    <AppAttendanceEditor v-model="editorOpen" :record="editingRecord" @saved="reloadAll" />
    <AppAttendanceBulk v-model="bulkOpen" @saved="reloadAll" />

    <UiConfirmDialog
      v-model="deleteOpen"
      variant="danger"
      :title="t('attendance.pwa.deleteTitle')"
      :message="deleteMessage"
      :confirm-label="t('attendance.pwa.deleteConfirm')"
      :cancel-label="t('attendance.pwa.deleteCancel')"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ATTENDANCE_STATUSES,
  WORK_LOCATIONS,
  type AttendanceRecord,
  type AttendanceReport,
  type AttendanceSession,
  type AttendanceStatus,
  type WorkLocation,
} from '~/types/attendance'
import { nowJalaliMoment, type JalaliMoment } from '~/composables/useAttendance'
import type { PunchResult } from '~/composables/useAttendancePwa'

definePageMeta({ layout: 'app', appTitle: 'حضور و غیاب', appSubtitle: 'تردد کارکنان' })

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface StaffSummaryRow {
  staffId: string
  staffName: string
  presentDays: number
  lateDays: number
  absentDays: number
  leaveDays: number
  holidayDays: number
  workedDays: number
  totalMinutes: number
  rate: number
}

const { user } = useAuth()
const { apiFetch } = useApi()
const { t } = useI18n()
const { pn } = useLang()
const { formatMinutes, todayJalali } = useFormatting()
const { $toast } = useNuxtApp()
const { statusLabel, statusPill, locationLabel, locationIcon, initials, sessionLabel, sessionLabelItem, dayOf, weekday, prettyDate, monthTitle, computeKpis } = useAttendance()
const { isOnline, pendingCount, flushing, punch, flush, saveSnapshot, readSnapshot } = useAttendancePwa()
const { downloadCsv, buildSummary, share } = useAttendanceExport()
const route = useRoute()

// Only patients are barred from logging their own attendance; every other
// clinic role (admin, doctors, lab, pharmacy, staff) can check in and out.
const canPunch = computed(() => Boolean(user.value) && user.value?.role !== 'patient')
const isAdmin = computed(() => user.value?.role === 'admin_doctor')

/**
 * The Jalali day the device is on.
 *
 * It is a ref and not a constant because a shift can cross midnight: the
 * punch card has to follow the day the staff member is working on.
 */
const today = ref(todayJalali())

const records = ref<AttendanceRecord[]>([])
const selfRecords = ref<AttendanceRecord[]>([])
const loading = ref(true)
const refreshing = ref(false)
const punchBusy = ref(false)

const workLocation = ref<WorkLocation>('clinic')

// Admin filters
const filters = reactive({
  startDate: nowJalaliMoment().startOf('jMonth').format('jYYYY-jMM-jDD'),
  endDate: today.value,
})
const statusFilter = ref<AttendanceStatus | null>(null)
const staffFilter = ref('')
const adminView = ref<'records' | 'summary'>('records')

// Personal month
const cursor = ref<JalaliMoment>(nowJalaliMoment())
const selectedDate = ref<string | null>(null)

// Editors
const editorOpen = ref(false)
const editingRecord = ref<AttendanceRecord | null>(null)
const bulkOpen = ref(false)

// Admin record deletion
const deleteOpen = ref(false)
const deleteTarget = ref<AttendanceRecord | null>(null)
const deleting = ref(false)

const todayLabel = computed(() => prettyDate(today.value))

/**
 * Sessions the device applied on its own.
 *
 * A punch that is queued while offline — or one the server has not echoed back
 * yet — has to show up in the app right away. Without it the button keeps
 * offering a check-in that already happened, which is exactly the symptom the
 * attendance screen is judged by.
 */
const localSessions = ref<Record<string, AttendanceSession[]>>({})

/** Two session stamps belong to the same punch when they are the same instant. */
function sameMoment(a: string | null, b: string | null): boolean {
  if (!a || !b) return false
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 1000
}

/** Merges the server sessions with the locally applied ones, the local ones win. */
function mergeSessions(base: AttendanceSession[], overlay: AttendanceSession[]): AttendanceSession[] {
  const byId = new Map<string, AttendanceSession>()
  for (const session of base) if (session.id) byId.set(session.id, session)

  for (const session of overlay) {
    if (!session.id) continue
    if (base.some((known) => known.id === session.id)) {
      // The server knows this session — the local copy carries the punch.
      byId.set(session.id, session)
      continue
    }
    // A queued punch the server has recorded under an id of its own.
    if (base.some((known) => sameMoment(known.checkInTime, session.checkInTime))) continue
    byId.set(session.id, session)
  }

  return [...byId.values()].sort(
    (a, b) => new Date(a.checkInTime ?? 0).getTime() - new Date(b.checkInTime ?? 0).getTime(),
  )
}

/** Worked minutes of a session list — an open session has not counted yet. */
function minutesOf(sessions: AttendanceSession[]): number {
  return sessions.reduce((total, session) => {
    if (!session.checkInTime || !session.checkOutTime) return total
    const minutes = Math.round(
      (new Date(session.checkOutTime).getTime() - new Date(session.checkInTime).getTime()) / 60000,
    )
    return total + minutes
  }, 0)
}

const todayRecord = computed<AttendanceRecord | null>(() => {
  const base = selfRecords.value.find((r) => r.date === today.value) ?? null
  const overlay = localSessions.value[today.value]
  if (!overlay?.length) return base

  const sessions = mergeSessions(base?.sessions ?? [], overlay)
  return {
    id: base?.id ?? `local-${today.value}`,
    staffId: base?.staffId ?? user.value?.id ?? '',
    staffName: base?.staffName ?? user.value?.fullName ?? null,
    date: today.value,
    status: base?.status ?? 'present',
    workLocation: base?.workLocation ?? workLocation.value,
    notes: base?.notes ?? null,
    adminNotes: base?.adminNotes ?? null,
    sessions,
    workedMinutes: minutesOf(sessions),
  }
})

const selfOpen = computed(() =>
  (todayRecord.value?.sessions ?? []).some((s) => s.checkInTime && !s.checkOutTime),
)
const openSession = computed(
  () => (todayRecord.value?.sessions ?? []).find((s) => s.checkInTime && !s.checkOutTime) ?? null,
)

const punchTitle = computed(() => {
  if (selfOpen.value) return t('attendance.currentlyWorking')
  if (todayRecord.value) return t('attendance.pwa.punchDone')
  return t('attendance.newCheckIn')
})

const punchHint = computed(() => {
  if (selfOpen.value) return t('attendance.punchWorkingDesc')
  if (todayRecord.value) return t('attendance.pwa.punchDoneDesc')
  return t('attendance.punchIdleDesc')
})

// ── Live session timer ─────────────────────────────────────────
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

const liveElapsed = computed(() => {
  const started = openSession.value?.checkInTime
  if (!started) return '--:--:--'
  const from = new Date(started).getTime()
  if (Number.isNaN(from)) return '--:--:--'
  const diff = Math.max(0, now.value - from)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
})

// ── Derived report data ────────────────────────────────────────
const statusCounts = computed(() => {
  const counts = { present: 0, late: 0, absent: 0, leave: 0, holiday: 0 } as Record<AttendanceStatus, number>
  for (const record of records.value) counts[record.status] = (counts[record.status] ?? 0) + 1
  return counts
})

const staffOptions = computed(() => {
  const map = new Map<string, string>()
  for (const record of records.value) {
    if (record.staffId && !map.has(record.staffId)) map.set(record.staffId, record.staffName || '—')
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fa'))
})

const filteredRecords = computed(() =>
  records.value.filter((record) => {
    if (statusFilter.value && record.status !== statusFilter.value) return false
    if (staffFilter.value && record.staffId !== staffFilter.value) return false
    return true
  }),
)

const adminKpis = computed(() => computeKpis(filteredRecords.value))
const selfKpis = computed(() => computeKpis(selfRecords.value))

const summaryRows = computed<StaffSummaryRow[]>(() => {
  const map = new Map<string, StaffSummaryRow>()

  for (const record of filteredRecords.value) {
    const key = record.staffId || record.id
    if (!map.has(key)) {
      map.set(key, {
        staffId: key,
        staffName: record.staffName || '—',
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        leaveDays: 0,
        holidayDays: 0,
        workedDays: 0,
        totalMinutes: 0,
        rate: 0,
      })
    }
    const row = map.get(key)!
    if (record.status === 'present') row.presentDays++
    else if (record.status === 'late') row.lateDays++
    else if (record.status === 'absent') row.absentDays++
    else if (record.status === 'leave') row.leaveDays++
    else if (record.status === 'holiday') row.holidayDays++
    if (record.status === 'present' || record.status === 'late') row.workedDays++
    row.totalMinutes += record.workedMinutes || 0
  }

  const rows = [...map.values()]
  for (const row of rows) {
    const days = row.presentDays + row.lateDays + row.absentDays + row.leaveDays + row.holidayDays
    row.rate = days ? Math.round((row.workedDays / days) * 100) : 0
  }
  return rows.sort((a, b) => b.totalMinutes - a.totalMinutes)
})

/** The rows the export and the share sheet operate on. */
const exportRecords = computed(() => (isAdmin.value ? filteredRecords.value : selfRecords.value))

// ── Data loading ───────────────────────────────────────────────
async function fetchReport() {
  if (!isAdmin.value) return
  try {
    const params = new URLSearchParams({ startDate: filters.startDate, endDate: filters.endDate })
    const res = await apiFetch<ApiEnvelope<AttendanceReport>>(`/api/staff/attendance/report?${params}`)
    records.value = res?.success && Array.isArray(res.data?.records) ? res.data.records : []
    saveSnapshot('report', records.value)
  } catch {
    // Fall back to the last cached report so the screen is not empty offline.
    const cached = readSnapshot<AttendanceRecord[]>('report')
    if (cached?.length) records.value = cached
  }
}

async function fetchSelf() {
  try {
    const res = await apiFetch<ApiEnvelope<AttendanceRecord[]>>(
      `/api/staff/attendance/me?month=${cursor.value.format('jM')}&year=${cursor.value.format('jYYYY')}`,
    )
    selfRecords.value = (res?.success && Array.isArray(res.data) ? res.data : [])
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
    saveSnapshot(`self.${cursor.value.format('jYYYY-jMM')}`, selfRecords.value)
    // The server confirmed whatever it knows about — the local overlay can go.
    dropConfirmedOverlay()
  } catch {
    const cached = readSnapshot<AttendanceRecord[]>(`self.${cursor.value.format('jYYYY-jMM')}`)
    if (cached?.length) selfRecords.value = cached
  }
}

async function reloadAll() {
  refreshing.value = true
  await Promise.all([fetchReport(), fetchSelf()])
  refreshing.value = false
}

async function reloadSelf() {
  await fetchSelf()
}

async function refresh() {
  loading.value = true
  await Promise.all([fetchReport(), fetchSelf()])
  loading.value = false
}

function onRangeChange() {
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    filters.endDate = filters.startDate
  }
  void fetchReport()
}

function selectDay(date: string) {
  selectedDate.value = selectedDate.value === date ? null : date
  if (!isAdmin.value) return
  filters.startDate = date
  filters.endDate = date
  void fetchReport()
}

// ── Punching ───────────────────────────────────────────────────

/**
 * Applies a punch to the screen before the server is asked again.
 *
 * The server response is the source of truth whenever it arrived; a queued
 * punch is applied locally instead, so the button turns into the other action
 * right away.
 */
function applyPunch(result: PunchResult) {
  const date = result.date
  const known = selfRecords.value.find((r) => r.date === date)?.sessions ?? []
  const current = mergeSessions(known, localSessions.value[date] ?? [])

  let sessions: AttendanceSession[] | null = null

  if (result.record?.sessions?.length) {
    sessions = result.record.sessions
  } else if (result.local) {
    if (result.local.action === 'check-in') {
      sessions = [...current, { id: result.local.id, checkInTime: result.local.at, checkOutTime: null }]
    } else {
      let openIndex = -1
      for (let i = current.length - 1; i >= 0; i -= 1) {
        if (current[i]?.checkInTime && !current[i]?.checkOutTime) {
          openIndex = i
          break
        }
      }
      if (openIndex >= 0) {
        sessions = current.map((session, i) =>
          i === openIndex ? { ...session, checkOutTime: result.local?.at ?? null } : session,
        )
      }
    }
  }

  if (!sessions) return
  localSessions.value = { ...localSessions.value, [date]: sessions }
}

/** Forgets the local sessions the server has confirmed in the meantime. */
function dropConfirmedOverlay() {
  const next: Record<string, AttendanceSession[]> = { ...localSessions.value }
  let changed = false
  for (const [date, sessions] of Object.entries(next)) {
    const server = selfRecords.value.find((r) => r.date === date)
    if (!server) continue
    const confirmed = sessions.every(
      (session) =>
        session.id &&
        server.sessions.some(
          (known) =>
            known.id === session.id || sameMoment(known.checkInTime, session.checkInTime),
        ),
    )
    if (confirmed) {
      delete next[date]
      changed = true
    }
  }
  if (changed) localSessions.value = next
}

async function togglePunch() {
  punchBusy.value = true
  try {
    const action = selfOpen.value ? 'check-out' : 'check-in'
    const result = await punch(action, { workLocation: workLocation.value })

    if (!result.ok) {
      $toast.error(action === 'check-in' ? t('attendance.checkInError') : t('attendance.checkOutError'))
      return
    }

    // The button follows the punch right away; the refresh below only
    // reconciles the record with the server.
    applyPunch(result)

    if (result.queued) {
      $toast.info(t('attendance.pwa.punchQueued'))
    } else {
      $toast.success(action === 'check-in' ? t('attendance.checkInSuccess') : t('attendance.checkOutSuccess'))
    }

    await Promise.all([fetchReport(), fetchSelf()])
  } catch (err: unknown) {
    const data = (err as { data?: { error?: string; message?: string } })?.data
    $toast.error(data?.error || data?.message || t('attendance.saveError'))
  } finally {
    punchBusy.value = false
  }
}

async function flushPending() {
  // The queue watcher refreshes the records once the queue drains.
  await flush()
}

// ── Export & share ─────────────────────────────────────────────
function exportCsv() {
  if (!exportRecords.value.length) {
    $toast.error(t('attendance.pwa.shareEmpty'))
    return
  }
  const name = isAdmin.value
    ? `attendance-${filters.startDate}-${filters.endDate}`
    : `attendance-${cursor.value.format('jYYYY-jMM')}`
  downloadCsv(exportRecords.value, `${name}.csv`)
  $toast.success(t('attendance.pwa.csvDownloaded'))
}

async function shareReport() {
  if (!exportRecords.value.length) {
    $toast.error(t('attendance.pwa.shareEmpty'))
    return
  }
  const heading = isAdmin.value
    ? `${t('attendance.pwa.shareHeading')} · ${filters.startDate} — ${filters.endDate}`
    : `${t('attendance.pwa.shareHeading')} · ${monthTitle(cursor.value)}`

  const outcome = await share(buildSummary(exportRecords.value, heading), t('attendance.title'))
  if (outcome === 'shared') $toast.success(t('attendance.pwa.shared'))
  else if (outcome === 'copied') $toast.success(t('attendance.pwa.copied'))
  else $toast.error(t('attendance.pwa.shareFailed'))
}

// ── Editing ────────────────────────────────────────────────────
function openEditor(record: AttendanceRecord) {
  editingRecord.value = record
  editorOpen.value = true
}

function openDelete(record: AttendanceRecord) {
  deleteTarget.value = record
  deleteOpen.value = true
}

const deleteMessage = computed(() =>
  deleteTarget.value
    ? `${t('attendance.pwa.deleteMessage')} «${deleteTarget.value.staffName || '—'}» — ${prettyDate(deleteTarget.value.date)}`
    : '',
)

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/staff/attendance/${deleteTarget.value.id}`, {
      method: 'DELETE',
    })
    if (res?.success) {
      $toast.success(t('attendance.pwa.deleted'))
      deleteOpen.value = false
      // Deleting a record can move both the team report and the admin's own history.
      await Promise.all([fetchReport(), fetchSelf()])
    }
  } catch {
    $toast.error(t('attendance.pwa.deleteFailed'))
  } finally {
    deleting.value = false
  }
}

// ── Lifecycle ──────────────────────────────────────────────────
// `user` is hydrated from localStorage on mount, so the role can resolve a tick
// after this page's own hook. Re-run once it lands so the view never stays blank.
let bootstrapped = false
watch(
  () => user.value?.role,
  () => {
    if (bootstrapped) void refresh()
  },
)

watch(cursor, () => void fetchSelf())

// The queue is also replayed on its own once the connection is back, so the
// screen has to refresh whenever it drains — not only after a manual flush.
watch(pendingCount, (count, previous) => {
  if (previous > 0 && count === 0) {
    // The queue is empty again, so the server owns the record and the local
    // overlay has served its purpose.
    localSessions.value = {}
    void Promise.all([fetchReport(), fetchSelf()])
  }
})

onMounted(async () => {
  bootstrapped = true
  ticker = setInterval(() => {
    now.value = Date.now()
    // A shift can cross midnight — the card follows the day on the device.
    const current = todayJalali()
    if (current !== today.value) {
      today.value = current
      void fetchSelf()
    }
  }, 1000)
  // Always resolve the loading state — without a cached user the screen would
  // keep its skeleton forever instead of showing the access notice.
  await refresh()
  // The deep link has to wait for the records: without them the page cannot
  // tell that the user is already checked in and would punch a second time.
  await handleDeepLink()
})

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
})

/** `?action=checkin` opens the app straight into a check-in. */
async function handleDeepLink() {
  if (route.query.action !== 'checkin') return
  if (!canPunch.value || selfOpen.value) return

  const result = await punch('check-in', { workLocation: workLocation.value })
  if (result.ok) {
    applyPunch(result)
    if (result.queued) $toast.info(t('attendance.pwa.punchQueued'))
    else $toast.success(t('attendance.checkInSuccess'))
    await Promise.all([fetchReport(), fetchSelf()])
  }
  await navigateTo({ path: route.path, query: {} }, { replace: true })
}
</script>

<style scoped>
.pg-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.pg-bar::-webkit-scrollbar {
  display: none;
}

.pg-flush {
  width: auto;
  flex: 0 0 auto;
  margin-inline-start: auto;
  padding: 7px 11px;
  font-size: 12px;
}

.punch {
  text-align: center;
}

.punch__eyebrow {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-muted);
  margin-bottom: 10px;
}

.punch__title {
  margin-top: 12px;
  font-size: 17px;
  font-weight: 800;
}

.punch__hint {
  margin-top: 4px;
  font-size: 12.5px;
}

.punch__timer {
  justify-content: center;
  margin-top: 14px;
  padding: 9px 14px;
  border-radius: 999px;
  background: var(--app-green-soft);
  color: var(--app-income);
  font-size: 13px;
}

.punch__timer__cap {
  opacity: 0.8;
}

.app-timer__value {
  font-weight: 800;
  font-size: 15px;
}

.punch__locations {
  justify-content: center;
  margin-top: 14px;
  padding-bottom: 2px;
}

.punch__worked {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  font-size: 12.5px;
}

.punch__sessions {
  justify-content: center;
  margin-top: 12px;
}

.app-avatar--lg {
  width: 64px;
  height: 64px;
  font-size: 22px;
  margin: 0 auto;
}

.pg-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pg-filters__dates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pg-filters__label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--app-text-2);
  margin-bottom: 6px;
}

.pg-filters__staff {
  margin-top: 2px;
}

.pg-toggle {
  width: 100%;
}

.pg-toggle .app-seg__btn {
  flex: 1 1 auto;
}

.pg-showing {
  font-size: 12px;
  margin: 0 2px 8px;
}

.pg-row-minutes {
  display: block;
  margin-top: 6px;
  font-size: 11.5px;
}

.pg-row-date {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 11.5px;
}

.pg-bar-mini {
  display: block;
  margin-top: 7px;
  max-width: 150px;
}

.pg-day-avatar {
  width: 40px;
  height: 40px;
  font-size: 12px;
}

.app-offline__hint {
  display: block;
  margin-top: 2px;
  font-size: 11.5px;
  opacity: 0.85;
}

.app-spin {
  animation: app-spin 0.9s linear infinite;
}

@keyframes app-spin {
  to {
    transform: rotate(360deg);
  }
}

.att-del {
  width: 34px;
  height: 34px;
  color: var(--app-expense);
  background: var(--app-rose-soft);
}

@media (max-width: 420px) {
  .pg-filters__dates {
    grid-template-columns: 1fr;
  }
}
</style>
