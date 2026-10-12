<template>
  <div class="app-rise">
    <!-- Scope switch -->
    <div class="app-seg app-mt-0" style="margin-bottom: 14px;">
      <button type="button" class="app-seg__btn" :class="{ active: scope === 'mine' }" @click="setScope('mine')">
        وظایف من
      </button>
      <button type="button" class="app-seg__btn" :class="{ active: scope === 'all' }" @click="setScope('all')">
        همهٔ وظایف
      </button>
    </div>

    <!-- Stats -->
    <section class="sch-counts">
      <div class="sch-count sch-count--amber">
        <span class="sch-count__value">{{ pn(stats.pending) }}</span>
        <span class="sch-count__label">در انتظار</span>
      </div>
      <div class="sch-count sch-count--indigo">
        <span class="sch-count__value">{{ pn(stats.inProgress) }}</span>
        <span class="sch-count__label">در حال انجام</span>
      </div>
      <div class="sch-count sch-count--green">
        <span class="sch-count__value">{{ pn(stats.done) }}</span>
        <span class="sch-count__label">انجام‌شده</span>
      </div>
      <div class="sch-count sch-count--rose">
        <span class="sch-count__value">{{ pn(stats.overdue) }}</span>
        <span class="sch-count__label">عقب‌افتاده</span>
      </div>
    </section>

    <!-- Status filter -->
    <div class="app-seg">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        type="button"
        class="app-seg__btn"
        :class="{ active: statusFilter === option.value }"
        @click="setStatus(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="app-list app-mt-16">
      <div v-for="i in 5" :key="i" class="app-skel" style="height: 76px;" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:triangle-alert" size="26" /></span>
      <p>دریافت وظایف ناموفق بود</p>
      <button type="button" class="app-btn app-btn--ghost" style="width: auto;" @click="load">تلاش دوباره</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!tasks.length" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:clipboard-check" size="26" /></span>
      <p>وظیفه‌ای برای نمایش وجود ندارد</p>
    </div>

    <!-- Tasks -->
    <div v-else class="app-list app-mt-16">
      <div v-for="task in tasks" :key="task.id" class="app-card task" :class="{ 'task--overdue': isOverdue(task) }">
        <div class="task__head">
          <span class="app-pill" :class="statusPill[task.status]">{{ statusLabel[task.status] }}</span>
          <span class="app-pill" :class="priorityPill[task.priority]">{{ priorityLabel[task.priority] }}</span>
          <span class="app-row__spacer" />
          <button
            v-if="task.status !== 'done'"
            type="button"
            class="app-iconbtn task__done"
            aria-label="انجام شد"
            :disabled="busyId === task.id"
            @click="markDone(task)"
          >
            <Icon :name="busyId === task.id ? 'lucide:loader-2' : 'lucide:check'" size="17" />
          </button>
        </div>

        <h3 class="task__title">{{ task.title }}</h3>
        <p v-if="task.description" class="task__desc">{{ task.description }}</p>

        <div class="task__foot">
          <span v-if="task.assignees?.length" class="task__assignees">
            <span v-for="assignee in task.assignees.slice(0, 3)" :key="assignee.id" class="app-avatar task__avatar">
              {{ initials(assignee.fullName) }}
            </span>
            <span v-if="task.assignees.length > 3" class="app-muted" style="font-size: 11px;">
              +{{ pn(task.assignees.length - 3) }}
            </span>
          </span>
          <span class="app-row__spacer" />
          <span v-if="task.dueDate" class="task__due" :class="{ 'task__due--late': isOverdue(task) }">
            <Icon name="lucide:calendar-clock" size="14" />
            {{ formatJalaliDateShort(task.dueDate) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClinicTask, TaskStats, TaskStatus } from '~/types/schedule'

definePageMeta({ layout: 'app', appTitle: 'برنامه کاری', appSubtitle: 'وظایف و پیگیری‌ها' })

const { pn } = useLang()
const { formatJalaliDateShort } = useFormatting()
const { isOverdue, initials } = useHelpers()
const { getStats, listTasks, changeStatus } = useSchedule()
const { $toast } = useNuxtApp()

type Scope = 'mine' | 'all'

const scope = ref<Scope>('mine')
const statusFilter = ref<TaskStatus | ''>('')
const tasks = ref<ClinicTask[]>([])
const stats = ref<TaskStats>({ total: 0, pending: 0, inProgress: 0, done: 0, overdue: 0 })
const loading = ref(true)
const error = ref(false)
const busyId = ref<string | null>(null)

const statusLabel: Record<TaskStatus, string> = {
  pending: 'در انتظار',
  in_progress: 'در حال انجام',
  done: 'انجام‌شده',
  cancelled: 'لغو‌شده',
}
const statusPill: Record<TaskStatus, string> = {
  pending: 'app-pill--amber',
  in_progress: 'app-pill--indigo',
  done: 'app-pill--green',
  cancelled: 'app-pill--neutral',
}
const priorityLabel: Record<string, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'فوری',
}
const priorityPill: Record<string, string> = {
  low: 'app-pill--neutral',
  medium: 'app-pill--amber',
  high: 'app-pill--rose',
}

