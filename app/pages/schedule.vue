<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('schedule.title')" :subtitle="$t('schedule.subtitle')">
      <template #actions>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            <button
              class="view-toggle-btn"
              :class="viewMode === 'board' ? 'view-toggle-active' : ''"
              @click="viewMode = 'board'">
              <v-icon size="15">mdi-view-column-outline</v-icon>
              <span>{{ t('schedule.board') }}</span>
            </button>
            <button
              class="view-toggle-btn"
              :class="viewMode === 'list' ? 'view-toggle-active' : ''"
              @click="viewMode = 'list'">
              <v-icon size="15">mdi-format-list-bulleted</v-icon>
              <span>{{ t('schedule.listView') }}</span>
            </button>
          </div>
          <v-btn v-if="isAdmin" variant="flat" class="crm-btn crm-btn-accent" @click="openCreate('pending')">
            <v-icon start size="16">mdi-plus</v-icon>
            {{ $t('schedule.addTask') }}
          </v-btn>
        </div>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <UiStatCard :label="$t('schedule.totalTasks')" :value="stats.total">
        <template #icon><v-icon size="24" color="#4F46E5">mdi-clipboard-text-outline</v-icon></template>
      </UiStatCard>
      <UiStatCard :label="$t('schedule.pendingTasks')" :value="stats.pending" valueClass="!text-amber-600">
        <template #icon><v-icon size="24" color="#D97706">mdi-clock-outline</v-icon></template>
      </UiStatCard>
      <UiStatCard :label="$t('schedule.inProgressTasks')" :value="stats.inProgress" valueClass="!text-blue-600">
        <template #icon><v-icon size="24" color="#2563EB">mdi-progress-clock</v-icon></template>
      </UiStatCard>
      <UiStatCard :label="$t('schedule.doneTasks')" :value="stats.done" valueClass="!text-emerald-600">
        <template #icon><v-icon size="24" color="#059669">mdi-check-circle-outline</v-icon></template>
      </UiStatCard>
      <UiStatCard :label="$t('schedule.overdueTasks')" :value="overdueCount" valueClass="!text-red-500">
        <template #icon><v-icon size="24" color="#EF4444">mdi-alert-circle-outline</v-icon></template>
      </UiStatCard>
    </div>

    <UiContentCard>
      <template #header>
        <h3 class="crm-card-title">{{ $t('schedule.taskDetails') }}</h3>
      </template>
      <template #headerAction>
        <div class="flex flex-wrap items-center gap-3">
          <v-text-field v-model="filters.q" variant="outlined" density="compact" hide-details
            :label="$t('schedule.searchPlaceholder')" clearable class="max-w-[220px]"
            prepend-inner-icon="mdi-magnify" />
          <v-select v-model="filters.status" :items="statusOptions" item-title="title" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.status')"
            class="max-w-[150px]" />
          <v-select v-model="filters.priority" :items="priorityOptions" item-title="title" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.priority')"
            class="max-w-[140px]" />
          <v-select v-if="isAdmin" v-model="filters.assigneeId" :items="assigneeFilterOptions" item-title="label"
            item-value="value" variant="outlined" density="compact" hide-details clearable
            :label="$t('schedule.assignee')" class="max-w-[190px]" />
          <v-select v-model="filters.due" :items="dueOptions" item-title="title" item-value="value" variant="outlined"
            density="compact" hide-details clearable :label="$t('schedule.dueDate')" class="max-w-[140px]" />
          <v-switch v-if="isAdmin" v-model="assignedToMe" hide-details :label="$t('schedule.myTasks')" color="#4F46E5"
            density="compact" class="mt-2" />
        </div>
      </template>

      <div class="px-2!">
        <p v-if="viewMode === 'board' && tasks.length > 0" class="text-xs text-slate-400 mb-3">
          <v-icon size="13" class="mr-1">mdi-cursor-move</v-icon>
          {{ t('schedule.boardHint') }}
        </p>

        <!-- Kanban Board -->
        <template v-if="viewMode === 'board'">
          <UiLoadingSpinner v-if="loading" :text="$t('schedule.fetchingTasks')" />
          <ScheduleKanbanBoard v-else :tasks="tasks" @move="changeStatus" @open="openDetail"
            @add="(s) => isAdmin && openCreate(s)" />
          <div v-if="!loading && tasks.length === 0" class="text-center py-12">
            <v-icon size="40" class="text-slate-300 mb-2">mdi-view-column-outline</v-icon>
            <p class="text-sm text-slate-400">
              {{ filtersActive ? $t('schedule.noTasksDescription') : $t('schedule.emptyDescription') }}
            </p>
          </div>
        </template>

        <!-- List view -->
        <template v-else>
          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.task') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.assignees') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.priority') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.dueDate') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.status') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.timeSpent') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.updated') }}</th>
                  <th v-if="isAdmin" class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('schedule.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="task in pagedTasks" :key="task.id" class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-4 py-3 cursor-pointer" @click="openDetail(task)">
                    <div class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ task.title }}</div>
                    <div v-if="task.description"
                      class="text-xs text-slate-400 max-w-[280px] truncate mt-0.5">{{ task.description }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1.5">
                      <template v-if="task.assignees.length">
                        <div v-for="a in task.assignees.slice(0, 3)" :key="a.id"
                          class="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                          :style="{ background: avatarColor(a.id) }" :title="assigneeLabel(a)">
                          {{ assigneeInitials(a) }}
                        </div>
                        <span v-if="task.assignees.length > 3" class="text-xs text-slate-400">
                          +{{ task.assignees.length - 3 }}
                        </span>
                      </template>
                      <span v-else class="text-xs text-slate-400">{{ $t('schedule.noAssignees') }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', priorityClass(task.priority)]">
                      {{ priorityLabel(task.priority) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    <span v-if="task.dueDate" :class="{ '!text-red-500 font-semibold': isOverdue(task) }">
                      {{ formatJalaliDateShort(task.dueDate) }}
                    </span>
                    <span v-else class="text-xs text-slate-400">{{ $t('schedule.noDueDate') }}</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <v-menu>
                      <template #activator="{ props: menuProps }">
                        <span v-bind="menuProps" :class="['px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer inline-flex items-center gap-1', badgeClass(task.status)]">
                          {{ statusLabel(task.status) }}
                          <v-icon size="12">mdi-chevron-down</v-icon>
                        </span>
                      </template>
                      <v-list density="compact" min-width="150">
                        <v-list-item v-for="opt in statusOptions" :key="opt.value" :value="opt.value"
                          :active="task.status === opt.value" @click="changeStatus(task, opt.value)">
                          <v-list-item-title class="text-sm">{{ opt.title }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1">
                      <v-icon size="14">mdi-timer-outline</v-icon>
                      {{ formatMinutes(task.spentMinutes) }}
                      <template v-if="task.estimatedMinutes">
                        <span class="text-slate-300 dark:text-slate-600">/</span>
                        <span class="text-slate-400">{{ formatMinutes(task.estimatedMinutes) }}</span>
                      </template>
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{{ formatJalaliDateShort(task.updatedAt) }}</td>
                  <td v-if="isAdmin" class="px-4 py-3 text-center whitespace-nowrap">
                    <v-tooltip :text="$t('schedule.editTask')" location="top">
                      <template #activator="{ props: tipProps }">
                        <v-btn v-bind="tipProps" icon variant="text" size="small" class="text-amber-500 hover:text-amber-600"
                          @click="openEdit(task)">
                          <v-icon size="18">mdi-pencil-outline</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip :text="$t('common.delete')" location="top">
                      <template #activator="{ props: tipProps }">
                        <v-btn v-bind="tipProps" icon variant="text" size="small" color="error"
                          @click="confirmDelete(task)">
                          <v-icon size="18">mdi-delete-outline</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="tasks.length === 0" class="text-center py-10">
              <v-icon size="40" class="text-slate-300 mb-2">mdi-clipboard-text-outline</v-icon>
              <p class="text-sm text-slate-400">{{ filtersActive ? $t('schedule.noTasksDescription') : $t('schedule.emptyDescription') }}</p>
            </div>
          </div>

          <div v-if="tasks.length > perPage" class="flex items-center justify-between mt-4 px-2!">
            <span class="text-xs text-slate-400">
              {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, tasks.length) }} / {{ tasks.length }}
            </span>
            <div class="flex items-center gap-2">
              <v-btn variant="tonal" size="small" class="crm-btn" :disabled="currentPage <= 1" @click="currentPage--">
                <v-icon start size="14">mdi-chevron-right</v-icon>
                {{ $t('prev') }}
              </v-btn>
              <v-btn variant="tonal" size="small" class="crm-btn" :disabled="currentPage >= totalPages"
                @click="currentPage++">
                {{ $t('next') }}
                <v-icon end size="14">mdi-chevron-left</v-icon>
              </v-btn>
            </div>
          </div>
        </template>
      </div>
    </UiContentCard>

    <ScheduleTaskFormDialog v-model="formDialog" :task="editingTask" :assignees="assignees"
      :readonly="dialogReadonly" :initial-status="createStatus" @saved="onSaved" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { TASK_STATUSES } from '~/types/schedule'
import type { ClinicTask, ScheduleAssignee, TaskFilters, TaskStatus } from '~/types/schedule'

const { user } = useAuth()
const { $toast } = useNuxtApp()
const { listTasks, listAssignees, deleteTask, changeStatus: apiChangeStatus } = useSchedule()
const { badgeClass, priorityClass, priorityLabel } = useStatusBadge()
const { formatJalaliDateShort, formatMinutes, todayJalali } = useFormatting()
const { t } = useI18n()

const isAdmin = computed(() => user?.value?.role === 'admin_doctor')

const viewMode = ref<'board' | 'list'>('board')
try {
  const saved = localStorage.getItem('schedule-view')
  if (saved === 'board' || saved === 'list') viewMode.value = saved
} catch { /* ignore */ }
watch(viewMode, (v) => {
  try { localStorage.setItem('schedule-view', v) } catch { /* ignore */ }
})

const perPage = 10
const currentPage = ref(1)
const tasks = ref<ClinicTask[]>([])
const assignees = ref<ScheduleAssignee[]>([])
const loading = ref(false)

const filters = reactive<TaskFilters>({
  limit: 100,
  status: '',
  priority: '',
  assigneeId: '',
  due: '',
  assignedToMe: false,
  q: '',
})
const assignedToMe = computed({
  get: () => !!filters.assignedToMe,
  set: (v: boolean) => {
    filters.assignedToMe = v
    fetchTasks()
  },
})

const formDialog = ref(false)
const editingTask = ref<ClinicTask | null>(null)
const dialogReadonly = ref(false)
const createStatus = ref<TaskStatus>('pending')

const statusOptions = computed(() =>
  TASK_STATUSES.map((s) => ({ title: t(`schedule.statuses.${s}`), value: s })),
)

const priorityOptions = computed(() => [
  { title: t('schedule.priorities.low'), value: 'low' },
  { title: t('schedule.priorities.medium'), value: 'medium' },
  { title: t('schedule.priorities.high'), value: 'high' },
])

const dueOptions = computed(() => [
  { title: t('schedule.dueOverdue'), value: 'overdue' },
  { title: t('schedule.dueToday'), value: 'today' },
  { title: t('schedule.dueUpcoming'), value: 'upcoming' },
])

const assigneeFilterOptions = computed(() =>
  assignees.value.map((a) => ({ label: [a.fullName, a.position].filter(Boolean).join(' — '), value: a.id })),
)

const filtersActive = computed(() =>
  !!(filters.status || filters.priority || filters.assigneeId || filters.due || filters.assignedToMe || filters.q),
)

const stats = computed(() => ({
  total: tasks.value.length,
  pending: tasks.value.filter((x) => x.status === 'pending').length,
  inProgress: tasks.value.filter((x) => x.status === 'in_progress').length,
  done: tasks.value.filter((x) => x.status === 'done').length,
}))

const today = todayJalali()
const overdueCount = computed(() =>
  tasks.value.filter((x) => x.dueDate && x.dueDate < today && x.status !== 'done' && x.status !== 'cancelled').length,
)

const totalPages = computed(() => Math.max(1, Math.ceil(tasks.value.length / perPage)))
const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return tasks.value.slice(start, start + perPage)
})

const statusLabel = (s: string) => t(`schedule.statuses.${s}`) || s

const isOverdue = (task: ClinicTask) =>
  !!task.dueDate && task.dueDate < today && task.status !== 'done' && task.status !== 'cancelled'

const avatarColor = (id: string) => {
  const palette = ['#6366F1', '#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#F43F5E']
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

const assigneeInitials = (a: { fullName: string | null; phone: string }) => {
  const name = (a.fullName || '').trim()
  if (!name) return (a.phone || '').slice(-2)
  const parts = name.split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

const assigneeLabel = (a: { fullName: string | null; position: string | null }) =>
  [a.fullName, a.position].filter(Boolean).join(' — ')

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await listTasks({ ...filters })
    if (res.success) {
      tasks.value = res.data || []
      currentPage.value = 1
    }
  } catch {
    $toast.error(t('schedule.fetchError'))
  } finally {
    loading.value = false
  }
}

const fetchAssignees = async () => {
  try {
    const res = await listAssignees()
    if (res.success) assignees.value = res.data || []
  } catch { /* ignore */ }
}

const changeStatus = async (task: ClinicTask, status: TaskStatus) => {
  if (task.status === status) return
  try {
    const res = await apiChangeStatus(task.id, status)
    if (res.success) {
      $toast.success(t('schedule.statusUpdateSuccess'))
      await fetchTasks()
    }
  } catch {
    $toast.error(t('schedule.statusUpdateError'))
  }
}

const confirmDelete = async (task: ClinicTask) => {
  if (!confirm(t('schedule.confirmDelete'))) return
  try {
    const res = await deleteTask(task.id)
    if (res.success) {
      $toast.success(t('schedule.deleteSuccess'))
      await fetchTasks()
    }
  } catch {
    $toast.error(t('schedule.deleteError'))
  }
}

const openCreate = (status: TaskStatus = 'pending') => {
  editingTask.value = null
  dialogReadonly.value = false
  createStatus.value = status
  formDialog.value = true
}

const openEdit = (task: ClinicTask) => {
  editingTask.value = task
  dialogReadonly.value = false
  createStatus.value = 'pending'
  formDialog.value = true
}

const openDetail = (task: ClinicTask) => {
  if (isAdmin.value) {
    openEdit(task)
    return
  }
  editingTask.value = task
  dialogReadonly.value = true
  createStatus.value = 'pending'
  formDialog.value = true
}

const onSaved = () => {
  fetchTasks()
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(() => filters.q, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchTasks(), 400)
})

watch(() => [filters.status, filters.priority, filters.assigneeId, filters.due], () => {
  fetchTasks()
})

onMounted(() => {
  if (isAdmin.value) fetchAssignees()
  fetchTasks()
})

useSeoMeta({ title: t('schedule.titleSeo') })
</script>

<style scoped>
.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(100 116 139);
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}
.dark .view-toggle-btn {
  color: rgb(148 163 184);
}
.view-toggle-active {
  background: #fff;
  color: #4f46e5;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}
.dark .view-toggle-active {
  background: rgb(51 65 85);
  color: rgb(129 140 248);
}
</style>
