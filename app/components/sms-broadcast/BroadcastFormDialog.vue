<template>
  <v-dialog :model-value="modelValue" max-width="640" persistent transition="dialog-bottom-transition" @update:model-value="onClose">
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <!-- Header -->
      <div class="asa-dialog__head">
        <div>
          <h2 class="asa-dialog__title">{{ isEdit ? t('smsBroadcast.editTitle') : t('smsBroadcast.createTitle') }}</h2>
          <span class="asa-dialog__sub">{{ isEdit ? t('smsBroadcast.editSubtitle') : t('smsBroadcast.createSubtitle') }}</span>
        </div>
        <button type="button" class="sb-x" :aria-label="t('common.close')" :disabled="saving" @click="onClose(false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <!-- Body -->
      <v-card-text class="asa-dialog__body sb-body">
        <!-- Name -->
        <div class="sb-field">
          <label class="asa-field-label" for="sb-name">{{ t('smsBroadcast.fieldName') }}</label>
          <input
            id="sb-name"
            v-model="form.name"
            class="asa-input"
            type="text"
            maxlength="150"
            :placeholder="t('smsBroadcast.namePlaceholder')"
            :disabled="saving">
          <p v-if="errors.name" class="sb-error">{{ errors.name }}</p>
        </div>

        <!-- Message -->
        <div class="sb-field">
          <label class="asa-field-label" for="sb-message">{{ t('smsBroadcast.fieldMessage') }}</label>
          <textarea
            id="sb-message"
            v-model="form.message"
            class="asa-input sb-textarea"
            rows="4"
            maxlength="2000"
            :placeholder="t('smsBroadcast.messagePlaceholder')"
            :disabled="saving" />
          <div class="sb-message-foot">
            <span class="sb-hint">{{ t('smsBroadcast.messageHint') }}</span>
            <span class="sb-counter" :class="{ 'sb-counter--warn': form.message.length > 1800 }">
              {{ pn(form.message.length) }} / {{ pn(2000) }}
            </span>
          </div>
          <p v-if="errors.message" class="sb-error">{{ errors.message }}</p>
        </div>

        <!-- Recipients -->
        <div class="sb-field">
          <span class="asa-field-label">{{ t('smsBroadcast.fieldRecipients') }}</span>
          <div class="sb-seg">
            <button
              type="button"
              class="sb-seg__btn"
              :class="{ 'sb-seg__btn--on': form.targetType === 'all' }"
              @click="form.targetType = 'all'">
              <v-icon size="17">mdi-account-group-outline</v-icon>
              <span>{{ t('smsBroadcast.recipientAll') }}</span>
            </button>
            <button
              type="button"
              class="sb-seg__btn"
              :class="{ 'sb-seg__btn--on': form.targetType === 'specific' }"
              @click="form.targetType = 'specific'">
              <v-icon size="17">mdi-account-multiple-outline</v-icon>
              <span>{{ t('smsBroadcast.recipientSpecific') }}</span>
            </button>
          </div>
        </div>

        <!-- Specific patient picker -->
        <div v-if="form.targetType === 'specific'" class="sb-field">
          <label class="asa-field-label" for="sb-patient-search">{{ t('smsBroadcast.fieldPatients') }}</label>
          <div v-if="form.targetPatientIds.length" class="sb-chips">
            <span v-for="id in form.targetPatientIds" :key="id" class="sb-chip">
              <span class="sb-chip__txt">{{ patientLabel(id) }}</span>
              <button type="button" class="sb-chip__x" :aria-label="t('common.delete')" @click="removePatient(id)">
                <v-icon size="14">mdi-close</v-icon>
              </button>
            </span>
          </div>
          <v-autocomplete
            id="sb-patient-search"
            v-model="form.targetPatientIds"
            :items="patientOptions"
            item-title="label"
            item-value="id"
            :loading="patientsLoading"
            :placeholder="t('smsBroadcast.patientSearchPlaceholder')"
            variant="solo"
            density="comfortable"
            hide-details
            multiple
            chips
            closable-chips
            clearable
            class="sb-autocomplete"
            :no-data-text="t('smsBroadcast.patientNoResults')">
            <template #prepend-item>
              <div class="sb-ac-hint">{{ t('smsBroadcast.patientsHint') }}</div>
            </template>
            <template #selection="{ item }">
              <span class="d-none">{{ item.raw.label }}</span>
            </template>
          </v-autocomplete>
          <p v-if="form.targetPatientIds.length" class="sb-selected-count">
            {{ t('smsBroadcast.selectedCount', { count: pn(form.targetPatientIds.length) }) }}
          </p>
          <p v-if="selectedUndeliverableCount > 0 && !patientsLoading" class="sb-error">
            {{ t('smsBroadcast.selectedNoPhone', { count: pn(selectedUndeliverableCount) }) }}
          </p>
          <p v-if="errors.targetPatientIds" class="sb-error">{{ errors.targetPatientIds }}</p>
        </div>

        <!-- Active status (edit only) -->
        <div v-if="isEdit" class="sb-field">
          <span class="asa-field-label">{{ t('smsBroadcast.formStatus') }}</span>
          <label class="sb-toggle">
            <input v-model="form.isActive" type="checkbox" :disabled="saving">
            <span class="sb-toggle__track" aria-hidden="true"><span class="sb-toggle__knob" /></span>
            <span>{{ form.isActive ? t('smsBroadcast.active') : t('smsBroadcast.inactive') }}</span>
          </label>
          <p class="sb-hint">{{ t('smsBroadcast.formStatusHint') }}</p>
        </div>

        <!-- Schedule: weekdays -->
        <div class="sb-row">
          <div class="sb-field sb-field--grow">
            <span class="asa-field-label">{{ t('smsBroadcast.fieldDays') }}</span>
            <div class="sb-days">
              <button
                v-for="day in WEEKDAYS"
                :key="day.value"
                type="button"
                class="sb-day"
                :class="{ 'sb-day--on': form.daysOfWeek.includes(day.value) }"
                :aria-pressed="form.daysOfWeek.includes(day.value)"
                :title="day.label"
                @click="toggleDay(day.value)">
                {{ day.short }}
              </button>
            </div>
            <p class="sb-hint">{{ t('smsBroadcast.daysOfWeekHint') }}</p>
            <p v-if="errors.daysOfWeek" class="sb-error">{{ errors.daysOfWeek }}</p>
          </div>

          <div class="sb-field sb-field--time">
            <label class="asa-field-label" for="sb-hour">{{ t('smsBroadcast.fieldTime') }}</label>
            <div class="sb-time">
              <input
                id="sb-hour"
                v-model.number="form.hour"
                class="asa-input sb-time__in"
                type="number"
                min="0"
                max="23"
                :disabled="saving"
                @blur="clampTime">
              <span class="sb-time__sep">:</span>
              <input
                v-model.number="form.minute"
                class="asa-input sb-time__in"
                type="number"
                min="0"
                max="59"
                :disabled="saving"
                @blur="clampTime">
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="asa-dialog__foot">
        <button class="asa-btn asa-btn--ghost" :disabled="saving" @click="onClose(false)">
          {{ t('common.cancel') }}
        </button>
        <v-spacer />
        <button class="asa-btn asa-btn--primary" :disabled="saving || detailLoading || !isValid" @click="onSubmit">
          <v-icon v-if="saving || detailLoading" size="16" class="sb-spin">mdi-loading</v-icon>
          <span>{{ isEdit ? t('common.save') : t('smsBroadcast.createBroadcast') }}</span>
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useSmsBroadcasts } from '~/composables/useSmsBroadcasts'
import { useDailyReports } from '~/composables/useDailyReports'
import { useLang } from '~/composables/useLang'
import {
  WEEKDAYS,
  sortWeekdays,
  isDeliverablePhone,
  type SmsBroadcast,
  type BroadcastFormInput,
} from '~/types/sms-broadcast'
import type { PatientOption } from '~/types/report'

