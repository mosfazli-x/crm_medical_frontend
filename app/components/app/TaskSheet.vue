<template>
  <UiDialog v-model="open" size="lg" :title="title" :closeable="!saving">
    <div v-if="task" class="ts-meta">
      <span v-if="task.createdByName" class="ts-meta__item">
        <Icon name="lucide:user-round" size="13" />
        {{ task.createdByName }}
      </span>
      <span class="ts-meta__item">
        <Icon name="lucide:clock" size="13" />
        {{ formatJalaliDateShort(task.createdAt) }}
      </span>
    </div>

    <!-- Detail (read-only) mode -->
    <div v-if="readonly" class="ts-detail">
      <div class="ts-detail__pills">
        <span class="app-pill" :class="statusPill(task?.status)">{{ statusLabel(task?.status) }}</span>
        <span class="app-pill" :class="priorityPill(task?.priority)">{{ priorityLabel(task?.priority) }}</span>
        <span v-if="task?.dueDate" class="app-pill" :class="isOverdue(task) ? 'app-pill--rose' : 'app-pill--neutral'">
          <Icon name="lucide:calendar-clock" size="13" />
          {{ formatJalaliDateShort(task.dueDate) }}
        </span>
      </div>

      <p v-if="task?.description" class="ts-detail__desc">{{ task.description }}</p>

      <section v-if="task?.assignees?.length" class="ts-block">
        <h4 class="ts-block__label">مسئولان</h4>
        <div class="ts-assignees">
          <span v-for="a in task.assignees" :key="a.id" class="ts-assignee">
            <span class="app-avatar ts-assignee__avatar" :style="{ background: avatarColor(a.id) }">{{ assigneeInitials(a) }}</span>
            <span class="ts-assignee__name">{{ assigneeLabel(a) }}</span>
          </span>
        </div>
      </section>

      <section v-if="task && (task.estimatedMinutes || task.spentMinutes)" class="ts-block">
        <h4 class="ts-block__label">زمان</h4>
        <div class="ts-times">
          <span v-if="task.estimatedMinutes" class="ts-time">
            <Icon name="lucide:target" size="14" /> برآورد: {{ formatMinutes(task.estimatedMinutes) }}
          </span>
          <span class="ts-time">
            <Icon name="lucide:history" size="14" /> صرف‌شده: {{ formatMinutes(task.spentMinutes) }}
          </span>
        </div>
      </section>

      <section v-if="task?.notes" class="ts-block">
        <h4 class="ts-block__label">یادداشت</h4>
        <p class="ts-detail__notes">{{ task.notes }}</p>
      </section>
    </div>

    <!-- Edit / create mode -->
    <div v-else class="ts-form">
      <AppField label="عنوان" required :error="errors.title" class="ts-form__wide">
        <input v-model.trim="form.title" class="app-input" type="text" maxlength="300" :disabled="saving">
      </AppField>

      <AppField label="توضیحات" class="ts-form__wide">
        <textarea v-model.trim="form.description" class="app-input ep-textarea" rows="3" maxlength="2000" :disabled="saving" />
      </AppField>

      <AppField label="اولویت">
        <select v-model="form.priority" class="app-input" :disabled="saving">
          <option v-for="p in TASK_PRIORITIES" :key="p" :value="p">{{ priorityLabel(p) }}</option>
        </select>
      </AppField>

      <AppField label="مهلت انجام">
        <PersianDatetimePicker
          v-model="form.dueDate"
          type="date"
          format="jYYYY-jMM-jDD"
          display-format="jYYYY/jMM/jDD"
          color="#5f8feb"
          auto-submit
          clearable
          append-to="body"
          :disabled="saving"
          placeholder="انتخاب تاریخ"
          input-class="app-input"
        />
      </AppField>

      <AppField label="زمان برآوردی (ساعت)">
        <input v-model.number="form.estimatedHours" class="app-input" type="number" min="0" step="0.5" dir="ltr" :disabled="saving">
      </AppField>

      <AppField label="زمان صرف‌شده (ساعت)">
        <input v-model.number="form.spentHours" class="app-input" type="number" min="0" step="0.5" dir="ltr" :disabled="saving">
      </AppField>

      <AppField label="مسئولان" required :error="errors.assignees" class="ts-form__wide">
        <div class="ts-people">
          <button
            v-for="a in assignees"
            :key="a.id"
            type="button"
            class="ts-person"
            :class="{ 'ts-person--on': form.assignees.includes(a.id) }"
            :disabled="saving"
            @click="toggleAssignee(a.id)"
          >
            <span class="ts-person__avatar">{{ assigneeInitials(a) }}</span>
            <span class="ts-person__name">{{ a.fullName?.trim() || a.phone }}</span>
            <span v-if="a.position" class="ts-person__pos">{{ a.position }}</span>
            <Icon v-if="form.assignees.includes(a.id)" name="lucide:check" size="14" class="ts-person__check" />
          </button>
          <p v-if="assigneesLoading" class="ts-people__empty">در حال بارگذاری…</p>
          <p v-else-if="!assignees.length" class="ts-people__empty">کاربری برای واگذاری یافت نشد</p>
        </div>
      </AppField>

      <AppField label="یادداشت" class="ts-form__wide">
        <textarea v-model.trim="form.notes" class="app-input ep-textarea" rows="2" maxlength="2000" :disabled="saving" />
      </AppField>
    </div>

    <template #footer>
      <button type="button" class="app-btn app-btn--ghost ts-foot-btn" :disabled="saving" @click="open = false">
        {{ readonly ? 'بستن' : 'انصراف' }}
      </button>
      <button
        v-if="!readonly"
        type="button"
        class="app-btn app-btn--primary ts-foot-btn"
        :disabled="saving"
        @click="save"
      >
        <Icon v-if="saving" name="lucide:loader-2" size="15" class="ts-spin" />
        {{ task ? 'ذخیرهٔ تغییرات' : 'ایجاد وظیفه' }}
      </button>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { TASK_PRIORITIES } from '~/types/schedule'
