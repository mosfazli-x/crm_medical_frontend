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
      <button type="button" class="sch-count sch-count--amber" :class="{ 'sch-count--on': dueFilter === '' && statusFilter === 'pending' }" @click="quickFilter('pending')">
        <span class="sch-count__value">{{ pn(stats.pending) }}</span>
        <span class="sch-count__label">در انتظار</span>
      </button>
      <button type="button" class="sch-count sch-count--indigo" @click="quickFilter('in_progress')">
        <span class="sch-count__value">{{ pn(stats.inProgress) }}</span>
        <span class="sch-count__label">در حال انجام</span>
      </button>
      <button type="button" class="sch-count sch-count--green" @click="quickFilter('done')">
        <span class="sch-count__value">{{ pn(stats.done) }}</span>
        <span class="sch-count__label">انجام‌شده</span>
      </button>
      <button type="button" class="sch-count sch-count--rose" @click="quickFilterOverdue">
        <span class="sch-count__value">{{ pn(stats.overdue) }}</span>
        <span class="sch-count__label">عقب‌افتاده</span>
      </button>
    </section>

    <!-- Search + filter -->
    <div class="sch-tools">
      <div class="app-search sch-tools__search">
        <Icon name="lucide:search" size="17" class="app-search__icon" />
        <input v-model="search" class="app-input" type="search" placeholder="جستجوی وظیفه…">
      </div>
      <button
        v-if="canManage"
        type="button"
        class="app-iconbtn sch-tools__add"
        aria-label="وظیفهٔ جدید"
        @click="addTask"
      >
        <Icon name="lucide:plus" size="20" />
      </button>
      <button
        type="button"
        class="app-iconbtn sch-tools__filter"
        :class="{ 'sch-tools__filter--on': filtersActive }"
        aria-label="فیلترها"
        @click="filterOpen = true"
      >
        <Icon name="lucide:sliders-horizontal" size="18" />
        <span v-if="activeFilterCount" class="sch-tools__badge">{{ pn(activeFilterCount) }}</span>
      </button>
    </div>

    <!-- Active chips -->
    <div v-if="activeChips.length" class="sch-chips">
      <button v-for="chip in activeChips" :key="chip.key" type="button" class="sch-chip" @click="chip.clear()">
        {{ chip.label }}
        <Icon name="lucide:x" size="12" />
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="app-list app-mt-16">
      <div v-for="i in 5" :key="i" class="app-skel" style="height: 88px;" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:triangle-alert" size="26" /></span>
      <p>دریافت وظایف ناموفق بود</p>
      <button type="button" class="app-btn app-btn--ghost" style="width: auto;" @click="reload">تلاش دوباره</button>
    </div>

    <!-- Empty -->
    <AppEmpty v-else-if="!tasks.length" icon="lucide:clipboard-check" text="وظیفه‌ای برای نمایش وجود ندارد" />

    <!-- Tasks -->
    <div v-else class="app-list app-mt-16">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="app-card task"
        :class="{ 'task--overdue': isOverdue(task) }"
        role="button"
        tabindex="0"
        @click="openTask(task)"
        @keydown.enter.prevent="openTask(task)"
      >
        <div class="task__head">
          <span class="app-pill" :class="statusPill[task.status]">{{ statusLabel[task.status] }}</span>
          <span class="app-pill" :class="priorityPill[task.priority]">{{ priorityLabel[task.priority] }}</span>
          <span class="app-row__spacer" />
          <button
            v-if="canChangeStatus(task)"
            type="button"
            class="app-iconbtn task__done"
            aria-label="انجام شد"
            :disabled="busyId === task.id"
            @click.stop="markDone(task)"
          >
            <Icon :name="busyId === task.id ? 'lucide:loader-2' : 'lucide:check'" size="17" :class="{ 'task__spin': busyId === task.id }" />
          </button>
          <template v-if="canManage">
            <button type="button" class="app-iconbtn" aria-label="ویرایش" @click.stop="editTask(task)">
              <Icon name="lucide:pencil" size="16" />
            </button>
            <button type="button" class="app-iconbtn task__del" aria-label="حذف" @click.stop="askDelete(task)">
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </template>
        </div>

        <h3 class="task__title">{{ task.title }}</h3>
        <p v-if="task.description" class="task__desc">{{ task.description }}</p>

        <div class="task__foot">
          <span v-if="task.assignees?.length" class="task__assignees">
            <span v-for="assignee in task.assignees.slice(0, 3)" :key="assignee.id" class="app-avatar task__avatar">
              {{ assigneeInitials(assignee) }}
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

      <!-- Load more -->
      <button
        v-if="hasMore"
        type="button"
        class="app-btn app-btn--ghost"
        :disabled="loadingMore"
        @click="loadMore"
      >
        <Icon v-if="loadingMore" name="lucide:loader-2" size="15" :class="{ 'task__spin': loadingMore }" />
        {{ loadingMore ? 'در حال بارگذاری…' : 'نمایش بیشتر' }}
      </button>
    </div>

    <!-- Filter sheet -->
    <UiDialog v-model="filterOpen" size="md" title="فیلتر و ترتیب">
      <div class="sch-filters">
        <div class="sch-filter">
          <label class="sch-filter__label">وضعیت</label>
          <div class="app-seg sch-filter__seg">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="app-seg__btn"
              :class="{ active: statusFilter === option.value }"
              @click="statusFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="sch-filter">
          <label class="sch-filter__label">اولویت</label>
          <div class="app-seg sch-filter__seg">
            <button
              v-for="option in priorityFilterOptions"
              :key="option.value"
              type="button"
              class="app-seg__btn"
              :class="{ active: priorityFilter === option.value }"
              @click="priorityFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="sch-filter">
          <label class="sch-filter__label">مهلت</label>
          <div class="app-seg sch-filter__seg">
            <button
              v-for="option in dueOptions"
              :key="option.value"
              type="button"
              class="app-seg__btn"
              :class="{ active: dueFilter === option.value }"
              @click="dueFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="canManage" class="sch-filter">
          <label class="sch-filter__label">مسئول</label>
          <select v-model="assigneeFilter" class="app-input">
            <option value="">همهٔ مسئولان</option>
            <option v-for="a in assignees" :key="a.id" :value="a.id">
              {{ a.fullName?.trim() || a.phone }}
            </option>
          </select>
        </div>

        <div class="sch-filter">
          <label class="sch-filter__label">ترتیب</label>
          <select v-model="sort" class="app-input">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <template #footer>
        <button type="button" class="app-btn app-btn--ghost sch-foot-btn" @click="clearFilters">پاک‌سازی</button>
        <button type="button" class="app-btn app-btn--primary sch-foot-btn" @click="applyFilters">اعمال</button>
      </template>
    </UiDialog>

    <!-- Task create/edit sheet -->
    <AppTaskSheet
      v-model="sheetOpen"
      :task="selected"
      :assignees="assignees"
      :assignees-loading="assigneesLoading"
      :readonly="sheetReadonly"
      @saved="onSaved"
    />

    <!-- Delete confirm -->
    <UiConfirmDialog
      v-model="deleteOpen"
      title="حذف وظیفه"
      :message="`آیا از حذف «${deleteTarget?.title ?? ''}» مطمئن هستید؟`"
      confirm-label="حذف"
      cancel-label="انصراف"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { ClinicTask, ScheduleAssignee, TaskPriority, TaskSort, TaskStats, TaskStatus } from '~/types/schedule'

