<template>
  <div class="schedule-card" draggable="true" @click="emit('open', task)" @dragstart="onDragStart">
    <div class="flex items-start justify-between gap-2 mb-2">
      <span :class="['px-2 py-0.5 rounded-full text-[11px] font-semibold', priorityClass(task.priority)]">
        {{ priorityLabel(task.priority) }}
      </span>
      <span v-if="task.dueDate" :class="['text-[11px] font-medium inline-flex items-center gap-1 rounded-full px-2 py-0.5', isOverdue(task) ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400']">
        <v-icon size="12">mdi-calendar-clock</v-icon>
        {{ formatJalaliDateShort(task.dueDate) }}
      </span>
    </div>

    <div class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-1">{{ task.title }}</div>
    <p v-if="task.description" class="text-xs text-slate-400 line-clamp-1 mb-2">{{ task.description }}</p>

    <div class="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
      <div class="flex items-center -space-x-1.5">
        <template v-if="task.assignees.length">
          <div v-for="a in task.assignees.slice(0, 3)" :key="a.id" :title="assigneeLabel(a)"
            class="schedule-avatar" :style="{ background: avatarColor(a.id) }">
            {{ assigneeInitials(a) }}
          </div>
          <span v-if="task.assignees.length > 3" class="text-[10px] text-slate-400 mr-1">
            +{{ task.assignees.length - 3 }}
          </span>
        </template>
        <span v-else class="text-[11px] text-slate-400">{{ t('schedule.noAssignees') }}</span>
      </div>

      <div class="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
        <v-icon size="13">mdi-timer-outline</v-icon>
        <span>{{ formatMinutes(task.spentMinutes) }}</span>
        <template v-if="task.estimatedMinutes">
          <span class="text-slate-300 dark:text-slate-600">/</span>
          <span class="text-slate-400">{{ formatMinutes(task.estimatedMinutes) }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClinicTask } from '~/types/schedule'

const props = defineProps<{
  task: ClinicTask
}>()

const emit = defineEmits<{
  (e: 'open', task: ClinicTask): void
  (e: 'drag-start', id: string, event: DragEvent): void
}>()

const { t } = useI18n()
const { priorityClass, priorityLabel } = useStatusBadge()
const { formatJalaliDateShort, formatMinutes, todayJalali } = useFormatting()
const { assigneeInitials, avatarColor, isOverdue, assigneeLabel } = useHelpers()

const today = todayJalali()

const onDragStart = (e: DragEvent) => {
  emit('drag-start', props.task.id, e)
}
</script>

<style scoped>
.schedule-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3);
  cursor: grab;
  user-select: none;
  transition: box-shadow var(--duration-fast) var(--ease-default),
              transform var(--duration-fast) var(--ease-default),
              border-color var(--duration-fast) var(--ease-default);
}
.dark .schedule-card {
  background: var(--color-blue-grey);
  border-color: var(--color-border);
}
.schedule-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-indigo-200);
  transform: translateY(-2px);
}
.dark .schedule-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
}
.schedule-card:active {
  cursor: grabbing;
}
.schedule-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px var(--color-surface);
}
.dark .schedule-avatar {
  box-shadow: 0 0 0 2px var(--color-blue-grey);
}
</style>
