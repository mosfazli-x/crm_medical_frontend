<template>
  <AppSheet
    :model-value="modelValue"
    :title="t('attendance.bulkTitle')"
    :subtitle="t('attendance.bulkSubtitle')"
    :closeable="!saving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AppField :label="t('attendance.bulkDate')">
      <PersianDatetimePicker
        v-model="form.date"
        type="date"
        format="jYYYY-jMM-jDD"
        display-format="jYYYY/jMM/jDD"
        color="#5f8feb"
        auto-submit
        clearable
        append-to="body"
        :disabled="saving"
        :placeholder="t('attendance.bulkDatePlaceholder')"
        input-class="app-input"
        @change="onDateChange"
      />
    </AppField>

    <div class="bk-quick">
      <span class="bk-quick__label">{{ t('attendance.bulkQuickSet') }}</span>
      <div class="app-chips">
        <button
          v-for="status in QUICK_STATUSES"
          :key="status"
          type="button"
          class="app-chip"
          :disabled="saving || !rows.length"
          @click="applyToAll(status)"
        >
          {{ statusLabel(status) }}
        </button>
      </div>
    </div>

    <p class="bk-summary">{{ t('attendance.bulkSummary', { saved: existingCount, total: rows.length }) }}</p>

    <div v-if="loadingStaff" class="app-list">
      <div v-for="i in 5" :key="`sk-${i}`" class="app-skel" style="height: 62px;" />
    </div>

    <p v-else-if="!rows.length" class="bk-empty">{{ t('attendance.bulkNoStaff') }}</p>

    <ul v-else class="bk-list">
      <li v-for="row in rows" :key="row.staffId" class="bk-row" :class="{ 'bk-row--open': row.expanded }">
        <div class="bk-row__main">
          <span class="app-avatar bk-avatar">{{ initials(row.name) }}</span>

          <span class="bk-row__body">
            <span class="bk-row__name">{{ row.name || '—' }}</span>
            <span class="bk-row__meta">
              <span class="app-pill" :class="statusPill(row.status)">{{ statusLabel(row.status) }}</span>
              <span class="bk-row__badge">{{ row.existing ? t('attendance.bulkAlreadySaved') : t('attendance.bulkNew') }}</span>
            </span>
          </span>

          <button
            type="button"
            class="app-iconbtn bk-expand"
            :aria-label="t('attendance.pwa.bulkDetails')"
            :aria-expanded="row.expanded"
            @click="row.expanded = !row.expanded"
          >
            <Icon :name="row.expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="17" />
          </button>
        </div>

        <select v-model="row.status" class="app-input bk-select" :disabled="saving" :aria-label="t('attendance.statusTitle')">
          <option v-for="status in ATTENDANCE_STATUSES" :key="status" :value="status">
            {{ statusLabel(status) }}
          </option>
        </select>

        <div v-if="row.expanded" class="bk-detail">
          <!-- Sessions -->
          <div class="bk-detail__head">
            <span class="bk-detail__label">{{ t('attendance.sessions') }}</span>
            <button
              type="button"
              class="app-btn app-btn--ghost bk-add"
              :disabled="saving"
              @click="addSession(row)"
            >
              <Icon name="lucide:plus" size="14" />
              {{ t('attendance.addSession') }}
            </button>
          </div>

          <p v-if="!row.sessions.length" class="bk-hint">{{ t('attendance.noSessionsYet') }}</p>

          <ul v-else class="bk-sessions">
            <li v-for="(session, index) in row.sessions" :key="index" class="bk-session">
              <label class="bk-time">
                <span class="bk-time__cap">{{ t('attendance.checkIn') }}</span>
                <input
                  v-model="session.checkInTime"
                  class="app-input bk-time__input"
                  type="time"
                  dir="ltr"
                  step="300"
                >
              </label>
              <span class="bk-session__dash" aria-hidden="true">{{ t('attendance.to') }}</span>
              <label class="bk-time">
                <span class="bk-time__cap">{{ t('attendance.checkOut') }}</span>
                <input
                  v-model="session.checkOutTime"
                  class="app-input bk-time__input"
                  type="time"
                  dir="ltr"
                  step="300"
                >
              </label>
              <button
                type="button"
                class="app-iconbtn bk-del"
                :disabled="saving"
                :aria-label="t('attendance.removeSession')"
                @click="removeSession(row, index)"
              >
                <Icon name="lucide:trash-2" size="15" />
              </button>
            </li>
          </ul>

          <p v-if="rowError(row)" class="bk-error">{{ rowError(row) }}</p>

          <AppField :label="t('attendance.adminNote')" class="bk-note">
            <textarea
              v-model.trim="row.adminNotes"
              class="app-input bk-textarea"
              rows="2"
              maxlength="1000"
              :disabled="saving"
              :placeholder="t('attendance.bulkNotePlaceholder')"
            />
          </AppField>
        </div>
      </li>
    </ul>

    <template #footer>
      <button type="button" class="app-btn app-btn--ghost" :disabled="saving" @click="close">
        {{ t('common.cancel') }}
      </button>
      <button type="button" class="app-btn app-btn--primary" :disabled="saving || loadingStaff" @click="submit">
        <Icon v-if="saving" name="lucide:loader-2" size="16" class="bk-spin" />
        <Icon v-else name="lucide:clipboard-check" size="16" />
        {{ t('attendance.bulkSave') }}
      </button>
    </template>
  </AppSheet>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import {
  ATTENDANCE_STATUSES,
  type AttendanceRecord,
  type AttendanceSessionInput,
  type AttendanceStatus,
} from '~/types/attendance'