definePageMeta({ layout: 'app', appTitle: 'برنامه کاری', appSubtitle: 'وظایف و پیگیری‌ها' })

const { pn } = useLang()
const { formatJalaliDateShort } = useFormatting()
const { isOverdue, assigneeInitials } = useHelpers()
const { statusPill, priorityPill, statusLabel, priorityLabel, sortOptions } = useTaskPresentation()
const { user } = useAuth()
const { getStats, listTasks, listAssignees, changeStatus, deleteTask } = useSchedule()
const { $toast } = useNuxtApp()

type Scope = 'mine' | 'all'

const role = computed(() => user.value?.role)
const canManage = computed(() => role.value === 'admin_doctor')

function canChangeStatus(task: ClinicTask): boolean {
  if (task.status === 'done' || task.status === 'cancelled') return false
  if (canManage.value) return true
  const uid = user.value?.id
  return !!uid && task.assignees.some((a) => a.id === uid)
}

const scope = ref<Scope>('mine')
const statusFilter = ref<TaskStatus | ''>('')
const priorityFilter = ref<TaskPriority | ''>('')
const dueFilter = ref<'' | 'overdue' | 'today' | 'upcoming'>('')
const assigneeFilter = ref('')
const sort = ref<TaskSort>('due_date_asc')
const search = ref('')

