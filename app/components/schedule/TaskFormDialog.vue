<template>
  <v-dialog v-model="dialogVisible" max-width="640">
    <v-card class="rounded-2xl">
      <div class="crm-dialog-header">
        <div>
          <h3 class="crm-dialog-title">{{ dialogTitle }}</h3>
          <p v-if="task" class="text-xs text-slate-400 mt-0.5">{{ metaLine }}</p>
        </div>
        <button @click="close" class="crm-dialog-close"><v-icon size="20">mdi-close</v-icon></button>
      </div>
      <v-card-text class="crm-dialog-body">
        <div class="space-y-4">
          <div>
            <label class="crm-label">{{ t('schedule.form.title') }} *</label>
            <v-text-field v-model="form.title" variant="outlined" density="comfortable" hide-details
              :error="!!errors.title" :disabled="readonly" append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting('title')" />
            <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.description') }}</label>
            <v-textarea v-model="form.description" variant="outlined" density="comfortable" rows="2" hide-details
              :disabled="readonly" append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting('description')" />
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.assignees') }} *</label>
            <v-select v-model="form.assignees" :items="assigneeOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" hide-details multiple :error="!!errors.assignees"
              :disabled="readonly">
              <template #selection="{ item }">
                <v-chip size="small" class="mr-1 mb-1">{{ item.raw.label }}</v-chip>
              </template>
            </v-select>
            <p v-if="errors.assignees" class="text-xs text-red-500 mt-1">{{ errors.assignees }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="crm-label">{{ t('schedule.form.priority') }}</label>
              <v-select v-model="form.priority" :items="priorityOptions" item-title="label" item-value="value"
                variant="outlined" density="comfortable" hide-details :disabled="readonly" />
            </div>
            <div>
              <label class="crm-label">{{ t('schedule.form.dueDate') }}</label>
              <div class="relative h-[48px] border rounded overflow-hidden">
                <PersianDatetimePicker v-model="form.dueDate" type="date" format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD" variant="outlined" density="comfortable" hide-details
                  :disabled="readonly" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="crm-label">{{ t('schedule.timeEstimated') }}</label>
              <v-text-field v-model.number="form.estimatedHours" type="number" min="0" step="0.5"
                variant="outlined" density="comfortable" hide-details :suffix="t('schedule.hours')"
                :disabled="readonly" />
            </div>
            <div>
              <label class="crm-label">{{ t('schedule.timeSpent') }}</label>
              <v-text-field v-model.number="form.spentHours" type="number" min="0" step="0.5"
                variant="outlined" density="comfortable" hide-details :suffix="t('schedule.hours')"
                :disabled="readonly" />
            </div>
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.notes') }}</label>
            <v-textarea v-model="form.notes" variant="outlined" density="comfortable" rows="2" hide-details
              :disabled="readonly" append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting('notes')" />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="crm-dialog-footer">
        <v-spacer />
        <v-btn variant="text" class="crm-btn crm-btn-ghost" @click="close">
          {{ readonly ? t('schedule.close') : t('schedule.form.cancel') }}
        </v-btn>
        <v-btn v-if="!readonly" variant="flat" class="crm-btn crm-btn-accent" :loading="saving" @click="save">
          {{ task ? t('schedule.form.saveChanges') : t('schedule.form.createTask') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { ClinicTask, ScheduleAssignee, TaskPriority, TaskStatus } from '~/types/schedule'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

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
const { formatJalaliDateShort } = useFormatting()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

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
const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      title: t('schedule.form.title'),
      description: t('schedule.form.description'),
      notes: t('schedule.form.notes'),
    },
    target: form,
  })
const errors = reactive<{ title?: string; assignees?: string }>({})
const saving = ref(false)

const readonly = computed(() => props.readonly)

const dialogTitle = computed(() => {
  if (readonly.value) return t('schedule.detailsTitle')
  return props.task ? t('schedule.form.editTitle') : t('schedule.form.addTitle')
})

const metaLine = computed(() => {
  if (!props.task) return ''
  const parts: string[] = []
  if (props.task.createdByName) parts.push(`${t('schedule.createdBy')}: ${props.task.createdByName}`)
  if (props.task.createdAt) parts.push(`${t('schedule.createdAt')}: ${formatJalaliDateShort(props.task.createdAt)}`)
  if (props.task.updatedAt) parts.push(`${t('schedule.updatedAt')}: ${formatJalaliDateShort(props.task.updatedAt)}`)
  return parts.join('  •  ')
})

const assigneeOptions = computed(() =>
  props.assignees.map((a) => ({
    label: [a.fullName, a.position].filter(Boolean).join(' — '),
    value: a.id,
  })),
)

const priorityOptions = computed(() => [
  { label: t('schedule.priorities.low'), value: 'low' },
  { label: t('schedule.priorities.medium'), value: 'medium' },
  { label: t('schedule.priorities.high'), value: 'high' },
])

watch(dialogVisible, (open) => {
  if (open) resetForm()
})

const resetForm = () => {
  errors.title = ''
  errors.assignees = ''
  if (props.task) {
    form.title = props.task.title
    form.description = props.task.description || ''
    form.assignees = props.task.assignees?.map((a) => a.id) || []
    form.priority = props.task.priority
    form.dueDate = (props.task.dueDate || '').replace(/-/g, '/')
    form.estimatedHours = minutesToHours(props.task.estimatedMinutes)
    form.spentHours = minutesToHours(props.task.spentMinutes)
    form.notes = props.task.notes || ''
  } else {
    form.title = ''
    form.description = ''
    form.assignees = []
    form.priority = 'medium'
    form.dueDate = ''
    form.estimatedHours = 0
    form.spentHours = 0
    form.notes = ''
  }
}

const minutesToHours = (mins: number | null | undefined) => {
  if (!mins) return 0
  return Math.round((mins / 60) * 100) / 100
}

const hoursToMinutes = (hours: number | null | undefined) => {
  if (!hours || Number.isNaN(hours)) return 0
  return Math.round(Math.max(0, hours) * 60)
}

const validate = () => {
  errors.title = form.title.trim() ? '' : t('schedule.form.titleRequired')
  errors.assignees = form.assignees.length ? '' : t('schedule.form.assigneesRequired')
  return !errors.title && !errors.assignees
}

const save = async () => {
  if (readonly.value) return
  if (!validate()) return
  saving.value = true
  try {
    const body = {
      title: form.title.trim(),
      description: form.description || null,
      assignees: form.assignees,
      priority: form.priority,
      dueDate: form.dueDate ? form.dueDate.replace(/\//g, '-') : null,
      estimatedMinutes: hoursToMinutes(form.estimatedHours),
      spentMinutes: hoursToMinutes(form.spentHours),
      notes: form.notes || null,
      ...(props.task ? {} : { status: props.initialStatus || 'pending' }),
    }
    const res = props.task
      ? await updateTask(props.task.id, body)
      : await createTask(body)
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
