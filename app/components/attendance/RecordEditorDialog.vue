<template>
  <v-dialog
    :model-value="modelValue"
    max-width="620"
    persistent
    transition="dialog-bottom-transition"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <div class="asa-dialog__head">
        <div class="attd-head">
          <span class="asa-tint asa-tint--teal">
            <Pencil class="w-4! h-4! stroke-current" />
          </span>
          <div class="attd-head__copy">
            <h2 class="asa-dialog__title">{{ t('attendance.editRecordTitle') }}</h2>
            <span class="asa-dialog__sub">
              <template v-if="record">
                {{ record.staffName }}
                <template v-if="record.staffPosition"> · {{ record.staffPosition }}</template>
                · {{ prettyDate(record.date) }}
              </template>
            </span>
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
        <div class="attd-grid">
          <!-- Status -->
          <div class="attd-field">
            <label class="asa-field-label">{{ t('attendance.status') }} *</label>
            <v-select
              v-model="form.status"
              :items="statusItems"
              variant="solo"
              density="comfortable"
              hide-details
            />
          </div>

          <!-- Work location -->
          <div class="attd-field">
            <label class="asa-field-label">{{ t('attendance.workLocation') }}</label>
            <v-select
              v-model="form.workLocation"
              :items="locationItems"
              variant="solo"
              density="comfortable"
              clearable
              hide-details
            />
          </div>

          <!-- Sessions -->
          <div class="attd-field attd-field--full">
            <div class="attd-label-row">
              <span class="asa-field-label">{{ t('attendance.sessions') }}</span>
              <button
                class="asa-btn asa-btn--ghost asa-btn--sm"
                type="button"
                :disabled="saving"
                @click="addSession"
              >
                <Plus class="w-4! h-4! stroke-current" />
                <span>{{ t('attendance.addSession') }}</span>
              </button>
            </div>

            <p v-if="!form.sessions.length" class="attd-hint">{{ t('attendance.noSessionsYet') }}</p>

            <ul v-else class="attd-sessions">
              <li v-for="(session, index) in form.sessions" :key="index" class="attd-session">
                <span class="attd-session__idx">{{ pn(index + 1) }}</span>
                <div class="attd-session__inputs">
                  <label class="attd-time">
                    <span class="attd-time__cap">{{ t('attendance.checkIn') }}</span>
                    <input
                      v-model="session.checkInTime"
                      class="attd-time__input"
                      type="time"
                      dir="ltr"
                      step="300"
                      :aria-label="`${t('attendance.sessions')} ${index + 1} — ${t('attendance.checkIn')}`"
                    >
                  </label>
                  <span class="attd-session__dash" aria-hidden="true">{{ t('attendance.to') }}</span>
                  <label class="attd-time">
                    <span class="attd-time__cap">{{ t('attendance.checkOut') }}</span>
                    <input
                      v-model="session.checkOutTime"
                      class="attd-time__input"
                      type="time"
                      dir="ltr"
                      step="300"
                      :aria-label="`${t('attendance.sessions')} ${index + 1} — ${t('attendance.checkOut')}`"
                    >
                  </label>
                </div>
                <button
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :disabled="saving"
                  :title="t('attendance.removeSession')"
                  :aria-label="t('attendance.removeSession')"
                  @click="removeSession(index)"
                >
                  <TrashBin class="w-4! h-4! stroke-current" />
                </button>
                <p v-if="sessionError(session)" class="attd-session__err">
                  {{ sessionError(session) }}
                </p>
              </li>
            </ul>
          </div>

          <!-- Staff note -->
          <div class="attd-field">
            <label class="asa-field-label" for="att-staffNote">{{ t('attendance.staffNote') }}</label>
            <v-textarea
              id="att-staffNote"
              v-model="form.notes"
              variant="solo"
              density="comfortable"
              rows="2"
              auto-grow
              hide-details
              append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting('notes')"
            />
          </div>

          <!-- Admin note -->
          <div class="attd-field">
            <label class="asa-field-label" for="att-adminNote">{{ t('attendance.adminNote') }}</label>
            <v-textarea
              id="att-adminNote"
              v-model="form.adminNotes"
              variant="solo"
              density="comfortable"
              rows="2"
              auto-grow
              hide-details
              append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting('adminNotes')"
            />
          </div>
        </div>

        <div v-if="record" class="attd-total">
          <span class="attd-total__label">{{ t('attendance.workDuration') }}</span>
          <span class="attd-total__value">{{ formatMinutes(form.totalMinutes) }}</span>
        </div>
      </v-card-text>

      <v-card-actions class="asa-dialog__foot">
        <v-spacer />
        <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="saving" @click="close">
          <span>{{ t('common.cancel') }}</span>
        </button>
        <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving" @click="submit">
          <v-icon v-if="saving" size="15" class="pf-spin">mdi-loading</v-icon>
          <Pencil v-else />
          <span>{{ t('common.save') }}</span>
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <HandwritingDialog
    v-model="handwritingOpen"
    :label="handwritingLabel"
    :numeric="handwritingNumeric"
    @insert="applyHandwriting"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Pencil from '~/components/icons/Pencil.vue'