interface BulkRow {
  staffId: string
  name: string
  status: AttendanceStatus
  adminNotes: string
  sessions: AttendanceSessionInput[]
  existing: boolean
  expanded: boolean
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface UserRow {
  id: string
  fullName: string | null
  role: string
  status: string
}

/** Every role that can hold an attendance record — patients excluded. */
const CLINIC_ROLES = ['admin_doctor', 'doctor', 'lab', 'pharmacy', 'clinic_staff']
const QUICK_STATUSES: AttendanceStatus[] = ['present', 'late', 'absent', 'leave', 'holiday']

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const { apiFetch } = useApi()
const { statusLabel, statusPill, initials } = useAttendance()
const { $toast } = useNuxtApp()

const rows = ref<BulkRow[]>([])
const loadingStaff = ref(true)
const saving = ref(false)

const form = reactive({ date: moment().format('jYYYY-jMM-jDD') })

const existingCount = computed(() => rows.value.filter((row) => row.existing).length)

function toTimeInput(value: string | null | undefined): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

/** Parses an `HH:mm` string; null when the value is malformed. */
function parseClock(value: string): { h: number; m: number } | null {
  const parts = value.split(':')
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return { h, m }
}

function minutesBetween(start: string, end: string): number {
  if (!start || !end) return 0
  const from = parseClock(start)
  const to = parseClock(end)
  if (!from || !to) return 0
  const fromMinutes = from.h * 60 + from.m
  const toMinutes = to.h * 60 + to.m
  return toMinutes > fromMinutes ? toMinutes - fromMinutes : 0
}

function rowError(row: BulkRow): string | null {
  if (row.status !== 'present' && row.status !== 'late') return null
  if (!row.sessions.length) return null
  const bad = row.sessions.find(
    (session) => !session.checkInTime || minutesBetween(session.checkInTime, session.checkOutTime) === 0,
  )
  return bad ? t('attendance.sessionRangeInvalid') : null
}

function addSession(row: BulkRow) {
  const last = row.sessions[row.sessions.length - 1]
  const start = last?.checkOutTime || '08:00'
  const parsed = parseClock(start)
  const end = parsed
    ? `${String(Math.min(23, parsed.h + 4)).padStart(2, '0')}:${String(parsed.m).padStart(2, '0')}`
    : '16:00'
  row.sessions.push({ checkInTime: start, checkOutTime: end })
}

function removeSession(row: BulkRow, index: number) {
  row.sessions.splice(index, 1)
}

function applyToAll(status: AttendanceStatus) {
  for (const row of rows.value) row.status = status
}

/** Re-reads the roster once the chosen date changes. */
function onDateChange() {
  void nextTick(() => void hydrate())
}

/** Loads the roster and overlays whatever is already saved for the chosen date. */
async function hydrate() {
  if (!form.date) return
  loadingStaff.value = true
  try {
    const [usersRes, reportRes] = await Promise.all([
      apiFetch<ApiEnvelope<UserRow[]>>('/api/users'),
      apiFetch<ApiEnvelope<{ records: AttendanceRecord[] }>>(
        `/api/staff/attendance/report?startDate=${form.date}&endDate=${form.date}`,
      ),
    ])

    const staff = (usersRes.success && Array.isArray(usersRes.data) ? usersRes.data : []).filter(
      (member) => CLINIC_ROLES.includes(member.role) && member.status === 'approved',
    )

    const saved = new Map<string, AttendanceRecord>(
      (reportRes.success && Array.isArray(reportRes.data?.records) ? reportRes.data.records : []).map(
        (record) => [record.staffId, record],
      ),
    )

    rows.value = staff.map((member) => {
      const record = saved.get(member.id)
      return {
        staffId: member.id,
        name: member.fullName || '—',
        status: record?.status ?? 'present',
        adminNotes: record?.adminNotes ?? '',
        sessions: record
          ? (record.sessions ?? [])
              .map((session) => ({
                checkInTime: toTimeInput(session.checkInTime),
                checkOutTime: toTimeInput(session.checkOutTime),
              }))
              .filter((session) => session.checkInTime)
          : [],
        existing: Boolean(record),
        expanded: false,
      }
    })
  } catch {
    rows.value = []
    $toast.error(t('attendance.bulkLoadError'))
  } finally {
    loadingStaff.value = false
  }
}

function close() {
  if (saving.value) return
  emit('update:modelValue', false)
}

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const data = (err as { data?: { error?: string; message?: string } }).data
    if (data?.error) return data.error
    if (data?.message) return data.message
  }
  return fallback
}