const filterOpen = ref(false)
const sheetOpen = ref(false)
const sheetReadonly = ref(false)
const selected = ref<ClinicTask | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<ClinicTask | null>(null)
const deleting = ref(false)

const tasks = ref<ClinicTask[]>([])
const assignees = ref<ScheduleAssignee[]>([])
const assigneesLoading = ref(false)
const stats = ref<TaskStats>({ total: 0, pending: 0, inProgress: 0, done: 0, overdue: 0 })
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(false)
const busyId = ref<string | null>(null)

const page = ref(1)
const total = ref(0)
const limit = 20
const hasMore = computed(() => tasks.value.length < total.value)

const statusOptions: Array<{ value: TaskStatus | ''; label: string }> = [
  { value: '', label: 'همه' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'in_progress', label: 'در حال انجام' },
  { value: 'done', label: 'انجام‌شده' },
  { value: 'cancelled', label: 'لغو‌شده' },
]

const priorityFilterOptions: Array<{ value: TaskPriority | ''; label: string }> = [
  { value: '', label: 'همه' },
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'فوری' },
]

const dueOptions: Array<{ value: '' | 'overdue' | 'today' | 'upcoming'; label: string }> = [
  { value: '', label: 'همه' },
  { value: 'overdue', label: 'عقب‌افتاده' },
  { value: 'today', label: 'امروز' },
  { value: 'upcoming', label: 'پیش‌رو' },
]

const filtersActive = computed(() => activeFilterCount.value > 0)
const activeFilterCount = computed(() => {
  let n = 0
  if (statusFilter.value) n++
  if (priorityFilter.value) n++
  if (dueFilter.value) n++
  if (assigneeFilter.value) n++
  return n
})

const activeChips = computed(() => {
  const chips: Array<{ key: string; label: string; clear: () => void }> = []
  if (statusFilter.value) {
    const o = statusOptions.find((s) => s.value === statusFilter.value)
    chips.push({ key: 'status', label: `وضعیت: ${o?.label ?? ''}`, clear: () => { statusFilter.value = ''; reload() } })
  }
  if (priorityFilter.value) {
    const o = priorityFilterOptions.find((p) => p.value === priorityFilter.value)
    chips.push({ key: 'priority', label: `اولویت: ${o?.label ?? ''}`, clear: () => { priorityFilter.value = ''; reload() } })
  }
  if (dueFilter.value) {
    const o = dueOptions.find((d) => d.value === dueFilter.value)
    chips.push({ key: 'due', label: `مهلت: ${o?.label ?? ''}`, clear: () => { dueFilter.value = ''; reload() } })
  }
  if (assigneeFilter.value) {
    const o = assignees.value.find((a) => a.id === assigneeFilter.value)
    chips.push({ key: 'assignee', label: `مسئول: ${o?.fullName?.trim() || o?.phone || ''}`, clear: () => { assigneeFilter.value = ''; reload() } })
  }
  return chips
})

function buildFilters() {
  return {
    page: page.value,
    limit,
    assignedToMe: scope.value === 'mine' ? true : undefined,
    status: statusFilter.value || undefined,
    priority: priorityFilter.value || undefined,
    assigneeId: scope.value === 'all' ? assigneeFilter.value || undefined : undefined,
    due: dueFilter.value || undefined,
    q: search.value.trim() || undefined,
    sort: sort.value,
  }
}