import Plus from '~/components/icons/Plus.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
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

const { t, locale } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { formatMinutes } = useFormatting()
const { $toast } = useNuxtApp()

const saving = ref(false)

const form = reactive({
  status: 'present' as AttendanceStatus,
  workLocation: 'clinic' as WorkLocation | null,
  notes: '',
  adminNotes: '',
  sessions: [] as AttendanceSessionInput[],
  totalMinutes: 0,
})

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      notes: t('attendance.staffNote'),
      adminNotes: t('attendance.adminNote'),
    },
    target: form,
  })

const statusItems = computed(() =>
  ATTENDANCE_STATUSES.map((value) => ({ title: t(`attendance.status.${value}`), value })),
)

const locationItems = computed(() =>
  WORK_LOCATIONS.map((value) => ({ title: t(`attendance.location.${value}`), value })),
)

function prettyDate(value: string): string {
  if (!value) return '---'
  return locale.value === 'fa' ? pn(value) : value
}

/** `HH:mm` from an ISO timestamp; empty string when absent. */
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
  const from = sh * 60 + sm
  const to = eh * 60 + em
  // A session that crosses midnight is a data-entry mistake, not an all-nighter.
  return to > from ? to - from : 0
}

function recomputeTotal() {
  form.totalMinutes = form.sessions.reduce((sum, s) => sum + minutesBetween(s.checkInTime, s.checkOutTime), 0)
}

function sessionError(session: AttendanceSession): string | null {
  if (!session.checkInTime) return t('attendance.sessionInRequired')
  if (session.checkOutTime && minutesBetween(session.checkInTime, session.checkOutTime) === 0) {
    return t('attendance.sessionRangeInvalid')
  }
  return null
}

function addSession() {
  const last = form.sessions[form.sessions.length - 1]
  const start = last?.checkOutTime || '08:00'
  const [h, m] = start.split(':').map(Number)
  const end = Number.isNaN(h) ? '16:00' : `${String(Math.min(23, h + 4)).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
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

watch(() => props.modelValue, (open) => {
  if (open) hydrate()
})

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
        // Send an empty array to clear sessions instead of leaving them untouched.
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
.attd-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.attd-head__copy {
  min-width: 0;
}

.attd-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.attd-field--full {
  grid-column: 1 / -1;
}

.attd-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-block-end: 0.45rem;
}

.attd-hint {
  margin: 0;
  font-size: 0.78rem;
  color: rgb(148 163 184);
}

.attd-sessions {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.attd-session {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid rgb(226 232 240 / 0.9);
  border-radius: 0.85rem;
  background: rgb(248 250 252 / 0.7);
}

.attd-session__idx {
  display: grid;
  place-items: center;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  flex: none;
  border-radius: 999px;
  background: rgb(0 173 181 / 0.12);
  color: #00838a;
  font-size: 0.72rem;
  font-weight: 700;
}

.attd-session__inputs {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
  flex: 1 1 12rem;
  min-width: 0;
}

.attd-session__dash {
  padding-block-end: 0.55rem;
  font-size: 0.72rem;
  color: rgb(148 163 184);
}

.attd-session__err {
  flex: 1 0 100%;
  margin: 0;
  font-size: 0.72rem;
  color: #e11d48;
}

.attd-time {
  display: grid;
  gap: 0.15rem;
  flex: 1 1 0;
  min-width: 0;
}

.attd-time__cap {
  font-size: 0.68rem;
  color: rgb(100 116 139);
}

.attd-time__input {
  inline-size: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid rgb(203 213 225);
  border-radius: 0.6rem;
  background: #fff;
  color: inherit;
  font: inherit;
  font-size: 0.85rem;
}

.attd-time__input:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: 1px;
}

.attd-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-block-start: 1rem;
  padding: 0.65rem 0.85rem;
  border-radius: 0.9rem;
  background: rgb(0 173 181 / 0.08);
}

.attd-total__label {
  font-size: 0.8rem;
  color: rgb(100 116 139);
}

.attd-total__value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #00838a;
}

.dark .attd-session {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59 / 0.5);
}

.dark .attd-time__input {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .attd-hint,
.dark .attd-time__cap,
.dark .attd-session__dash,
.dark .attd-total__label {
  color: rgb(148 163 184);
}

.dark .attd-total {
  background: rgb(0 173 181 / 0.14);
}

@media (max-width: 600px) {
  .attd-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .attd-session__inputs {
    flex: 1 1 100%;
  }

  .attd-session__idx {
    order: -1;
  }
}
</style>