async function submit() {
  if (!form.date) {
    $toast.error(t('attendance.dateRequired'))
    return
  }
  if (rows.value.some(rowError)) {
    $toast.error(t('attendance.fixSessionsFirst'))
    return
  }

  saving.value = true
  try {
    const res = await apiFetch<{ success: boolean; data?: { processed: number } }>(
      '/api/staff/attendance/bulk',
      {
        method: 'POST',
        body: {
          date: form.date,
          records: rows.value.map((row) => ({
            staffId: row.staffId,
            status: row.status,
            adminNotes: row.adminNotes.trim() || null,
            sessions: row.sessions.map((session) => ({
              checkInTime: session.checkInTime,
              checkOutTime: session.checkOutTime || undefined,
            })),
          })),
        },
      },
    )
    if (res.success) {
      $toast.success(t('attendance.attendanceSaved'))
      emit('saved')
      emit('update:modelValue', false)
    }
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('attendance.saveError')))
  } finally {
    saving.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.date = moment().format('jYYYY-jMM-jDD')
      void hydrate()
    }
  },
)
</script>

<style scoped>
.bk-quick {
  margin-top: 14px;
}

.bk-quick__label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--app-text-2);
  margin-bottom: 6px;
}

.bk-summary {
  margin: 12px 0 10px;
  font-size: 12px;
  color: var(--app-muted);
}

.bk-empty {
  padding: 28px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--app-muted);
}

.bk-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bk-row {
  padding: 11px 12px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  background: var(--app-surface-2);
}

.bk-row--open {
  border-color: var(--app-brand);
}

.bk-row__main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bk-avatar {
  width: 36px;
  height: 36px;
  font-size: 12px;
}

.bk-row__body {
  flex: 1 1 auto;
  min-width: 0;
}

.bk-row__name {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--app-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bk-row__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.bk-row__badge {
  font-size: 11px;
  color: var(--app-muted);
}

.bk-expand {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
}

.bk-select {
  margin-top: 10px;
  padding: 9px 11px;
  font-size: 13px;
}

.bk-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--app-border-strong);
}

.bk-detail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.bk-detail__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--app-text-2);
}

.bk-add {
  width: auto;
  flex: 0 0 auto;
  padding: 6px 10px;
  font-size: 12px;
}

.bk-hint {
  font-size: 12px;
  color: var(--app-muted);
  padding: 6px 0;
}

.bk-sessions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bk-session {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.bk-time {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1 1 0;
  min-width: 0;
}

.bk-time__cap {
  font-size: 11px;
  color: var(--app-muted);
}

.bk-time__input {
  padding: 8px 9px;
  font-size: 13.5px;
  font-variant-numeric: tabular-nums;
}

.bk-session__dash {
  padding-bottom: 11px;
  font-size: 12px;
  color: var(--app-muted);
}

.bk-del {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  color: var(--app-expense);
  background: var(--app-rose-soft);
  border-color: transparent;
}

.bk-error {
  margin-top: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--app-expense);
}

.bk-note {
  margin-top: 12px;
}

.bk-textarea {
  min-height: 52px;
  resize: vertical;
}

.bk-spin {
  animation: bk-spin 0.8s linear infinite;
}

@keyframes bk-spin {
  to { transform: rotate(360deg); }
}
</style>
