<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('schedule.title') }}</h1>
        <p class="dash-head__date">{{ t('schedule.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <div class="pf-seg" role="group" :aria-label="t('schedule.viewMode')">
          <button
            v-for="seg in viewSegments"
            :key="seg.value"
            type="button"
            class="pf-seg__btn"
            :class="{ 'pf-seg__btn--on': view === seg.value }"
            :aria-pressed="view === seg.value"
            @click="setView(seg.value)"
          >
            <v-icon size="14">{{ seg.icon }}</v-icon>
            <span>{{ seg.label }}</span>
          </button>
        </div>
        <button
          class="asa-btn asa-btn--ghost"
          :disabled="loading"
          :aria-label="t('schedule.refresh')"
          :title="t('schedule.refresh')"
          @click="refreshAll"
        >
          <v-icon size="16" :class="{ 'pf-spin': loading }">mdi-refresh</v-icon>
        </button>
        <button v-if="isAdmin" class="asa-btn asa-btn--primary" @click="openCreate('pending')">
          <Plus class="w-4! h-4! stroke-current" />
          <span>{{ t('schedule.addTask') }}</span>
        </button>
      </div>
    </header>

    <!-- ─── Summary metrics ─── -->
    <div class="sch-metrics">
      <template v-if="!stats">
        <div v-for="i in 5" :key="`sk-m-${i}`" class="asa-skel rounded-[22px]! h-[74px]!" />
      </template>
      <div v-for="m in metricCards" v-else :key="m.key" class="asa-card pf-metric">
        <div class="asa-tint" :class="m.tint">
          <component :is="m.icon" class="w-5! h-5! fill-current" />
        </div>
        <div class="pf-metric__copy">
          <p class="pf-metric__value" :class="m.valueClass">{{ pn(m.value) }}</p>
          <p class="pf-metric__label">{{ m.label }}</p>
        </div>
      </div>
    </div>

    <!-- ─── Tasks card ─── -->
    <div class="asa-card pf-table-card mt-5!">
      <!-- Toolbar: search + status segments + filters -->
      <div class="pf-toolbar">
        <div class="pf-toolbar__search">
          <span class="pf-toolbar__search-ic">
            <Magnify class="w-4! h-4! stroke-current" />
          </span>
          <input
            v-model="query"
            type="search"
            class="pf-toolbar__input"
            :placeholder="t('schedule.searchPlaceholder')"
            :aria-label="t('schedule.searchPlaceholder')"
          >
          <button
            v-if="query"
            class="pf-toolbar__clear"
            type="button"
            :aria-label="t('common.clear')"
            @click="query = ''"
          >
            <v-icon size="15">mdi-close</v-icon>
          </button>
        </div>

        <div class="pf-seg" role="group" :aria-label="t('schedule.status')">
          <button
            v-for="seg in statusSegments"
            :key="seg.value"
            type="button"
            class="pf-seg__btn"
            :class="{ 'pf-seg__btn--on': status === seg.value }"
            :aria-pressed="status === seg.value"
            @click="status = seg.value"
          >
            <span>{{ seg.label }}</span>
          </button>
        </div>

        <div class="pf-toolbar__tail">
          <button
            v-if="isAdmin"
            class="asa-pill sch-mine"
            :class="assignedToMe ? 'asa-pill--teal' : 'pf-pill--neutral'"
            type="button"
            :aria-pressed="assignedToMe"
            @click="assignedToMe = !assignedToMe"
          >
            <v-icon size="12">mdi-account-check-outline</v-icon>
            {{ t('schedule.myTasks') }}
          </button>

          <v-select
            v-model="priority"
            class="asa-select sch-select"
            :items="priorityOptions"
            item-title="title"
            item-value="value"
            variant="solo"
            density="compact"
            hide-details
            clearable
            :placeholder="t('schedule.filterAllPriority')"
            :aria-label="t('schedule.priority')"
            prepend-inner-icon="mdi-flag-outline"
          />

          <v-select
            v-if="isAdmin"
            v-model="assigneeId"
            class="asa-select sch-select"
            :items="assigneeFilterOptions"
            item-title="label"
            item-value="value"
            variant="solo"
            density="compact"
            hide-details
            clearable
            :placeholder="t('schedule.filterAllAssignee')"
            :aria-label="t('schedule.assignee')"
            prepend-inner-icon="mdi-account-outline"
          />

          <v-select
            v-model="due"
            class="asa-select sch-select"
            :items="dueOptions"
            item-title="title"
            item-value="value"
            variant="solo"
            density="compact"
            hide-details
            clearable
            :placeholder="t('schedule.filterAllDue')"
            :aria-label="t('schedule.dueDate')"
            prepend-inner-icon="mdi-calendar-clock"
          />

          <v-select
            v-model="sort"
            class="asa-select sch-select"
            :items="sortOptions"
            item-title="title"
            item-value="value"
            variant="solo"
            density="compact"
            hide-details
            :placeholder="t('schedule.sort')"
            :aria-label="t('schedule.sort')"
            prepend-inner-icon="mdi-sort"
          />

          <button
            v-if="filtersActive"
            class="pf-toolbar__clear sch-clear"
            type="button"
            :aria-label="t('schedule.clearFilters')"
            :title="t('schedule.clearFilters')"
            @click="resetFilters"
          >
            <v-icon size="15">mdi-filter-remove-outline</v-icon>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading">
        <div class="pf-skel">
          <div v-for="i in 6" :key="`sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-40! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
            <div class="asa-skel h-4! w-20! rounded-md!" />
          </div>
        </div>
      </div>

      <!-- Load error -->
      <div v-else-if="error" class="pf-empty">
        <div class="asa-tint asa-tint--rose pf-tint-lg">
          <v-icon size="26">mdi-cloud-alert-outline</v-icon>
        </div>
        <div>
          <p class="pf-empty__title">{{ t('schedule.loadErrorTitle') }}</p>
          <p class="pf-empty__desc">{{ t('schedule.fetchError') }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="fetchTasks">
            <v-icon size="15">mdi-refresh</v-icon>
            <span>{{ t('common.retry') }}</span>
          </button>
        </div>
      </div>

      <!-- Nothing at all yet -->
      <div v-else-if="!totalCount" class="pf-empty">
        <div class="asa-tint asa-tint--teal pf-tint-lg">
          <ClipboardCheck class="w-6! h-6! fill-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ t('schedule.noTasks') }}</p>
          <p class="pf-empty__desc">{{ t('schedule.emptyDescription') }}</p>
        </div>
        <div v-if="isAdmin" class="pf-empty__actions">
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openCreate('pending')">
            <Plus class="w-4! h-4! stroke-current" />
            <span>{{ t('schedule.addTask') }}</span>
          </button>
        </div>
      </div>

      <!-- Filters exclude everything -->
      <div v-else-if="!tasks.length" class="pf-empty">
        <div class="asa-tint asa-tint--indigo pf-tint-lg">
          <Magnify class="w-6! h-6! stroke-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ t('schedule.noTasks') }}</p>
          <p class="pf-empty__desc">{{ t('schedule.noTasksDescription') }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="resetFilters">
            <v-icon size="15">mdi-filter-remove-outline</v-icon>
            <span>{{ t('schedule.clearFilters') }}</span>
          </button>
        </div>
      </div>

      <!-- ─── Board view ─── -->
      <template v-else-if="view === 'board'">
        <p v-if="canMove" class="sch-hint">
          <v-icon size="13">mdi-cursor-move</v-icon>
          {{ t('schedule.boardHint') }}
        </p>
        <ScheduleKanbanBoard
          :tasks="tasks"
          :can-add="isAdmin"
          :can-move="canMove"
          @move="changeStatus"
          @open="openDetail"
          @add="openCreate"
        />
      </template>

      <!-- ─── List view: desktop table ─── -->
      <template v-else>
        <div class="sch-table-wrap asa-table-wrap">
          <table class="pf-table">
            <thead>
              <tr>
                <th class="pf-pl0">{{ t('schedule.task') }}</th>
                <th>{{ t('schedule.assignees') }}</th>
                <th>{{ t('schedule.priority') }}</th>
                <th>{{ t('schedule.dueDate') }}</th>
                <th>{{ t('schedule.status') }}</th>
                <th>{{ t('schedule.timeSpent') }}</th>
                <th>{{ t('schedule.updated') }}</th>
                <th class="pf-ta-end">{{ t('schedule.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tasks" :key="task.id">
                <td class="pf-pl0">
                  <button type="button" class="sch-cell" @click="openDetail(task)">
                    <span class="sch-cell__name">{{ task.title }}</span>
                    <span v-if="task.description" class="sch-cell__sub">{{ task.description }}</span>
                  </button>
                </td>
                <td>
                  <div v-if="task.assignees.length" class="sch-avatars">
                    <span
                      v-for="a in task.assignees.slice(0, 3)"
                      :key="a.id"
                      class="sch-avatar"
                      :style="{ background: avatarColor(a.id) }"
                      :title="assigneeLabel(a)"
                    >{{ assigneeInitials(a) }}</span>
                    <span v-if="task.assignees.length > 3" class="pf-tiny">+{{ task.assignees.length - 3 }}</span>
                  </div>
                  <span v-else class="pf-tiny">{{ t('schedule.noAssignees') }}</span>
                </td>
                <td>
                  <span class="asa-pill" :class="priorityPill(task.priority)">
                    {{ priorityLabel(task.priority) }}
                  </span>
                </td>
                <td>
                  <span v-if="task.dueDate" class="pf-dt" :class="{ 'sch-due--over': isOverdue(task) }">
                    {{ formatJalaliDateShort(task.dueDate) }}
                  </span>
                  <span v-else class="pf-tiny">{{ t('schedule.noDueDate') }}</span>
                </td>
                <td>
                  <v-menu location="bottom start">
                    <template #activator="{ props: menuProps }">
                      <button
                        v-bind="menuProps"
                        type="button"
                        class="asa-pill sch-status"
                        :class="statusPill(task.status)"
                        :aria-label="t('schedule.changeStatus')"
                      >
                        {{ statusLabel(task.status) }}
                        <v-icon size="11">mdi-chevron-down</v-icon>
                      </button>
                    </template>
                    <v-list density="compact" min-width="160">
                      <v-list-item
                        v-for="opt in statusOptions"
                        :key="opt.value"
                        :active="task.status === opt.value"
                        @click="changeStatus(task, opt.value)"
                      >
                        <v-list-item-title class="text-sm">{{ opt.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td class="sch-time">
                  <v-icon size="13">mdi-timer-outline</v-icon>
                  {{ timeRange(task) }}
                </td>
                <td class="pf-dt">{{ formatJalaliDateShort(task.updatedAt) }}</td>
                <td class="pf-ta-end">
                  <div class="sch-actions">
                    <button
                      class="pf-icon-btn"
                      type="button"
                      :title="isAdmin ? t('schedule.editTask') : t('schedule.taskDetails')"
                      :aria-label="isAdmin ? t('schedule.editTask') : t('schedule.taskDetails')"
                      @click="openDetail(task)"
                    >
                      <Eye class="w-4! h-4! stroke-current" />
                    </button>
                    <template v-if="isAdmin">
                      <button
                        class="pf-icon-btn"
                        type="button"
                        :title="t('schedule.editTask')"
                        :aria-label="t('schedule.editTask')"
                        @click="openEdit(task)"
                      >
                        <Pencil class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        class="pf-icon-btn pf-icon-btn--danger"
                        type="button"
                        :title="t('common.delete')"
                        :aria-label="t('common.delete')"
                        @click="askDelete(task)"
                      >
                        <Trash2 class="w-4! h-4! stroke-current" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ─── List view: mobile roster ─── -->
        <div class="pf-roster sch-roster">
          <div v-for="task in tasks" :key="task.id" class="pf-roster__item">
            <div class="pf-roster__body">
              <div class="pf-roster__top">
                <span class="pf-roster__name">{{ task.title }}</span>
                <span class="asa-pill" :class="statusPill(task.status)">
                  {{ statusLabel(task.status) }}
                </span>
              </div>
              <div class="pf-roster__meta">
                <span>
                  <v-icon size="13">mdi-flag-outline</v-icon>
                  {{ priorityLabel(task.priority) }}
                </span>
                <span v-if="task.dueDate" :class="{ 'sch-due--over': isOverdue(task) }">
                  <v-icon size="13">mdi-calendar-clock</v-icon>
                  {{ formatJalaliDateShort(task.dueDate) }}
                </span>
                <span>
                  <v-icon size="13">mdi-timer-outline</v-icon>
                  {{ timeRange(task) }}
                </span>
              </div>
              <div v-if="task.assignees.length" class="sch-avatars sch-avatars--mt">
                <span
                  v-for="a in task.assignees.slice(0, 4)"
                  :key="a.id"
                  class="sch-avatar"
                  :style="{ background: avatarColor(a.id) }"
                  :title="assigneeLabel(a)"
                >{{ assigneeInitials(a) }}</span>
              </div>
            </div>
            <div class="pf-roster__actions">
              <button
                class="pf-icon-btn"
                type="button"
                :title="isAdmin ? t('schedule.editTask') : t('schedule.taskDetails')"
                :aria-label="isAdmin ? t('schedule.editTask') : t('schedule.taskDetails')"
                @click="openDetail(task)"
              >
                <Eye class="w-4! h-4! stroke-current" />
              </button>
              <template v-if="isAdmin">
                <button
                  class="pf-icon-btn"
                  type="button"
                  :title="t('schedule.editTask')"
                  :aria-label="t('schedule.editTask')"
                  @click="openEdit(task)"
                >
                  <Pencil class="w-4! h-4! stroke-current" />
                </button>
                <button
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :title="t('common.delete')"
                  :aria-label="t('common.delete')"
                  @click="askDelete(task)"
                >
                  <Trash2 class="w-4! h-4! stroke-current" />
                </button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="totalCount" class="pf-card-foot">
          <p class="pf-card-foot__info">
            {{ t('schedule.pageInfo', { page: currentPage, totalPages, total: totalCount }) }}
          </p>
          <v-pagination
            v-if="totalPages > 1"
            v-model="currentPage"
            :length="totalPages"
            :total-visible="5"
            density="comfortable"
            color="#00ADB5"
            rounded="circle"
            :disabled="loading"
          />
        </div>
      </template>
    </div>

    <!-- ─── Create / edit / view dialog ─── -->
    <ScheduleTaskFormDialog
      v-model="formDialog"
      :task="editingTask"
      :assignees="assignees"
      :readonly="dialogReadonly"
      :initial-status="createStatus"
      @saved="onSaved"
    />

    <!-- ─── Delete confirmation ─── -->
    <UiConfirmDialog
      v-model="deleteOpen"
      variant="danger"
      :title="t('schedule.deleteTitle')"
      :message="t('schedule.deleteBody', { title: deleteTarget?.title ?? '' })"
      :confirm-label="t('schedule.deleteAction')"
      :cancel-label="t('schedule.form.cancel')"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Plus from '~/components/icons/Plus.vue'
import Magnify from '~/components/icons/Magnify.vue'
import Pencil from '~/components/icons/Pencil.vue'
import Trash2 from '~/components/icons/Trash2.vue'
import Eye from '~/components/icons/Eye.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import Clock from '~/components/icons/Clock.vue'
import Activity from '~/components/icons/Activity.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import CalendarOff from '~/components/icons/CalendarOff.vue'
import type {
  ClinicTask,
  ScheduleAssignee,
  TaskFilters,
  TaskPriority,
  TaskSort,
  TaskStats,
  TaskStatus,
} from '~/types/schedule'

type ViewMode = 'board' | 'list'
type DueFilter = NonNullable<TaskFilters['due']>

const { t } = useI18n()
const { pn } = useLang()
const { user } = useAuth()
const { $toast } = useNuxtApp()
const { listTasks, listAssignees, deleteTask, changeStatus: apiChangeStatus, getStats } = useSchedule()
const {
  priorityOptions,
  sortOptions,
  statusOptions,
  statusLabel,
  statusPill,
  priorityLabel,
  priorityPill,
  assigneeLabel,
  assigneeInitials,
  avatarColor,
  isOverdue,
  formatJalaliDateShort,
  timeRange,
} = useTaskPresentation()

const isAdmin = computed(() => user?.value?.role === 'admin_doctor')
const canMove = computed(() => !!user?.value)

const PER_PAGE = 20

/* ── Data ─────────────────────────────────────────────── */
const tasks = ref<ClinicTask[]>([])
const assignees = ref<ScheduleAssignee[]>([])
const stats = ref<TaskStats | null>(null)
const totalCount = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const loading = ref(false)
const error = ref(false)

/* ── View mode (persisted) ────────────────────────────── */
const view = ref<ViewMode>('board')
const VIEW_KEY = 'schedule-view'

onMounted(() => {
  try {
    const saved = localStorage.getItem(VIEW_KEY)
    if (saved === 'board' || saved === 'list') view.value = saved
  } catch { /* storage unavailable */ }
})

function setView(next: ViewMode) {
  view.value = next
  try {
    localStorage.setItem(VIEW_KEY, next)
  } catch { /* storage unavailable */ }
}

const viewSegments = computed(() => [
  { value: 'board' as ViewMode, icon: 'mdi-view-column-outline', label: t('schedule.board') },
  { value: 'list' as ViewMode, icon: 'mdi-format-list-bulleted', label: t('schedule.listView') },
])

/* ── Filters ──────────────────────────────────────────── */
const query = ref('')
const status = ref<TaskStatus | ''>('')
const priority = ref<TaskPriority | ''>('')
const assigneeId = ref<string>('')
const due = ref<DueFilter | ''>('')
const assignedToMe = ref(false)
const sort = ref<TaskSort>('created_at_desc')

const dueOptions = computed(() => [
  { title: t('schedule.dueOverdue'), value: 'overdue' },
  { title: t('schedule.dueToday'), value: 'today' },
  { title: t('schedule.dueUpcoming'), value: 'upcoming' },
])

const assigneeFilterOptions = computed(() =>
  assignees.value.map((a) => ({ label: [a.fullName, a.position].filter(Boolean).join(' — '), value: a.id })),
)

const statusSegments = computed(() => [
  { value: '' as TaskStatus | '', label: t('schedule.allTasks') },
  ...statusOptions.value,
])

const filtersActive = computed(
  () => !!(status.value || priority.value || assigneeId.value || due.value || assignedToMe.value || query.value.trim()),
)

/* ── Metric cards ─────────────────────────────────────── */
const metricCards = computed(() => {
  if (!stats.value) return []
  return [
    { key: 'total', value: stats.value.total, label: t('schedule.totalTasks'), tint: 'asa-tint--teal', icon: ClipboardCheck, valueClass: '' },
    { key: 'pending', value: stats.value.pending, label: t('schedule.pendingTasks'), tint: 'asa-tint--amber', icon: Clock, valueClass: '' },
    { key: 'inProgress', value: stats.value.inProgress, label: t('schedule.inProgressTasks'), tint: 'asa-tint--indigo', icon: Activity, valueClass: '' },
    { key: 'done', value: stats.value.done, label: t('schedule.doneTasks'), tint: 'asa-tint--green', icon: CheckCircle, valueClass: 'asa-green' },
    { key: 'overdue', value: stats.value.overdue, label: t('schedule.overdueTasks'), tint: 'asa-tint--rose', icon: CalendarOff, valueClass: '' },
  ]
})

/* ── Fetching ─────────────────────────────────────────── */
const buildFilters = (): TaskFilters => ({
  q: query.value.trim(),
  status: status.value,
  priority: priority.value,
  assigneeId: assigneeId.value,
  due: due.value,
  assignedToMe: assignedToMe.value,
  sort: sort.value,
  limit: PER_PAGE,
  page: currentPage.value,
})

async function fetchTasks() {
  loading.value = true
  error.value = false
  try {
    const res = await listTasks(buildFilters())
    tasks.value = res.data || []
    totalCount.value = res.pagination?.total ?? 0
    totalPages.value = Math.max(1, res.pagination?.totalPages ?? 1)
  } catch {
    tasks.value = []
    totalCount.value = 0
    totalPages.value = 1
    error.value = true
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await getStats()
  } catch {
    stats.value = null
  }
}

async function fetchAssignees() {
  try {
    const res = await listAssignees()
    assignees.value = res.data || []
  } catch { /* assignees are optional chrome */ }
}

function refreshAll() {
  currentPage.value = 1
  fetchTasks()
  fetchStats()
}

function refetchFromFirstPage() {
  currentPage.value = 1
  fetchTasks()
  fetchStats()
}

/* Debounced search */
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (!resettingFilters.value) refetchFromFirstPage()
  }, 400)
})

/* Suppress the per-field watcher while resetFilters assigns every field at once. */
const resettingFilters = ref(false)

watch([status, priority, assigneeId, due, assignedToMe, sort], () => {
  if (!resettingFilters.value) refetchFromFirstPage()
})
watch(currentPage, fetchTasks)

async function resetFilters() {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  resettingFilters.value = true
  query.value = ''
  status.value = ''
  priority.value = ''
  assigneeId.value = ''
  due.value = ''
  assignedToMe.value = false
  await nextTick()
  resettingFilters.value = false
  refetchFromFirstPage()
}

/* ── Mutations ────────────────────────────────────────── */
async function changeStatus(task: ClinicTask, next: TaskStatus) {
  if (task.status === next) return
  const previous = task.status
  task.status = next
  try {
    const res = await apiChangeStatus(task.id, next)
    if (res.success && res.data) Object.assign(task, res.data)
    else task.status = previous
    $toast.success(t('schedule.statusUpdateSuccess'))
    fetchStats()
  } catch {
    task.status = previous
    $toast.error(t('schedule.statusUpdateError'))
  }
}

const formDialog = ref(false)
const editingTask = ref<ClinicTask | null>(null)
const dialogReadonly = ref(false)
const createStatus = ref<TaskStatus>('pending')

function openCreate(next: TaskStatus = 'pending') {
  editingTask.value = null
  dialogReadonly.value = false
  createStatus.value = next
  formDialog.value = true
}

function openEdit(task: ClinicTask) {
  editingTask.value = task
  dialogReadonly.value = false
  createStatus.value = 'pending'
  formDialog.value = true
}

function openDetail(task: ClinicTask) {
  if (isAdmin.value) {
    openEdit(task)
    return
  }
  editingTask.value = task
  dialogReadonly.value = true
  createStatus.value = 'pending'
  formDialog.value = true
}

function onSaved() {
  refetchFromFirstPage()
}

const deleteOpen = ref(false)
const deleteTarget = ref<ClinicTask | null>(null)
const deleting = ref(false)

function askDelete(task: ClinicTask) {
  deleteTarget.value = task
  deleteOpen.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target || deleting.value) return
  deleting.value = true
  try {
    const res = await deleteTask(target.id)
    if (res.success) {
      $toast.success(t('schedule.deleteSuccess'))
      deleteOpen.value = false
      deleteTarget.value = null
      refetchFromFirstPage()
    } else {
      $toast.error(t('schedule.deleteError'))
    }
  } catch {
    $toast.error(t('schedule.deleteError'))
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (isAdmin.value) fetchAssignees()
  fetchTasks()
  fetchStats()
})

useSeoMeta({ title: t('schedule.titleSeo') })
</script>

<style scoped>
/* ── Metrics ─────────────────────────────────────────── */
.sch-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .sch-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .sch-metrics {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 400px) {
  .sch-metrics {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* ── Toolbar ─────────────────────────────────────────── */
.sch-mine {
  border: 1px solid var(--asa-sep);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.sch-mine:hover {
  background: color-mix(in srgb, var(--asa-accent) 10%, transparent);
}

.sch-select {
  flex: 0 1 12rem;
  min-width: 8.5rem;
  max-width: 12rem;
}

@media (max-width: 720px) {
  .sch-select {
    flex: 1 1 8.5rem;
    max-width: none;
  }
}

.sch-clear {
  flex-shrink: 0;
}

.sch-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

/* ── Table cell ──────────────────────────────────────── */
.sch-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  width: 100%;
  text-align: start;
  cursor: pointer;
}

.sch-cell__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  transition: color 150ms var(--ease-default);
}

.sch-cell:hover .sch-cell__name {
  color: var(--asa-accent-deep);
}

.dark .sch-cell:hover .sch-cell__name {
  color: var(--asa-accent);
}

.sch-cell__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  max-width: 22rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sch-status {
  border: 0;
  cursor: pointer;
  font: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
}

.sch-due--over {
  color: var(--asa-rose);
  font-weight: 600;
}

.sch-time {
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  white-space: nowrap;
}

.sch-avatars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sch-avatars--mt {
  margin-top: 0.5rem;
}

.sch-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  color: #fff;
}

.sch-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}

/* Desktop table / mobile roster are mutually exclusive. */
.sch-roster {
  display: none;
}

@media (max-width: 899px) {
  .sch-table-wrap {
    display: none;
  }

  .sch-roster {
    display: flex;
  }
}
</style>
