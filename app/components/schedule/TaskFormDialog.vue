<template>
  <v-dialog v-model="dialogVisible" max-width="680" persistent transition="dialog-bottom-transition">
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <div class="asa-dialog__head">
        <div class="min-w-0!">
          <h2 class="asa-dialog__title">{{ dialogTitle }}</h2>
          <span v-if="metaLine" class="asa-dialog__sub">{{ metaLine }}</span>
        </div>
        <button class="pf-x" type="button" :aria-label="t('schedule.close')" @click="close">
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <v-card-text class="asa-dialog__body">
        <form class="sch-form" @submit.prevent="save">
          <div>
            <label class="asa-field-label" for="sch-title">
              {{ t('schedule.form.title') }} <span class="text-rose-500">*</span>
            </label>
            <v-text-field
              id="sch-title"
              v-model="form.title"
              class="asa-select"
              variant="solo"
              density="compact"
              hide-details
              :readonly="readonly"
              :error-messages="errors.title"
              :aria-required="true"
            />
          </div>

          <div>
            <label class="asa-field-label" for="sch-desc">{{ t('schedule.form.description') }}</label>
            <v-textarea
              id="sch-desc"
              v-model="form.description"
              class="asa-select"
              variant="solo"
              density="compact"
              rows="2"
              hide-details
              auto-grow
              :readonly="readonly"
            />
          </div>

          <div>
            <label class="asa-field-label" for="sch-assignees">
              {{ t('schedule.assignees') }} <span class="text-rose-500">*</span>
            </label>
            <v-select
              id="sch-assignees"
              v-model="form.assignees"
              class="asa-select"
              :items="assigneeOptions"
              item-title="label"
              item-value="value"
              variant="solo"
              density="compact"
              hide-details
              multiple
              chips
              closable-chips
              :disabled="readonly"
              :error-messages="errors.assignees"
            >
              <template #chip="{ item }">
                <span class="asa-pill asa-pill--teal">{{ item.raw.label }}</span>
              </template>
            </v-select>
          </div>

          <div class="sch-form__row">
            <div>
              <label class="asa-field-label">{{ t('schedule.form.priority') }}</label>
              <v-select
                v-model="form.priority"
                class="asa-select"
                :items="priorityOptions"
                item-title="title"
                item-value="value"
                variant="solo"
                density="compact"
                hide-details
                :disabled="readonly"
              />
            </div>
            <div>
              <label class="asa-field-label">{{ t('schedule.form.dueDate') }}</label>
              <PersianDatetimePicker
                v-model="form.dueDate"
                class="asa-datepicker"
                type="date"
                format="jYYYY-jMM-jDD"
                display-format="jYYYY/jMM/jDD"
                color="#5f8feb"
                clearable
                :disabled="readonly"
                :placeholder="t('schedule.form.dueDateHint')"
              />            </div>
          </div>

          <div class="sch-form__row">
            <div>
              <label class="asa-field-label" for="sch-est">{{ t('schedule.timeEstimated') }}</label>
              <v-text-field
                id="sch-est"
                v-model.number="form.estimatedHours"
                class="asa-select"
                type="number"
                min="0"
                step="0.5"
                variant="solo"
                density="compact"
                hide-details
                :suffix="t('schedule.hours')"
                :readonly="readonly"
              />
            </div>
            <div>
              <label class="asa-field-label" for="sch-spent">{{ t('schedule.timeSpent') }}</label>
              <v-text-field
                id="sch-spent"
                v-model.number="form.spentHours"
                class="asa-select"
                type="number"
                min="0"
                step="0.5"
                variant="solo"
                density="compact"
                hide-details
                :suffix="t('schedule.hours')"
                :readonly="readonly"
              />
            </div>
          </div>

          <div>
            <label class="asa-field-label" for="sch-notes">{{ t('schedule.form.notes') }}</label>
            <v-textarea
              id="sch-notes"
              v-model="form.notes"
              class="asa-select"
              variant="solo"
              density="compact"
              rows="2"
              hide-details
              auto-grow
              :readonly="readonly"
            />
          </div>

          <div v-if="task" class="sch-form__meta">
            <span v-if="task.createdByName" class="pf-info-label">{{ t('schedule.createdBy') }}</span>
            <span v-if="task.createdAt" class="pf-tiny">
              <v-icon size="11">mdi-clock-outline</v-icon>
              {{ formatJalaliDateShort(task.createdAt) }}
            </span>
            <span class="pf-info-label">{{ t('schedule.updatedAt') }}</span>
            <span class="pf-tiny">
              <v-icon size="11">mdi-clock-outline</v-icon>
              {{ formatJalaliDateShort(task.updatedAt) }}
            </span>
          </div>
        </form>
      </v-card-text>

      <v-card-actions class="asa-dialog__foot">
        <v-spacer />
        <button class="asa-btn asa-btn--ghost" type="button" :disabled="saving" @click="close">
          <span>{{ readonly ? t('schedule.close') : t('schedule.form.cancel') }}</span>
        </button>
        <button
          v-if="!readonly"
          class="asa-btn asa-btn--primary"
          type="button"
          :disabled="saving"
          @click="save"
        >
          <v-icon size="15" :class="{ 'pf-spin': saving }">
            {{ saving ? 'mdi-loading' : 'mdi-check' }}
          </v-icon>
          <span>{{ task ? t('schedule.form.saveChanges') : t('schedule.form.createTask') }}</span>
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { ClinicTask, ScheduleAssignee, TaskPriority, TaskStatus } from '~/types/schedule'