const statusOptions: Array<{ value: TaskStatus | ''; label: string }> = [
  { value: '', label: 'همه' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'in_progress', label: 'در حال انجام' },
  { value: 'done', label: 'انجام‌شده' },
]

async function load() {
  loading.value = true
  error.value = false
  try {
    const res = await listTasks({
      assignedToMe: scope.value === 'mine' ? true : undefined,
      status: statusFilter.value || undefined,
      limit: 50,
      sort: 'due_date_asc',
    })
    tasks.value = res?.success && Array.isArray(res.data) ? res.data : []
  } catch {
    error.value = true
    tasks.value = []
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await getStats()
  } catch {
    /* keep previous stats */
  }
}

function setScope(next: Scope) {
  if (scope.value === next) return
  scope.value = next
  void load()
}

function setStatus(next: TaskStatus | '') {
  if (statusFilter.value === next) return
  statusFilter.value = next
  void load()
}

async function markDone(task: ClinicTask) {
  busyId.value = task.id
  try {
    const res = await changeStatus(task.id, 'done')
    if (res?.success) {
      task.status = 'done'
      $toast.success('وظیفه انجام‌شده علامت زد')
      void loadStats()
    }
  } catch {
    $toast.error('تغییر وضعیت ناموفق بود')
  } finally {
    busyId.value = null
  }
}

onMounted(async () => {
  await Promise.all([load(), loadStats()])
})
</script>

<style scoped>
.app-mt-0 { margin-top: 0; }

.sch-counts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.sch-count {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 8px;
  border-radius: var(--app-radius);
  background: var(--app-surface-2);
  text-align: center;
}
.sch-count__value { font-size: 18px; font-weight: 800; line-height: 1.1; }
.sch-count__label { font-size: 10.5px; color: var(--app-muted); }
.sch-count--amber .sch-count__value { color: var(--app-amber); }
.sch-count--indigo .sch-count__value { color: var(--app-indigo); }
.sch-count--green .sch-count__value { color: var(--app-income); }
.sch-count--rose .sch-count__value { color: var(--app-expense); }

.task {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-inline-start: 3px solid transparent;
}
.task--overdue { border-inline-start-color: var(--app-expense); }
.task__head { display: flex; align-items: center; gap: 6px; }
.task__done {
  width: 30px; height: 30px;
  background: var(--app-green-soft);
  color: var(--app-income);
}
.task__title { font-size: 14.5px; font-weight: 700; line-height: 1.5; }
.task__desc {
  font-size: 12.5px;
  color: var(--app-muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.task__foot { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.task__assignees { display: flex; align-items: center; gap: -6px; }
.task__avatar {
  width: 26px; height: 26px;
  font-size: 10px;
  border: 2px solid var(--app-surface);
  margin-inline-end: -8px;
}
.task__due {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--app-muted);
}
.task__due--late { color: var(--app-expense); font-weight: 600; }

.app-row__spacer { flex: 1; }

@media (max-width: 420px) {
  .sch-counts { grid-template-columns: repeat(2, 1fr); }
}
</style>