const props = defineProps<{
  modelValue: boolean
  edit: SmsBroadcast | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

type BroadcastFormState = BroadcastFormInput & { isActive: boolean }

const { t } = useI18n()
const { pn } = useLang()
const { $toast } = useNuxtApp()
const { createBroadcast, updateBroadcast, getBroadcast } = useSmsBroadcasts()
const { listPatients } = useDailyReports()

const isEdit = computed(() => !!props.edit?.id)

const saving = ref(false)
const detailLoading = ref(false)
const patientsLoading = ref(false)
const patientList = ref<PatientOption[]>([])

const form = reactive<BroadcastFormState>(blankForm())
const errors = reactive<Record<string, string>>({})

function blankForm(): BroadcastFormState {
  return {
    name: '',
    message: '',
    targetType: 'all',
    targetPatientIds: [],
    daysOfWeek: [0, 2],
    hour: 9,
    minute: 0,
    isActive: true,
  }
}

const patientOptions = computed(() =>
  patientList.value.map((p) => {
    const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.phone || p.id
    const deliverable = isDeliverablePhone(p.phone)
    return {
      id: p.id,
      label: deliverable ? name : `${name} ${t('smsBroadcast.patientNoPhone')}`,
      deliverable,
    }
  })
)

const patientLabel = (id: string) =>
  patientOptions.value.find((p) => p.id === id)?.label ?? id

/** Selected patients that actually have a deliverable phone number. */
const selectedDeliverableCount = computed(() =>
  form.targetPatientIds.filter(
    (id) => patientOptions.value.find((option) => option.id === id)?.deliverable !== false
  ).length
)

const selectedUndeliverableCount = computed(() =>
  form.targetPatientIds.length - selectedDeliverableCount.value
)

/**
 * While the patient list is loading we cannot classify numbers yet, so fall
 * back to the raw selection to avoid blocking edits unnecessarily.
 */
const hasDeliverableSelection = computed(() => {
  if (!form.targetPatientIds.length) return false
  if (!patientList.value.length) return true
  return selectedDeliverableCount.value > 0
})

const isValid = computed(() => {
  if (!form.name.trim() || form.name.trim().length < 2) return false
  if (!form.message.trim()) return false
  if (!form.daysOfWeek.length) return false
  if (form.targetType === 'specific' && !hasDeliverableSelection.value) return false
  return true
})

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    reset()
    if (props.edit) {
      applyEdit(props.edit)
      if (props.edit.id) loadDetail(props.edit.id)
    }
    if (!patientList.value.length) await loadPatients()
  }
)

