<template>
  <AppSheet
    :model-value="modelValue"
    :title="t('attendance.editRecordTitle')"
    :subtitle="subtitle"
    :closeable="!saving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="ed-grid">
      <!-- Status -->
      <section class="ed-field ed-field--full">
        <span class="ed-label">{{ t('attendance.statusTitle') }} *</span>
        <div class="app-seg ed-seg" role="group" :aria-label="t('attendance.statusTitle')">
          <button
            v-for="status in ATTENDANCE_STATUSES"
            :key="status"
            type="button"
            class="app-seg__btn"
            :class="{ active: form.status === status }"
            :aria-pressed="form.status === status"
            :disabled="saving"
            @click="form.status = status"
          >
            {{ statusLabel(status) }}
          </button>
        </div>
      </section>

      <!-- Work location -->
      <section class="ed-field ed-field--full">
        <span class="ed-label">{{ t('attendance.workLocation') }}</span>
        <div class="app-chips">
          <button
            v-for="location in WORK_LOCATIONS"
            :key="location"
            type="button"
            class="app-chip"
            :class="{ 'app-chip--on': form.workLocation === location }"
            :disabled="saving"
            @click="form.workLocation = location"
          >
            <Icon :name="locationIcon(location)" size="14" />
            {{ locationLabel(location) }}
          </button>
        </div>
      </section>

      <!-- Sessions -->
      <section class="ed-field ed-field--full">
        <div class="ed-label-row">
          <span class="ed-label">{{ t('attendance.sessions') }}</span>
          <button
            type="button"
            class="app-btn app-btn--ghost ed-add"
            :disabled="saving"
            @click="addSession"
          >
            <Icon name="lucide:plus" size="15" />
            {{ t('attendance.addSession') }}
          </button>
        </div>

        <p v-if="!form.sessions.length" class="ed-hint">{{ t('attendance.noSessionsYet') }}</p>

        <ul v-else class="ed-sessions">
          <li v-for="(session, index) in form.sessions" :key="index" class="ed-session">
            <span class="ed-session__idx">{{ pn(index + 1) }}</span>

            <div class="ed-session__inputs">
              <label class="ed-time">
                <span class="ed-time__cap">{{ t('attendance.checkIn') }}</span>
                <input
                  v-model="session.checkInTime"
                  class="app-input ed-time__input"
                  type="time"
                  dir="ltr"
                  step="300"
                  :aria-label="`${t('attendance.sessions')} ${index + 1} — ${t('attendance.checkIn')}`"
                >
              </label>
              <span class="ed-session__dash" aria-hidden="true">{{ t('attendance.to') }}</span>
              <label class="ed-time">
                <span class="ed-time__cap">{{ t('attendance.checkOut') }}</span>
                <input
                  v-model="session.checkOutTime"
                  class="app-input ed-time__input"
                  type="time"
                  dir="ltr"
                  step="300"
                  :aria-label="`${t('attendance.sessions')} ${index + 1} — ${t('attendance.checkOut')}`"
                >
              </label>
            </div>

            <button
              type="button"
              class="app-iconbtn ed-del"
              :disabled="saving"
              :aria-label="t('attendance.removeSession')"
              :title="t('attendance.removeSession')"
              @click="removeSession(index)"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>

            <p v-if="sessionError(session)" class="ed-session__err">{{ sessionError(session) }}</p>
          </li>
        </ul>
      </section>

      <!-- Notes -->
      <AppField :label="t('attendance.staffNote')" class="ed-field">
        <textarea
          v-model.trim="form.notes"
          class="app-input ed-textarea"
          rows="2"
          maxlength="1000"
          :disabled="saving"
        />
      </AppField>

      <AppField :label="t('attendance.adminNote')" class="ed-field">
        <textarea
          v-model.trim="form.adminNotes"
          class="app-input ed-textarea"
          rows="2"
          maxlength="1000"
          :disabled="saving"
        />
      </AppField>
    </div>

    <div class="ed-total">
      <span class="ed-total__label">{{ t('attendance.workDuration') }}</span>
      <span class="ed-total__value">{{ formatMinutes(form.totalMinutes) }}</span>
    </div>

    <template #footer>
      <button type="button" class="app-btn app-btn--ghost" :disabled="saving" @click="close">
        {{ t('common.cancel') }}
      </button>
      <button type="button" class="app-btn app-btn--primary" :disabled="saving" @click="submit">
        <Icon v-if="saving" name="lucide:loader-2" size="16" class="ed-spin" />
        <Icon v-else name="lucide:check" size="16" />
        {{ t('common.save') }}
      </button>
    </template>
  </AppSheet>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  ATTENDANCE_STATUSES,
  WORK_LOCATIONS,
  type AttendanceRecord,
  type AttendanceSessionInput,
  type AttendanceStatus,
  type WorkLocation,
} from '~/types/attendance'