const props = defineProps<{
  modelValue: boolean
  task: ClinicTask | null
  assignees: ScheduleAssignee[]
  readonly?: boolean
  initialStatus?: TaskStatus
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const { t } = useI18n()
const { $toast } = useNuxtApp()
const { createTask, updateTask } = useSchedule()
const { priorityOptions, formatJalaliDateShort } = useTaskPresentation()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const readonly = computed(() => !!props.readonly)

const form = reactive({
  title: '',
  description: '',
  assignees: [] as string[],
  priority: 'medium' as TaskPriority,
  dueDate: '',
  estimatedHours: 0,
  spentHours: 0,
  notes: '',
})

const errors = reactive<{ title?: string; assignees?: string }>({})
const saving = ref(false)

const dialogTitle = computed(() => {
  if (readonly.value) return t('schedule.detailsTitle')
  return props.task ? t('schedule.form.editTitle') : t('schedule.form.addTitle')
})

const metaLine = computed(() => {
  if (!props.task) return ''
  const parts: string[] = []
  if (props.task.createdByName) parts.push(`${t('schedule.createdBy')}: ${props.task.createdByName}`)
  if (props.task.createdAt) parts.push(`${t('schedule.createdAt')}: ${formatJalaliDateShort(props.task.createdAt)}`)
  return parts.join(' • ')
})

const assigneeOptions = computed(() =>
  props.assignees.map((a) => ({
    label: [a.fullName, a.position].filter(Boolean).join(' — '),
    value: a.id,
  })),
)

watch(dialogVisible, (open) => {
  if (open) resetForm()
})

const resetForm = () => {
  errors.title = ''
  errors.assignees = ''
  const task = props.task
  form.title = task?.title ?? ''
  form.description = task?.description ?? ''
  form.assignees = task?.assignees?.map((a) => a.id) ?? []
  form.priority = task?.priority ?? 'medium'
  /* Backend stores Jalali YYYY-MM-DD, which is exactly the picker's `format`. */
  form.dueDate = task?.dueDate ?? ''
  form.estimatedHours = minutesToHours(task?.estimatedMinutes)
  form.spentHours = minutesToHours(task?.spentMinutes)
  form.notes = task?.notes ?? ''
}

function minutesToHours(mins: number | null | undefined): number {
  if (!mins) return 0
  return Math.round((mins / 60) * 100) / 100
}

function hoursToMinutes(hours: number | null | undefined): number {
  if (!hours || Number.isNaN(hours)) return 0
  return Math.round(Math.max(0, hours) * 60)
}

const validate = () => {
  errors.title = form.title.trim() ? '' : t('schedule.form.titleRequired')
  errors.assignees = form.assignees.length ? '' : t('schedule.form.assigneesRequired')
  return !errors.title && !errors.assignees
}

const save = async () => {
  if (readonly.value || saving.value) return
  if (!validate()) return
  saving.value = true
  try {
    const body: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description || null,
      assignees: form.assignees,
      priority: form.priority,
      dueDate: form.dueDate ? form.dueDate.replace(/\//g, '-') : null,
      estimatedMinutes: hoursToMinutes(form.estimatedHours),
      spentMinutes: hoursToMinutes(form.spentHours),
      notes: form.notes || null,
    }
    if (!props.task) body.status = props.initialStatus || 'pending'

    const res = props.task ? await updateTask(props.task.id, body) : await createTask(body)
    if (res.success) {
      $toast.success(props.task ? t('schedule.form.updateSuccess') : t('schedule.form.createSuccess'))
      dialogVisible.value = false
      emit('saved')
    }
  } catch {
    $toast.error(t('schedule.form.error'))
  } finally {
    saving.value = false
  }
}

const close = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.sch-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sch-form__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.sch-form__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.75rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--asa-sep);
}

@media (min-width: 520px) {
  .sch-form__row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