function reset() {
  Object.assign(form, blankForm())
  Object.keys(errors).forEach((k) => delete errors[k])
}

function applyEdit(b: Partial<SmsBroadcast>) {
  form.name = b.name ?? ''
  form.message = b.message ?? ''
  form.targetType = b.targetType === 'specific' ? 'specific' : 'all'
  form.targetPatientIds = Array.isArray(b.targetPatientIds) ? [...b.targetPatientIds] : []
  form.daysOfWeek = sortWeekdays(Array.isArray(b.daysOfWeek) ? b.daysOfWeek : [])
  form.hour = Number.isFinite(b.hour) ? Number(b.hour) : 9
  form.minute = Number.isFinite(b.minute) ? Number(b.minute) : 0
  form.isActive = b.isActive !== false
}

/**
 * The list endpoint is a summary. Fetch the full record so the form is always
 * complete even if an older API deployment omits fields from the list.
 */
async function loadDetail(id: string) {
  detailLoading.value = true
  try {
    const res = await getBroadcast(id)
    if (res?.success && res.data?.broadcast) applyEdit(res.data.broadcast)
  } catch {
    // Fall back to the summary already applied above.
  } finally {
    detailLoading.value = false
  }
}

async function loadPatients() {
  patientsLoading.value = true
  try {
    const res = await listPatients()
    if (res?.success && Array.isArray(res.data)) patientList.value = res.data
  } catch {
    /* picker is best-effort; manual entry still works via the all-patients scope */
  } finally {
    patientsLoading.value = false
  }
}

function toggleDay(value: number) {
  const set = new Set(form.daysOfWeek)
  if (set.has(value)) set.delete(value)
  else set.add(value)
  form.daysOfWeek = sortWeekdays([...set])
}

function removePatient(id: string) {
  form.targetPatientIds = form.targetPatientIds.filter((x) => x !== id)
}

