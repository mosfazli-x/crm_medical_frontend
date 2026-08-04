<template>
  <v-dialog v-model="dialogVisible" max-width="600">
    <v-card class="rounded-2xl">
      <div class="crm-dialog-header">
        <h3 class="crm-dialog-title">{{ task ? t('schedule.form.editTitle') : t('schedule.form.addTitle') }}</h3>
        <button @click="close" class="crm-dialog-close"><v-icon size="20">mdi-close</v-icon></button>
      </div>
      <v-card-text class="crm-dialog-body">
        <div class="space-y-4">
          <div>
            <label class="crm-label">{{ t('schedule.form.title') }} *</label>
            <v-text-field v-model="form.title" variant="outlined" density="comfortable" hide-details
              :error="!!errors.title" />
            <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.description') }}</label>
            <v-textarea v-model="form.description" variant="outlined" density="comfortable" rows="2" hide-details />
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.assignee') }} *</label>
            <v-select v-model="form.assigneeId" :items="assigneeOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" hide-details :error="!!errors.assigneeId" />
            <p v-if="errors.assigneeId" class="text-xs text-red-500 mt-1">{{ errors.assigneeId }}</p>
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.priority') }}</label>
            <v-select v-model="form.priority" :items="priorityOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.dueDate') }}</label>
            <div class="relative h-[48px] border rounded overflow-hidden">
              <PersianDatetimePicker v-model="form.dueDate" type="date" format="jYYYY/jMM/jDD"
                display-format="jYYYY/jMM/jDD" variant="outlined" density="comfortable" hide-details />
            </div>
            <p class="text-xs text-slate-400 mt-1">{{ t('schedule.form.dueDateHint') }}</p>
          </div>
          <div>
            <label class="crm-label">{{ t('schedule.form.notes') }}</label>
            <v-textarea v-model="form.notes" variant="outlined" density="comfortable" rows="2" hide-details />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="crm-dialog-footer">
        <v-spacer />
        <v-btn variant="text" class="crm-btn crm-btn-ghost" @click="close">{{ t('schedule.form.cancel') }}</v-btn>
        <v-btn variant="flat" class="crm-btn crm-btn-accent" :loading="saving" @click="save">
          {{ task ? t('schedule.form.saveChanges') : t('schedule.form.createTask') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { ClinicTask, ScheduleAssignee, TaskPriority } from '~/types/schedule'

const props = defineProps<{
  modelValue: boolean
  task: ClinicTask | null
  assignees: ScheduleAssignee[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const { t } = useI18n()
const { $toast } = useNuxtApp()
const { createTask, updateTask } = useSchedule()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const form = reactive({
  title: '',
  description: '',
  assigneeId: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  notes: '',
})
const errors = reactive<{ title?: string; assigneeId?: string }>({})
const saving = ref(false)

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
  errors.assigneeId = ''
  if (props.task) {
    form.title = props.task.title
    form.description = props.task.description || ''
    form.assigneeId = props.task.assigneeId
    form.priority = props.task.priority
    form.dueDate = (props.task.dueDate || '').replace(/-/g, '/')
    form.notes = props.task.notes || ''
  } else {
    form.title = ''
    form.description = ''
    form.assigneeId = ''
    form.priority = 'medium'
    form.dueDate = ''
    form.notes = ''
  }
}

const validate = () => {
  errors.title = form.title.trim() ? '' : t('schedule.form.titleRequired')
  errors.assigneeId = form.assigneeId ? '' : t('schedule.form.assigneeRequired')
  return !errors.title && !errors.assigneeId
}

const save = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const body = {
      title: form.title.trim(),
      description: form.description || null,
      assigneeId: form.assigneeId,
      priority: form.priority,
      dueDate: form.dueDate ? form.dueDate.replace(/\//g, '-') : null,
      notes: form.notes || null,
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
