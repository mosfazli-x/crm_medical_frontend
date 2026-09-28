<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760"
    persistent
    transition="dialog-bottom-transition"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <div class="asa-dialog__head">
        <div class="attb-head">
          <span class="asa-tint asa-tint--indigo">
            <ClipboardCheck class="w-4! h-4! stroke-current" />
          </span>
          <div class="attb-head__copy">
            <h2 class="asa-dialog__title">{{ t('attendance.bulkTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('attendance.bulkSubtitle') }}</span>
          </div>
        </div>
        <button
          class="pf-x"
          type="button"
          :aria-label="t('common.close')"
          :disabled="saving"
          @click="close"
        >
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <v-card-text class="asa-dialog__body">
        <!-- Date + quick status -->
        <div class="attb-filters">
          <div class="attb-date">
            <span class="asa-field-label">{{ t('attendance.bulkDate') }} *</span>
            <PersianDatetimePicker
              v-model="form.date"
              class="asa-datepicker"
              type="date"
              input-format="jYYYY-jMM-jDD"
              display-format="jYYYY/jMM/jDD"
              format="jYYYY-jMM-jDD"
              color="#00ADB5"
              auto-submit
              :max="today"
              :placeholder="t('attendance.bulkDatePlaceholder')"
            />
          </div>

          <div class="attb-quick">
            <span class="asa-field-label">{{ t('attendance.bulkQuickSet') }}</span>
            <div class="pf-seg" role="group" :aria-label="t('attendance.bulkQuickSet')">
              <button
                v-for="option in quickStatuses"
                :key="option.value"
                type="button"
                class="pf-seg__btn"
                @click="applyToAll(option.value)"
              >
                {{ option.title }}
              </button>
            </div>
          </div>
        </div>

        <!-- Rows -->
        <div v-if="loadingStaff" class="pf-skel mt-3!">
          <div v-for="i in 5" :key="`bs-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-32! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
          </div>
        </div>

        <p v-else-if="!rows.length" class="pf-empty">
          <span class="asa-tint asa-tint--rose pf-tint-lg">
            <UserX class="w-6! h-6! stroke-current" />
          </span>
          <span class="pf-empty__title">{{ t('attendance.bulkNoStaff') }}</span>
        </p>

        <ul v-else class="attb-rows">
          <li
            v-for="row in rows"
            :key="row.staffId"
            class="attb-row"
            :class="{ 'attb-row--off': row.status === 'absent' || row.status === 'leave' }"
          >
            <div class="attb-row__head">
              <span class="attb-avatar">{{ initials(row) }}</span>
              <div class="attb-row__id">
                <span class="attb-row__name">{{ row.name }}</span>
                <span class="attb-row__meta">
                  <template v-if="row.position">{{ row.position }} · </template>
                  <span v-if="row.existing" class="attb-row__flag">{{ t('attendance.bulkAlreadySaved') }}</span>
                  <span v-else>{{ t('attendance.bulkNew') }}</span>
                </span>
              </div>

              <div class="attb-row__status">
                <button
                  v-for="option in statusItems"
                  :key="option.value"
                  type="button"
                  class="attb-dot"
                  :class="[option.pill, { 'attb-dot--on': row.status === option.value }]"
                  :title="option.title"
                  :aria-label="option.title"
                  :aria-pressed="row.status === option.value"
                  :disabled="saving"
                  @click="row.status = option.value"
                />
              </div>
            </div>

            <!-- Sessions -->
            <div class="attb-row__sessions">
              <div v-for="(session, sIndex) in row.sessions" :key="sIndex" class="attb-slot">
                <input
                  v-model="session.checkInTime"
                  class="attb-time"
                  type="time"
                  dir="ltr"
                  step="300"
                  :aria-label="`${row.name} — ${t('attendance.checkIn')} ${sIndex + 1}`"
                >
                <span class="attb-slot__dash" aria-hidden="true">{{ t('attendance.to') }}</span>
                <input
                  v-model="session.checkOutTime"
                  class="attb-time"
                  type="time"
                  dir="ltr"
                  step="300"
                  :aria-label="`${row.name} — ${t('attendance.checkOut')} ${sIndex + 1}`"
                >
                <button
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :disabled="saving"
                  :title="t('attendance.removeSession')"
                  :aria-label="t('attendance.removeSession')"
                  @click="row.sessions.splice(sIndex, 1)"
                >
                  <TrashBin class="w-4! h-4! stroke-current" />
                </button>
              </div>

              <button
                class="asa-btn asa-btn--ghost asa-btn--sm"
                type="button"
                :disabled="saving"
                @click="row.sessions.push({ checkInTime: '08:00', checkOutTime: '16:00' })"
              >
                <Plus class="w-4! h-4! stroke-current" />
                <span>{{ t('attendance.addSession') }}</span>
              </button>
            </div>

            <!-- Admin note -->
            <v-text-field
              v-model="row.adminNotes"
              variant="solo"
              density="compact"
              hide-details
              :placeholder="t('attendance.bulkNotePlaceholder')"
              :aria-label="`${row.name} — ${t('attendance.adminNote')}`"
            />

            <p v-if="rowError(row)" class="attb-row__err">{{ rowError(row) }}</p>
          </li>
        </ul>
      </v-card-text>

      <v-card-actions class="asa-dialog__foot">
        <p class="attb-foot">
          <span class="pf-pulse" />
          {{ t('attendance.bulkSummary', { saved: existingCount, total: rows.length }) }}
        </p>
        <v-spacer />
        <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="saving" @click="close">
          <span>{{ t('common.cancel') }}</span>
        </button>
        <button
          class="asa-btn asa-btn--primary asa-btn--sm"
          :disabled="saving || loadingStaff || !rows.length"
          @click="submit"
        >
          <v-icon v-if="saving" size="15" class="pf-spin">mdi-loading</v-icon>
          <ClipboardCheck v-else class="w-4! h-4! stroke-current" />
          <span>{{ t('attendance.bulkSave') }}</span>
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import Plus from '~/components/icons/Plus.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import UserX from '~/components/icons/UserX.vue'
import { useApi } from '~/composables/useApi'
import {
  ATTENDANCE_STATUSES,
  type AttendanceRecord,
  type AttendanceSessionInput,
  type AttendanceStatus,
  type BulkAttendanceRow,
} from '~/types/attendance'

interface StaffOption {
  id: string
  fullName: string
  position: string | null
  isActive: boolean | null
}

interface BulkRow extends BulkAttendanceRow {
  name: string
  position: string | null
  existing: boolean
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

const STATUS_PILL: Record<AttendanceStatus, string> = {
  present: 'attb-dot--present',
  late: 'attb-dot--late',
  absent: 'attb-dot--absent',
  leave: 'attb-dot--leave',
  holiday: 'attb-dot--holiday',
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const { apiFetch } = useApi()
const { todayJalali } = useFormatting()
const { $toast } = useNuxtApp()

const today = todayJalali()
const rows = ref<BulkRow[]>([])
const loadingStaff = ref(true)
const saving = ref(false)

const form = reactive({ date: today })

const statusItems = computed(() =>
  ATTENDANCE_STATUSES.map((value) => ({
    value,
    title: t(`attendance.status.${value}`),
    pill: STATUS_PILL[value],
  })),
)

const quickStatuses = computed(() =>
  (['present', 'absent', 'leave', 'holiday'] as AttendanceStatus[]).map((value) => ({
    value,
    title: t(`attendance.status.${value}`),
  })),
)

const existingCount = computed(() => rows.value.filter((row) => row.existing).length)

function initials(row: { name: string }): string {
  const parts = (row.name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].charAt(0)
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
}

function toTimeInput(value: string | null | undefined): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

function minutesBetween(start: string, end: string): number {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0
  const to = eh * 60 + em
  return to > sh * 60 + sm ? to - (sh * 60 + sm) : 0
}

function rowError(row: BulkRow): string | null {
  const worked = row.status === 'present' || row.status === 'late'
  if (!worked) return null
  if (!row.sessions.length) return null
  const bad = row.sessions.find((s) => !s.checkInTime || minutesBetween(s.checkInTime, s.checkOutTime) === 0)
  return bad ? t('attendance.sessionRangeInvalid') : null
}

/** Seed rows from the roster, overlaying whatever is already saved for `form.date`. */
async function hydrate() {
  loadingStaff.value = true
  rows.value = []
  try {
    const [staffRes, reportRes] = await Promise.all([
      apiFetch<ApiEnvelope<StaffOption[]>>('/api/staff'),
      apiFetch<ApiEnvelope<{ records: AttendanceRecord[] }>>(
        `/api/staff/attendance/report?startDate=${form.date}&endDate=${form.date}`,
      ),
    ])

    const staff = staffRes.success && Array.isArray(staffRes.data) ? staffRes.data : []
    const saved = new Map<string, AttendanceRecord>(
      (reportRes.success && Array.isArray(reportRes.data?.records) ? reportRes.data.records : [])
        .map((record) => [record.staffId, record]),
    )

    rows.value = staff.map((member) => {
      const record = saved.get(member.id)
      const sessions: AttendanceSessionInput[] = record
        ? (record.sessions ?? [])
            .map((session) => ({
              checkInTime: toTimeInput(session.checkInTime),
              checkOutTime: toTimeInput(session.checkOutTime),
            }))
            .filter((session) => session.checkInTime)
        : []

      return {
        staffId: member.id,
        name: member.fullName,
        position: member.position,
        status: record?.status ?? 'present',
        notes: record?.notes ?? null,
        adminNotes: record?.adminNotes ?? null,
        sessions,
        existing: Boolean(record),
      }
    })
  } catch {
    rows.value = []
    $toast.error(t('attendance.bulkLoadError'))
  } finally {
    loadingStaff.value = false
  }
}

function applyToAll(status: AttendanceStatus) {
  for (const row of rows.value) row.status = status
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
            // Only send notes for rows the admin actually touched, so an
            // untouched row never blanks a note that is already stored.
            adminNotes: row.adminNotes?.trim() ? row.adminNotes : (row.existing ? row.adminNotes : null),
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

watch(() => props.modelValue, (open) => {
  if (open) hydrate()
})

// Re-seed when the admin moves the date so existing rows are never overwritten blind.
let lastSyncedDate = today
watch(() => form.date, (value) => {
  if (props.modelValue && value && value !== lastSyncedDate) {
    lastSyncedDate = value
    void hydrate()
  }
})
</script>

<style scoped>
.attb-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.attb-head__copy {
  min-width: 0;
}

.attb-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.9rem;
}

.attb-date {
  display: grid;
  gap: 0.3rem;
  inline-size: 100%;
  max-inline-size: 13rem;
}

.attb-quick {
  display: grid;
  gap: 0.3rem;
}

.attb-rows {
  display: grid;
  gap: 0.6rem;
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
  max-block-size: 46vh;
  overflow-y: auto;
  padding-inline-end: 0.25rem;
}

.attb-row {
  display: grid;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgb(226 232 240 / 0.9);
  border-radius: 1rem;
  background: rgb(248 250 252 / 0.65);
}

.attb-row--off {
  background: rgb(248 250 252 / 0.35);
}

.attb-row__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.attb-avatar {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  flex: none;
  border-radius: 999px;
  background: rgb(0 173 181 / 0.14);
  color: #00838a;
  font-size: 0.78rem;
  font-weight: 700;
}

.attb-row__id {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
}

.attb-row__name {
  font-size: 0.86rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attb-row__meta {
  font-size: 0.72rem;
  color: rgb(100 116 139);
}

.attb-row__flag {
  color: #00838a;
}

.attb-row__status {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: none;
}

.attb-dot {
  inline-size: 1.35rem;
  block-size: 1.35rem;
  border: 1.5px solid currentcolor;
  border-radius: 999px;
  opacity: 0.4;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.attb-dot:hover {
  opacity: 0.75;
}

.attb-dot--on {
  opacity: 1;
  transform: scale(1.1);
}

.attb-dot--present {
  color: #0d9488;
  background: rgb(13 148 136 / 0.18);
}

.attb-dot--late {
  color: #d97706;
  background: rgb(217 119 6 / 0.18);
}

.attb-dot--absent {
  color: #e11d48;
  background: rgb(225 29 72 / 0.18);
}

.attb-dot--leave {
  color: #4f46e5;
  background: rgb(79 70 229 / 0.18);
}

.attb-dot--holiday {
  color: #0891b2;
  background: rgb(8 145 178 / 0.18);
}

.attb-row__sessions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.attb-slot {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.attb-time {
  inline-size: 6.5rem;
  padding: 0.3rem 0.4rem;
  border: 1px solid rgb(203 213 225);
  border-radius: 0.6rem;
  background: #fff;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
}

.attb-time:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
}

.attb-slot__dash {
  font-size: 0.7rem;
  color: rgb(148 163 184);
}

.attb-row__err {
  margin: 0;
  font-size: 0.72rem;
  color: #e11d48;
}

.attb-foot {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.75rem;
  color: rgb(100 116 139);
}

.dark .attb-row {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59 / 0.45);
}

.dark .attb-time {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .attb-row__meta,
.dark .attb-slot__dash,
.dark .attb-foot {
  color: rgb(148 163 184);
}

@media (max-width: 600px) {
  .attb-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .attb-date {
    max-inline-size: none;
  }

  .attb-row__head {
    flex-wrap: wrap;
  }

  .attb-row__status {
    inline-size: 100%;
    justify-content: flex-start;
  }

  .attb-time {
    inline-size: 100%;
    min-inline-size: 5.5rem;
  }
}
</style>
