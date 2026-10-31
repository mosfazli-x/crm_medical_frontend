<template>
  <div class="patient-followups">
    <p class="patient-followups__hint" role="note">{{ t('patientForm.followups.independentSave') }}</p>

    <div>
      <button type="button" class="asa-btn asa-btn--primary" :disabled="blocked" :aria-expanded="showCreate" aria-controls="patient-followup-create" @click="toggleCreate">
        <v-icon size="18" aria-hidden="true">mdi-plus</v-icon>
        {{ t('patientForm.followups.add') }}
      </button>
    </div>

    <section v-if="showCreate" id="patient-followup-create" class="patient-followups__row" :aria-busy="creating" aria-labelledby="patient-followup-create-title">
      <h3 id="patient-followup-create-title" class="patient-followups__title">{{ t('patientForm.followups.newVisit') }}</h3>
      <fieldset class="patient-followups__fields" :disabled="blocked" :aria-label="t('patientForm.followups.newVisit')">
        <div class="pf-field">
          <label for="followup-create-visit-date" class="asa-field-label">{{ t('patientForm.followups.visitDate') }}</label>
          <PersianDatetimePicker
            v-model="newVisitDate"
            :input-attrs="{ id: 'followup-create-visit-date', 'aria-label': t('patientForm.followups.visitDate'), 'aria-required': 'true' }"
            type="datetime" display-format="jYYYY/jMM/jDD - HH:mm" format="YYYY-MM-DD HH:mm:ss"
            color="#5f8feb" auto-submit custom-input :disabled="blocked" @update:model-value="createError = ''"
          />
        </div>
        <div class="pf-field">
          <label for="followup-create-date" class="asa-field-label">{{ t('followups.nextVisitDate') }}</label>
          <PersianDatetimePicker
            v-model="newFollowUpDate"
            :input-attrs="{ id: 'followup-create-date', 'aria-label': t('followups.nextVisitDate'), 'aria-required': 'true' }"
            type="date" display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
            color="#5f8feb" auto-submit custom-input clearable :disabled="blocked" @update:model-value="createError = ''"
          />
        </div>
        <div class="pf-field">
          <label for="followup-create-reminder" class="asa-field-label">{{ t('followups.remindDaysBefore') }}</label>
          <v-text-field
            id="followup-create-reminder" v-model="newReminder" type="number" min="0" max="90" step="1"
            variant="solo" density="comfortable" hide-details="auto" :suffix="t('followups.daysUnit')"
            :placeholder="t('followups.clinicDefault')" :disabled="blocked" clearable @update:model-value="createError = ''"
          />
          <p class="patient-followups__meta">{{ t('patientForm.followups.newReminderHint') }}</p>
        </div>
      </fieldset>
      <div class="patient-followups__actions">
        <p v-if="createError" class="patient-followups__error" role="alert">{{ createError }}</p>
        <span v-else />
        <div class="patient-followups__actions">
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="blocked" @click="showCreate = false">{{ t('patientForm.cancel') }}</button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="blocked" @click="createFollowUp">
            <v-progress-circular v-if="creating" indeterminate size="16" width="2" />
            {{ creating ? t('patientForm.saving') : t('patientForm.followups.create') }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="!rows.length && !showCreate" class="patient-followups__empty" role="status">
      <v-icon size="28" aria-hidden="true">mdi-calendar-blank-outline</v-icon>
      <p>{{ t('patientForm.followups.empty') }}</p>
    </div>

    <article v-for="(row, index) in rows" :key="row.visit.id" class="patient-followups__row" :aria-busy="row.saving">
      <h3 class="patient-followups__title">
        {{ t('patientForm.followups.visit', { number: toPersianNum(index + 1) }) }}
        · {{ formatJalaliDateShort(row.visit.visitDate) }}
      </h3>
      <p v-if="row.visit.visitType || row.visit.visitReason" class="patient-followups__meta">
        {{ [row.visit.visitType, row.visit.visitReason].filter(Boolean).join(' · ') }}
      </p>

      <fieldset class="patient-followups__fields" :disabled="blocked" :aria-label="t('followups.returnVisit')">
        <div class="pf-field">
          <label :for="`followup-date-${row.visit.id}`" class="asa-field-label">{{ t('followups.nextVisitDate') }}</label>
          <PersianDatetimePicker
            v-model="row.date"
            :input-attrs="{ id: `followup-date-${row.visit.id}`, 'aria-label': t('followups.nextVisitDate') }"
            type="date"
            display-format="jYYYY/jMM/jDD"
            format="YYYY-MM-DD"
            color="#5f8feb"
            auto-submit
            custom-input
            clearable
            :disabled="blocked"
            @update:model-value="clearFeedback(row)"
          />
          <button v-if="row.date" type="button" class="asa-btn asa-btn--ghost patient-followups__clear" :disabled="blocked" @click="clearDate(row)">
            {{ t('common.clear') }}
          </button>
        </div>
        <div class="pf-field">
          <label :for="`followup-reminder-${row.visit.id}`" class="asa-field-label">{{ t('followups.remindDaysBefore') }}</label>
          <v-text-field
            :id="`followup-reminder-${row.visit.id}`"
            v-model="row.reminder"
            type="number"
            min="0"
            max="90"
            step="1"
            variant="solo"
            density="comfortable"
            hide-details="auto"
            :suffix="t('followups.daysUnit')"
            :placeholder="t('followups.clinicDefault')"
            :disabled="blocked"
            clearable
            @update:model-value="clearFeedback(row)"
          />
          <p class="patient-followups__meta">{{ t('patientForm.followups.reminderHint') }}</p>
        </div>
      </fieldset>

      <div class="patient-followups__actions">
        <p v-if="row.error" class="patient-followups__error" role="alert">{{ row.error }}</p>
        <p v-else-if="row.success" class="patient-followups__success" role="status">{{ t('patientForm.followups.saved') }}</p>
        <span v-else />
        <button type="button" class="asa-btn asa-btn--primary" :disabled="blocked || !isChanged(row)" @click="save(row)">
          <v-progress-circular v-if="row.saving" indeterminate size="16" width="2" />
          {{ row.saving ? t('patientForm.saving') : t('patientForm.followups.save') }}
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import type { ProfileVisit } from '~/types/patient'

const props = defineProps<{ patientId: string; visits: ProfileVisit[]; disabled?: boolean }>()
const emit = defineEmits<{
  saving: [active: boolean]
  saved: [visit: ProfileVisit, patientId: string]
}>()
const { t } = useI18n()
const { toPersianNum } = useLang()
const { formatJalaliDateShort } = useFormatting()
const { apiFetch } = useApi()

interface VisitRow {
  visit: ProfileVisit
  date: string | null
  reminder: string | number | null
  saving: boolean
  error: string
  success: boolean
}

// Timestamps are displayed as local calendar dates, never UTC ISO slices.
function localDate(value?: string | null): string {
  if (!value) return ''
  const date = moment(value)
  return date.isValid() ? date.format('YYYY-MM-DD') : ''
}

function makeRow(visit: ProfileVisit): VisitRow {
  return {
    visit: { ...visit },
    date: localDate(visit.nextVisitDate),
    reminder: visit.reminderDaysBefore ?? null,
    saving: false,
    error: '',
    success: false,
  }
}

// The parent remounts this tab for each dialog/profile session, not for row saves.
const rows = ref<VisitRow[]>(props.visits.map(makeRow))
const showCreate = ref(false)
const creating = ref(false)
const newVisitDate = ref<string | null>(null)
const newFollowUpDate = ref<string | null>(null)
const newReminder = ref<string | number | null>(null)
const createError = ref('')
const saving = computed(() => creating.value || rows.value.some((row) => row.saving))
const blocked = computed(() => Boolean(props.disabled) || saving.value)
let disposed = false
onBeforeUnmount(() => { disposed = true })

function reminderValue(row: VisitRow): number | null {
  return row.reminder == null || String(row.reminder).trim() === '' ? null : Number(row.reminder)
}

function isChanged(row: VisitRow): boolean {
  return (row.date || '') !== localDate(row.visit.nextVisitDate)
    || reminderValue(row) !== (row.visit.reminderDaysBefore ?? null)
}

function clearFeedback(row: VisitRow) {
  row.error = ''
  row.success = false
}

function clearDate(row: VisitRow) {
  row.date = null
  clearFeedback(row)
}

function toggleCreate() {
  if (blocked.value) return
  if (!newVisitDate.value) newVisitDate.value = moment().format('YYYY-MM-DD HH:mm:ss')
  createError.value = ''
  showCreate.value = !showCreate.value
}

async function createFollowUp() {
  if (blocked.value) return
  createError.value = ''
  const visitDate = moment(newVisitDate.value || '', 'YYYY-MM-DD HH:mm:ss', true)
  if (!visitDate.isValid()) {
    createError.value = t('patientForm.followups.invalidVisitDate')
    return
  }
  if (!newFollowUpDate.value || !moment(newFollowUpDate.value, 'YYYY-MM-DD', true).isValid()) {
    createError.value = t('patientForm.followups.invalidDate')
    return
  }
  const reminder = newReminder.value == null || String(newReminder.value).trim() === '' ? null : Number(newReminder.value)
  if (reminder !== null && (!Number.isInteger(reminder) || reminder < 0 || reminder > 90)) {
    createError.value = t('patientForm.followups.invalidReminder')
    return
  }

  const patientId = props.patientId
  creating.value = true
  emit('saving', true)
  try {
    const response = await apiFetch<{ success: boolean; visit: ProfileVisit }>('/api/visits', {
      method: 'POST',
      body: {
        patientId,
        visitDate: visitDate.toISOString(),
        nextVisitDate: newFollowUpDate.value,
        reminderDaysBefore: reminder,
        durationMinutes: 30,
      },
    })
    if (!response.success || !response.visit?.id) throw new Error(t('patientForm.followups.createError'))
    if (disposed) return
    rows.value.unshift({ ...makeRow(response.visit), success: true })
    emit('saved', response.visit, patientId)
    showCreate.value = false
    newVisitDate.value = null
    newFollowUpDate.value = null
    newReminder.value = null
  } catch {
    if (!disposed) createError.value = t('patientForm.followups.createError')
  } finally {
    creating.value = false
    if (!disposed) emit('saving', false)
  }
}

async function save(row: VisitRow) {
  if (blocked.value || !isChanged(row)) return
  clearFeedback(row)
  const reminder = reminderValue(row)
  if (reminder !== null && (!Number.isInteger(reminder) || reminder < 0 || reminder > 90)) {
    row.error = t('patientForm.followups.invalidReminder')
    return
  }
  if (row.date && !moment(row.date, 'YYYY-MM-DD', true).isValid()) {
    row.error = t('patientForm.followups.invalidDate')
    return
  }

  const body: { nextVisitDate?: string | null; reminderDaysBefore?: number | null } = {}
  if ((row.date || '') !== localDate(row.visit.nextVisitDate)) body.nextVisitDate = row.date || null
  if (reminder !== (row.visit.reminderDaysBefore ?? null)) body.reminderDaysBefore = reminder

  const patientId = props.patientId
  row.saving = true
  emit('saving', true)
  try {
    const response = await apiFetch<{ success: boolean; visit: ProfileVisit }>(`/api/visits/${row.visit.id}`, {
      method: 'PUT',
      body,
    })
    if (!response.success || !response.visit || response.visit.id !== row.visit.id) throw new Error(t('patientForm.followups.saveError'))
    if (disposed) return
    // The returned visit is authoritative, including server-reset reminder metadata.
    const visit = { ...row.visit, ...response.visit }
    Object.assign(row, makeRow(visit), { saving: true, success: true })
    emit('saved', visit, patientId)
  } catch {
    if (!disposed) row.error = t('patientForm.followups.saveError')
  } finally {
    row.saving = false
    if (!disposed) emit('saving', false)
  }
}
</script>

<style scoped>
.patient-followups { display: grid; gap: 1rem; }
.patient-followups__hint, .patient-followups__meta { color: var(--asa-label-2); font-size: 0.8125rem; line-height: 1.7; }
.patient-followups__hint { padding: 0.875rem 1rem; border-radius: 0.875rem; background: var(--asa-bg); }
.patient-followups__row { padding: 1rem; border: 1px solid var(--asa-sep); border-radius: 0.875rem; min-width: 0; }
.patient-followups__title { color: var(--asa-label); font-size: 0.9375rem; font-weight: 700; line-height: 1.7; }
.patient-followups__fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; border: 0; padding: 0; margin: 1rem 0; min-width: 0; }
.patient-followups__fields:disabled { opacity: 0.65; }
.patient-followups__clear { margin-top: 0.5rem; }
.patient-followups__actions { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.patient-followups__actions p { font-size: 0.8125rem; line-height: 1.7; }
.patient-followups__error { color: var(--asa-red, #b42318); }
.patient-followups__success { color: var(--asa-green, #18794e); }
.patient-followups__empty { display: grid; justify-items: center; gap: 0.75rem; padding: 2rem 1rem; color: var(--asa-label-2); text-align: center; }
@media (max-width: 600px) {
  .patient-followups__fields { grid-template-columns: minmax(0, 1fr); }
  .patient-followups__actions { flex-wrap: wrap; }
}
</style>