const props = defineProps<{
  modelValue: boolean
  record: AttendanceRecord | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { formatMinutes } = useFormatting()
const { statusLabel, locationLabel, locationIcon, prettyDate } = useAttendance()
const { $toast } = useNuxtApp()

const saving = ref(false)

const form = reactive({
  status: 'present' as AttendanceStatus,
  workLocation: 'clinic' as WorkLocation,
  notes: '',
  adminNotes: '',
  sessions: [] as AttendanceSessionInput[],
  totalMinutes: 0,
})

const subtitle = computed(() => {
  if (!props.record) return ''
  const position = props.record.staffPosition ? ` · ${props.record.staffPosition}` : ''
  return `${props.record.staffName || '—'}${position} · ${prettyDate(props.record.date)}`
})

/** `HH:mm` from an ISO timestamp; empty string when absent. */
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
  // A session crossing midnight is a data-entry mistake, not an all-nighter.
  return toMinutes > fromMinutes ? toMinutes - fromMinutes : 0
}

function recomputeTotal() {
  form.totalMinutes = form.sessions.reduce(
    (sum, session) => sum + minutesBetween(session.checkInTime, session.checkOutTime),
    0,
  )
}

function sessionError(session: AttendanceSessionInput): string | null {
  if (!session.checkInTime) return t('attendance.sessionInRequired')
  if (session.checkOutTime && minutesBetween(session.checkInTime, session.checkOutTime) === 0) {
    return t('attendance.sessionRangeInvalid')
  }
  return null
}

function addSession() {
  const last = form.sessions[form.sessions.length - 1]
  const start = last?.checkOutTime || '08:00'
  const parsed = parseClock(start)
  const end = parsed
    ? `${String(Math.min(23, parsed.h + 4)).padStart(2, '0')}:${String(parsed.m).padStart(2, '0')}`
    : '16:00'
  form.sessions.push({ checkInTime: start, checkOutTime: end })
  recomputeTotal()
}

function removeSession(index: number) {
  form.sessions.splice(index, 1)
  recomputeTotal()
}

function hydrate() {
  const record = props.record
  if (!record) {
    form.status = 'present'
    form.workLocation = 'clinic'
    form.notes = ''
    form.adminNotes = ''
    form.sessions = []
    form.totalMinutes = 0
    return
  }
  form.status = record.status ?? 'present'
  form.workLocation = record.workLocation ?? 'clinic'
  form.notes = record.notes ?? ''
  form.adminNotes = record.adminNotes ?? ''
  form.sessions = (record.sessions ?? [])
    .map((session) => ({
      checkInTime: toTimeInput(session.checkInTime),
      checkOutTime: toTimeInput(session.checkOutTime),
    }))
    .filter((session) => session.checkInTime)
  recomputeTotal()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate()
  },
)

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
  if (!props.record) return
  if (form.sessions.some(sessionError)) {
    $toast.error(t('attendance.fixSessionsFirst'))
    return
  }

  saving.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/staff/attendance/${props.record.id}`, {
      method: 'PUT',
      body: {
        status: form.status,
        workLocation: form.workLocation,
        notes: form.notes.trim() || null,
        adminNotes: form.adminNotes.trim() || null,
        // An empty array clears the sessions instead of leaving them untouched.
        sessions: form.sessions.map((session) => ({
          checkInTime: session.checkInTime,
          checkOutTime: session.checkOutTime || undefined,
        })),
      },
    })
    if (res.success) {
      $toast.success(t('attendance.recordUpdated'))
      emit('saved')
      emit('update:modelValue', false)
    }
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('attendance.updateError')))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ed-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.ed-field--full {
  grid-column: 1 / -1;
}

.ed-label,
.ed-label-row .ed-label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--app-text-2);
  margin-bottom: 6px;
}

.ed-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.ed-label-row .ed-label {
  margin-bottom: 0;
}

.ed-add {
  width: auto;
  flex: 0 0 auto;
  padding: 7px 12px;
  font-size: 12.5px;
}

.ed-seg {
  display: flex;
  width: 100%;
}

.ed-seg .app-seg__btn {
  flex: 1 1 auto;
  padding-inline: 10px;
  font-size: 12.5px;
}

.ed-hint {
  font-size: 12.5px;
  color: var(--app-muted);
  padding: 10px 0;
}

.ed-sessions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ed-session {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  background: var(--app-surface-2);
}

.ed-session__idx {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--app-brand-soft);
  color: var(--app-brand-deep);
  font-size: 11.5px;
  font-weight: 800;
}

.dark .ed-session__idx {
  color: var(--app-brand-ink);
}

.ed-session__inputs {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  flex: 1 1 12rem;
  min-width: 0;
}

.ed-session__dash {
  padding-bottom: 13px;
  font-size: 12px;
  color: var(--app-muted);
}

.ed-session__err {
  flex: 1 0 100%;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--app-expense);
}

.ed-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 0;
  min-width: 0;
}

.ed-time__cap {
  font-size: 11.5px;
  color: var(--app-muted);
}

.ed-time__input {
  padding: 9px 10px;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.ed-del {
  width: 34px;
  height: 34px;
  color: var(--app-expense);
  background: var(--app-rose-soft);
  border-color: transparent;
}

.ed-textarea {
  min-height: 58px;
  resize: vertical;
}

.ed-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--app-brand-soft);
}

.ed-total__label {
  font-size: 12.5px;
  color: var(--app-text-2);
}

.ed-total__value {
  font-size: 15px;
  font-weight: 800;
  color: var(--app-brand-deep);
}

.dark .ed-total__value {
  color: var(--app-brand-ink);
}

.ed-spin {
  animation: ed-spin 0.8s linear infinite;
}

@keyframes ed-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 460px) {
  .ed-grid {
    grid-template-columns: 1fr;
  }
}
</style>
