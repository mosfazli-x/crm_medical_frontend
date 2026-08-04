<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('schedule.title')" :subtitle="$t('schedule.subtitle')" />

    <template v-if="isAdmin">
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
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="crm-card-title">{{ $t('schedule.taskDetails') }}</h3>
          </div>
        </template>
        <template #headerAction>
          <div class="flex items-center gap-2">
            <v-btn variant="flat" class="crm-btn crm-btn-accent" @click="openCreate">
              <v-icon start size="16">mdi-plus</v-icon>
              {{ $t('schedule.addTask') }}
            </v-btn>
          </div>
        </template>

        <div class="flex flex-wrap items-center gap-3 mb-4 px-2!">
          <v-text-field v-model="filters.q" variant="outlined" density="compact" hide-details
            :label="$t('schedule.searchPlaceholder')" clearable class="max-w-[240px]"
            prepend-inner-icon="mdi-magnify" />
          <v-select v-model="filters.status" :items="statusOptions" item-title="title" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.status')"
            class="max-w-[160px]" />
          <v-select v-model="filters.priority" :items="priorityOptions" item-title="title" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.priority')"
            class="max-w-[150px]" />
          <v-select v-model="filters.assigneeId" :items="assigneeFilterOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.assignee')"
            class="max-w-[200px]" />
          <v-select v-model="filters.due" :items="dueOptions" item-title="title" item-value="value" variant="outlined"
            density="compact" hide-details clearable :label="$t('schedule.dueDate')" class="max-w-[150px]" />
          <v-switch v-model="assignedToMe" hide-details :label="$t('schedule.myTasks')" color="#4F46E5"
            density="compact" class="mt-2" />
        </div>

        <div class="crm-table-wrap">
          <table class="crm-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.task') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.assignee') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.priority') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.dueDate') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.status') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.updated') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('schedule.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="task in pagedTasks" :key="task.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ task.title }}</div>
                  <div v-if="task.description"
                    class="text-xs text-slate-400 max-w-[280px] truncate mt-0.5">{{ task.description }}</div>
                </td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ task.assigneeName || '---' }}</span>
                  <div class="text-[11px] text-slate-400">
                    {{ roleLabel(task.assigneeRole) }}{{ task.assigneePosition ? ` — ${task.assigneePosition}` : '' }}
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
                <td class="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{{ formatJalaliDateShort(task.updatedAt) }}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">
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
      </UiContentCard>
    </template>

    <!-- Staff Self View -->
    <template v-else>
      <UiContentCard :title="$t('schedule.title')">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <v-select v-model="filters.status" :items="statusOptions" item-title="title" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.status')"
            class="max-w-[160px]" />
          <v-select v-model="filters.priority" :items="priorityOptions" item-title="title" item-value="value"
            variant="outlined" density="compact" hide-details clearable :label="$t('schedule.priority')"
            class="max-w-[150px]" />
        </div>

        <div class="crm-table-wrap">
          <table class="crm-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.task') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.createdBy') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.priority') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.dueDate') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('schedule.status') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="task in pagedTasks" :key="task.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ task.title }}</div>
                  <div v-if="task.description" class="text-xs text-slate-400 max-w-[280px] truncate mt-0.5">{{
                    task.description }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{{ task.createdByName || '---' }}</td>
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
                      <span v-bind="menuProps"
                        :class="['px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer inline-flex items-center gap-1', badgeClass(task.status)]">
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
              </tr>
            </tbody>
          </table>

          <div v-if="tasks.length === 0" class="text-center py-10">
            <v-icon size="40" class="text-slate-300 mb-2">mdi-clipboard-text-outline</v-icon>
            <p class="text-sm text-slate-400">{{ $t('schedule.noTasksDescription') }}</p>
          </div>
        </div>
      </UiContentCard>
    </template>

    <ScheduleTaskFormDialog v-model="formDialog" :task="editingTask" :assignees="assignees" @saved="onSaved" />
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
const { formatJalaliDateShort, todayJalali } = useFormatting()
const { t } = useI18n()

const isAdmin = computed(() => user?.value?.role === 'admin_doctor')

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
const roleLabel = (r: string | null | undefined) =>
  ({
    admin_doctor: t('users.roles.admin_doctor'),
    doctor: t('users.roles.doctor'),
    lab: t('users.roles.lab'),
    pharmacy: t('users.roles.pharmacy'),
    clinic_staff: t('users.roles.clinic_staff'),
  }[r || ''] || r || '---')

const isOverdue = (task: ClinicTask) =>
  !!task.dueDate && task.dueDate < today && task.status !== 'done' && task.status !== 'cancelled'

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

const openCreate = () => {
  editingTask.value = null
  formDialog.value = true
}

const openEdit = (task: ClinicTask) => {
  editingTask.value = task
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