function clampTime() {
  form.hour = Math.min(23, Math.max(0, Number(form.hour) || 0))
  form.minute = Math.min(59, Math.max(0, Number(form.minute) || 0))
}

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = t('smsBroadcast.errorNameRequired')
  else if (form.name.trim().length < 2) errors.name = t('smsBroadcast.errorNameMin')
  if (!form.message.trim()) errors.message = t('smsBroadcast.errorMessageRequired')
  if (!form.daysOfWeek.length) errors.daysOfWeek = t('smsBroadcast.errorDaysRequired')
  if (form.targetType === 'specific' && !form.targetPatientIds.length) {
    errors.targetPatientIds = t('smsBroadcast.errorPatientsRequired')
  } else if (form.targetType === 'specific' && !hasDeliverableSelection.value) {
    errors.targetPatientIds = t('smsBroadcast.selectedNoPhone', {
      count: pn(selectedUndeliverableCount.value),
    })
  }
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (saving.value || detailLoading.value || !validate()) return
  saving.value = true
  const selectedIds = patientList.value.length
    ? form.targetPatientIds.filter(
        (id) => patientOptions.value.find((option) => option.id === id)?.deliverable !== false
      )
    : [...form.targetPatientIds]
  const payload: BroadcastFormInput = {
    name: form.name.trim(),
    message: form.message.trim(),
    targetType: form.targetType,
    targetPatientIds: form.targetType === 'specific' ? selectedIds : [],
    daysOfWeek: form.daysOfWeek,
    hour: Number(form.hour) || 0,
    minute: Number(form.minute) || 0,
  }
  try {
    if (props.edit?.id) {
      await updateBroadcast(props.edit.id, { ...payload, isActive: form.isActive })
      $toast.success(t('smsBroadcast.savedUpdate'))
    } else {
      await createBroadcast(payload)
      $toast.success(t('smsBroadcast.savedCreate'))
    }
    emit('saved')
    onClose(false)
  } catch (err: any) {
    const msg = err?.data?.error || err?.data?.message || t('smsBroadcast.saveError')
    $toast.error(msg)
  } finally {
    saving.value = false
  }
}

function onClose(value: boolean) {
  if (saving.value) return
  emit('update:modelValue', value)
}
</script>

<style scoped>
.sb-body {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  max-height: min(70vh, 640px);
  overflow-y: auto;
}

.sb-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.sb-x:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.sb-field {
  display: flex;
  flex-direction: column;
}

.sb-field--grow {
  flex: 1 1 auto;
  min-width: 0;
}

.sb-field--time {
  flex: 0 0 auto;
}

.sb-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.sb-textarea {
  height: auto !important;
  padding: 0.75rem 0.875rem !important;
  line-height: 1.7;
  resize: vertical;
}

.sb-message-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.sb-hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--asa-label-3);
}

.sb-counter {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--asa-label-3);
  flex-shrink: 0;
}

.sb-counter--warn {
  color: var(--asa-amber);
}

.sb-error {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-rose);
}

.sb-selected-count {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-accent-deep);
}

/* Active status toggle */
.sb-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  cursor: pointer;
  align-self: flex-start;
}

.sb-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.sb-toggle__track {
  position: relative;
  display: inline-block;
  width: 2.375rem;
  height: 1.375rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--asa-label) 18%, transparent);
  transition: background-color 150ms var(--ease-default);
  flex-shrink: 0;
}

.sb-toggle__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.28);
  transition: transform 150ms var(--ease-default);
}

.sb-toggle input:checked + .sb-toggle__track {
  background: var(--asa-accent);
}

.sb-toggle input:checked + .sb-toggle__track .sb-toggle__knob {
  transform: translateX(1rem);
}

.sb-toggle input:focus-visible + .sb-toggle__track {
  outline: 2px solid var(--asa-accent-soft);
  outline-offset: 2px;
}

.sb-toggle input:disabled + .sb-toggle__track {
  opacity: 0.5;
}

/* Segmented control */
.sb-seg {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.sb-seg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
  height: 2.375rem;
  border: none;
  border-radius: 0.6875rem;
  background: transparent;
  color: var(--asa-label-2);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
}

.sb-seg__btn--on {
  background: var(--asa-bg-card);
  color: var(--asa-accent-deep);
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.12);
}

/* Chips (already-selected patients shown above the autocomplete) */
.sb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sb-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  max-width: 100%;
  padding: 0.25rem 0.375rem 0.25rem 0.625rem;
  border-radius: 0.625rem;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
  font-size: 0.75rem;
  font-weight: 600;
}

.sb-chip__txt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 12rem;
}

.sb-chip__x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  flex-shrink: 0;
}

.sb-chip__x:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.sb-autocomplete :deep(.v-field) {
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  box-shadow: none;
  color: var(--asa-label);
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.sb-autocomplete :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.sb-ac-hint {
  padding: 0.5rem 0.75rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  border-bottom: 1px solid var(--asa-sep);
}

/* Weekday selector */
.sb-days {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.sb-day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label-2);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms var(--ease-default);
}

.sb-day:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
}

.sb-day--on {
  background: var(--asa-accent);
  border-color: var(--asa-accent);
  color: #ffffff;
  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--asa-accent) 60%, transparent);
}

/* Time */
.sb-time {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.sb-time__in {
  width: 3.75rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.sb-time__sep {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--asa-label-2);
}

.sb-spin {
  animation: sb-spin 0.8s linear infinite;
}

@keyframes sb-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .sb-day {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>