import type { ClinicTask, ScheduleAssignee, TaskPriority } from '~/types/schedule'

const props = defineProps<{
  modelValue: boolean
  task: ClinicTask | null
  assignees: ScheduleAssignee[]
  assigneesLoading?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', task: ClinicTask): void
}>()

const { $toast } = useNuxtApp()
const { createTask, updateTask } = useSchedule()
const { formatJalaliDateShort, formatMinutes } = useFormatting()
const { statusPill, priorityPill, statusLabel, priorityLabel, assigneeInitials, assigneeLabel, avatarColor, isOverdue } = useTaskPresentation()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const readonly = computed(() => !!props.readonly)
const title = computed(() => {
  if (readonly.value) return 'جزئیات وظیفه'
  return props.task ? 'ویرایش وظیفه' : 'وظیفهٔ جدید'
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

const errors = reactive<{ title?: string; assignees?: string }>({})
const saving = ref(false)

watch(open, (v) => {
  if (v) reset()
})

function reset() {
  errors.title = ''
  errors.assignees = ''
  const t = props.task
  form.title = t?.title ?? ''
  form.description = t?.description ?? ''
  form.assignees = t?.assignees?.map((a) => a.id) ?? []
  form.priority = t?.priority ?? 'medium'
  form.dueDate = t?.dueDate ?? ''
  form.estimatedHours = minutesToHours(t?.estimatedMinutes)
  form.spentHours = minutesToHours(t?.spentMinutes)
  form.notes = t?.notes ?? ''
}

function minutesToHours(mins: number | null | undefined): number {
  if (!mins) return 0
  return Math.round((mins / 60) * 100) / 100
}

function hoursToMinutes(hours: number | null | undefined): number {
  if (!hours || Number.isNaN(hours)) return 0
  return Math.round(Math.max(0, hours) * 60)
}

function toggleAssignee(id: string) {
  const idx = form.assignees.indexOf(id)
  if (idx >= 0) form.assignees.splice(idx, 1)
  else form.assignees.push(id)
}

function validate(): boolean {
  errors.title = form.title.trim() ? '' : 'عنوان الزامی است'
  errors.assignees = form.assignees.length ? '' : 'حداقل یک مسئول انتخاب کنید'
  return !errors.title && !errors.assignees
}

async function save() {
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
    if (!props.task) body.status = 'pending'

    const res = props.task ? await updateTask(props.task.id, body) : await createTask(body)
    if (res?.success) {
      $toast.success(props.task ? 'تغییرات ذخیره شد' : 'وظیفه ایجاد شد')
      emit('saved', res.data)
      open.value = false
    }
  } catch {
    $toast.error(props.task ? 'ذخیرهٔ تغییرات ناموفق بود' : 'ایجاد وظیفه ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ts-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--app-muted);
}

.ts-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ts-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.ts-form__wide {
  grid-column: 1 / -1;
}

.ep-textarea {
  resize: vertical;
  min-height: 56px;
}

/* Detail */
.ts-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ts-detail__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ts-detail__desc,
.ts-detail__notes {
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--app-text-2);
  white-space: pre-wrap;
}

.ts-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ts-block__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--app-muted);
}

.ts-assignees {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ts-assignee {
  display: flex;
  align-items: center;
  gap: 9px;
}

.ts-assignee__avatar {
  width: 30px;
  height: 30px;
  font-size: 11px;
  color: #fff;
}

.ts-assignee__name {
  font-size: 13px;
  font-weight: 600;
}

.ts-times {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.ts-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--app-text-2);
}

/* Assignee picker */
.ts-people {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  background: var(--app-surface-2);
}

.ts-people__empty {
  padding: 12px;
  text-align: center;
  font-size: 12.5px;
  color: var(--app-muted);
}

.ts-person {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--app-surface);
  color: var(--app-text);
  font-family: inherit;
  text-align: start;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.ts-person--on {
  border-color: var(--app-brand);
  background: var(--app-brand-soft);
}

.ts-person__avatar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--app-surface-2);
  color: var(--app-text-2);
  font-size: 11px;
  font-weight: 800;
}

.ts-person--on .ts-person__avatar {
  background: var(--app-brand);
  color: #fff;
}

.ts-person__name {
  font-size: 13px;
  font-weight: 600;
}

.ts-person__pos {
  font-size: 11px;
  color: var(--app-muted);
}

.ts-person__check {
  margin-inline-start: auto;
  color: var(--app-brand-deep);
}

/* Footer */
.ts-foot-btn {
  width: auto;
  flex: 0 0 auto;
}

.ts-spin {
  animation: ep-spin 0.8s linear infinite;
}

@keyframes ep-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 440px) {
  .ts-form {
    grid-template-columns: 1fr;
  }
}
</style>