async function load(reset = true) {
  if (reset) {
    page.value = 1
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = false
  try {
    const res = await listTasks(buildFilters())
    const data = res?.success && Array.isArray(res.data) ? res.data : []
    tasks.value = reset ? data : [...tasks.value, ...data]
    total.value = res?.pagination?.total ?? data.length
  } catch {
    if (reset) {
      error.value = true
      tasks.value = []
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function reload() {
  void load(true)
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  page.value++
  void load(false)
}

async function loadStats() {
  try {
    stats.value = await getStats()
  } catch {
    /* keep previous stats */
  }
}

async function loadAssignees(force = false) {
  if (assignees.value.length && !force) return
  assigneesLoading.value = true
  try {
    const res = await listAssignees()
    assignees.value = res?.success && Array.isArray(res.data) ? res.data : []
  } catch {
    assignees.value = []
    $toast.error('بارگذاری فهرست کاربران ناموفق بود')
  } finally {
    assigneesLoading.value = false
  }
}

function setScope(next: Scope) {
  if (scope.value === next) return
  scope.value = next
  reload()
}

function quickFilter(status: TaskStatus) {
  statusFilter.value = statusFilter.value === status ? '' : status
  dueFilter.value = ''
  reload()
}

function quickFilterOverdue() {
  dueFilter.value = dueFilter.value === 'overdue' ? '' : 'overdue'
  statusFilter.value = ''
  reload()
}

function applyFilters() {
  filterOpen.value = false
  reload()
}

function clearFilters() {
  statusFilter.value = ''
  priorityFilter.value = ''
  dueFilter.value = ''
  assigneeFilter.value = ''
  filterOpen.value = false
  reload()
}

function addTask() {
  selected.value = null
  sheetReadonly.value = false
  void loadAssignees()
  sheetOpen.value = true
}

function editTask(task: ClinicTask) {
  selected.value = task
  sheetReadonly.value = false
  void loadAssignees()
  sheetOpen.value = true
}

function openTask(task: ClinicTask) {
  selected.value = task
  sheetReadonly.value = !canManage.value
  if (canManage.value) void loadAssignees()
  sheetOpen.value = true
}

function askDelete(task: ClinicTask) {
  deleteTarget.value = task
  deleteOpen.value = true
}

async function confirmDelete() {
  const task = deleteTarget.value
  if (!task) return
  deleting.value = true
  try {
    const res = await deleteTask(task.id)
    if (res?.success) {
      $toast.success('وظیفه حذف شد')
      tasks.value = tasks.value.filter((t) => t.id !== task.id)
      total.value = Math.max(0, total.value - 1)
      deleteOpen.value = false
      void loadStats()
    }
  } catch {
    $toast.error('حذف وظیفه ناموفق بود')
  } finally {
    deleting.value = false
  }
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

function onSaved(task: ClinicTask) {
  const idx = tasks.value.findIndex((t) => t.id === task.id)
  if (idx >= 0) tasks.value[idx] = task
  else if (!statusFilter.value && !priorityFilter.value && !dueFilter.value && !search.value.trim()) {
    tasks.value = [task, ...tasks.value]
    total.value++
  }
  void loadStats()
}

/* Debounced search */
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => reload(), 350)
})

onMounted(async () => {
  await Promise.all([load(true), loadStats()])
  if (canManage.value) void loadAssignees()
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
  border: 1px solid transparent;
  font-family: inherit;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.sch-count--on { border-color: var(--app-border-strong); }
.sch-count__value { font-size: 18px; font-weight: 800; line-height: 1.1; }
.sch-count__label { font-size: 10.5px; color: var(--app-muted); }
.sch-count--amber .sch-count__value { color: var(--app-amber); }
.sch-count--indigo .sch-count__value { color: var(--app-indigo); }
.sch-count--green .sch-count__value { color: var(--app-income); }
.sch-count--rose .sch-count__value { color: var(--app-expense); }

.sch-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sch-tools__search { flex: 1 1 auto; }

.sch-tools__filter {
  position: relative;
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
}

.sch-tools__filter--on {
  border-color: var(--app-brand);
  color: var(--app-brand-deep);
}

.sch-tools__badge {
  position: absolute;
  inset-block-start: -6px;
  inset-inline-end: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--app-brand);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 18px;
}

.sch-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.sch-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: var(--app-surface-2);
  color: var(--app-text-2);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.task {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-inline-start: 3px solid transparent;
  cursor: pointer;
}
.task--overdue { border-inline-start-color: var(--app-expense); }
.task__head { display: flex; align-items: center; gap: 6px; }
.task__done {
  width: 32px; height: 32px;
  background: var(--app-green-soft);
  color: var(--app-income);
}
.task__del {
  width: 32px; height: 32px;
  color: var(--app-expense);
}
.task__head .app-iconbtn { width: 32px; height: 32px; }
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
.task__assignees { display: flex; align-items: center; }
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
.task__spin { animation: sch-spin 0.8s linear infinite; }

@keyframes sch-spin {
  to { transform: rotate(360deg); }
}

.sch-tools__add {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  background: var(--app-brand);
  border-color: var(--app-brand);
  color: #fff;
}
.sch-tools__add:active { transform: scale(0.94); }

.sch-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sch-filter {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sch-filter__label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--app-text-2);
}

.sch-filter__seg { width: 100%; }

.sch-foot-btn { width: auto; flex: 0 0 auto; }

.app-row__spacer { flex: 1; }

@media (max-width: 420px) {
  .sch-counts { grid-template-columns: repeat(2, 1fr); }
}
</style>
