<template>
  <div class="flex gap-4 overflow-x-auto pb-4 board-scroll">
    <div v-for="col in columns" :key="col.status"
      class="flex-1 min-w-[280px] max-w-[340px] shrink-0 rounded-2xl border transition-colors schedule-column"
      :class="dragOverCol === col.status ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10' : 'border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/30'"
      @dragover.prevent @dragenter="onDragEnter(col.status)" @dragleave="onDragLeave(col.status)"
      @drop.prevent="onDrop(col.status)">
      <div class="flex items-center justify-between px-3 py-2.5! border-b border-slate-200/70 dark:border-slate-700/50">
        <div class="flex items-center gap-2">
          <span class="w-2.5! h-2.5! rounded-full" :style="{ background: col.color }"></span>
          <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ col.label }}</span>
          <span class="text-[11px] font-semibold rounded-full px-1.5! py-0.5! bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            {{ tasksInCol(col.status).length }}
          </span>
        </div>
        <button class="schedule-add-btn" :title="t('schedule.addTask')" @click="emit('add', col.status)">
          <v-icon size="16">mdi-plus</v-icon>
        </button>
      </div>

      <div class="p-2.5! space-y-2.5 min-h-[120px]">
        <ScheduleTaskCard v-for="task in tasksInCol(col.status)" :key="task.id" :task="task"
          @open="emit('open', $event)" @drag-start="onDragStart" />

        <div v-if="tasksInCol(col.status).length === 0" class="border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl py-6 text-center text-xs text-slate-400">
          {{ t('schedule.dropHere') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TASK_STATUSES } from '~/types/schedule'
import type { ClinicTask, TaskStatus } from '~/types/schedule'

const props = defineProps<{
  tasks: ClinicTask[]
}>()

const emit = defineEmits<{
  (e: 'move', task: ClinicTask, status: TaskStatus): void
  (e: 'open', task: ClinicTask): void
  (e: 'add', status: TaskStatus): void
}>()

const { t } = useI18n()

const COLUMN_META: Record<string, { color: string }> = {
  pending: { color: '#D97706' },
  in_progress: { color: '#2563EB' },
  done: { color: '#059669' },
  cancelled: { color: '#94A3B8' },
}

const columns = computed(() =>
  TASK_STATUSES.map((s) => ({ status: s, label: t(`schedule.statuses.${s}`), color: COLUMN_META[s].color })),
)

const dragTaskId = ref<string | null>(null)
const dragOverCol = ref<string | null>(null)

const tasksInCol = (status: string) => props.tasks.filter((t) => t.status === status)

const onDragStart = (id: string, e: DragEvent) => {
  dragTaskId.value = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

const onDragEnter = (status: string) => {
  if (dragTaskId.value) dragOverCol.value = status
}
const onDragLeave = (status: string) => {
  if (dragOverCol.value === status) dragOverCol.value = null
}

const onDrop = (status: string) => {
  const taskId = dragTaskId.value
  dragTaskId.value = null
  dragOverCol.value = null
  if (!taskId) return
  const task = props.tasks.find((t) => t.id === taskId)
  if (task && task.status !== status) emit('move', task, status as TaskStatus)
}
</script>

<style scoped>
.board-scroll::-webkit-scrollbar {
  height: 8px;
}
.board-scroll::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgb(148 163 184 / 0.35);
}
.schedule-add-btn {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(148 163 184);
  transition: background 0.15s ease, color 0.15s ease;
}
.schedule-add-btn:hover {
  color: #fff;
  background: #6366f1;
}
</style>
