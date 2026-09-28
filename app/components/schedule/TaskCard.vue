<template>
  <article
    class="sch-card"
    :class="{ 'sch-card--dragging': dragging }"
    :draggable="draggable"
    :tabindex="0"
    role="button"
    :aria-label="task.title"
    @click="emit('open', task)"
    @keydown.enter.prevent="emit('open', task)"
    @keydown.space.prevent="emit('open', task)"
    @dragstart="onDragStart"
    @dragend="emit('drag-end', task.id)"
  >
    <div class="flex items-start justify-between gap-2! mb-2!">
      <span class="asa-pill" :class="priorityPill(task.priority)">
        {{ priorityLabel(task.priority) }}
      </span>
      <span
        v-if="task.dueDate"
        class="asa-pill"
        :class="overdue ? 'asa-pill--rose' : 'pf-pill--neutral'"
      >
        <v-icon size="11">{{ overdue ? 'mdi-alert-circle-outline' : 'mdi-calendar-clock' }}</v-icon>
        {{ formatJalaliDateShort(task.dueDate) }}
      </span>
    </div>

    <p class="sch-card__title">{{ task.title }}</p>
    <p v-if="task.description" class="sch-card__desc">{{ task.description }}</p>

    <div class="sch-card__foot">
      <div class="flex items-center gap-1! min-w-0!">
        <template v-if="task.assignees.length">
          <span
            v-for="a in task.assignees.slice(0, 3)"
            :key="a.id"
            class="sch-avatar"
            :style="{ background: avatarColor(a.id) }"
            :title="assigneeLabel(a)"
          >{{ assigneeInitials(a) }}</span>
          <span v-if="task.assignees.length > 3" class="pf-tiny">+{{ task.assignees.length - 3 }}</span>
        </template>
        <span v-else class="pf-tiny">{{ t('schedule.noAssignees') }}</span>
      </div>

      <span class="sch-card__time">
        <v-icon size="12">mdi-timer-outline</v-icon>
        {{ timeRange(task) }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ClinicTask } from '~/types/schedule'

const props = withDefaults(
  defineProps<{
    task: ClinicTask
    draggable?: boolean
    dragging?: boolean
  }>(),
  { draggable: true, dragging: false },
)

const emit = defineEmits<{
  (e: 'open', task: ClinicTask): void
  (e: 'drag-start', id: string, event: DragEvent): void
  (e: 'drag-end', id: string): void
}>()

const { t } = useI18n()
const { priorityPill, priorityLabel, assigneeLabel, assigneeInitials, avatarColor, isOverdue, formatJalaliDateShort, timeRange } =
  useTaskPresentation()

const overdue = computed(() => isOverdue(props.task))

const onDragStart = (e: DragEvent) => {
  if (!props.draggable) {
    e.preventDefault()
    return
  }
  emit('drag-start', props.task.id, e)
}
</script>

<style scoped>
.sch-card {
  display: block;
  width: 100%;
  text-align: start;
  padding: 0.75rem 0.875rem;
  border-radius: 1rem;
  border: 1px solid var(--asa-sep);
  background: var(--asa-bg-card);
  cursor: pointer;
  user-select: none;
  transition:
    box-shadow 180ms var(--ease-default),
    transform 180ms var(--ease-default),
    border-color 180ms var(--ease-default);
}

.sch-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--asa-accent) 35%, transparent);
  box-shadow: var(--asa-card-shadow);
}

.sch-card:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 2px;
}

.sch-card--dragging {
  opacity: 0.45;
  cursor: grabbing;
}

.sch-card__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--asa-label);
}

.sch-card__desc {
  margin-top: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.sch-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.625rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--asa-sep);
}

.sch-card__time {
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  flex-shrink: 0;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.sch-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  font-size: 0.5625rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 0 0 2px var(--asa-bg-card);
}

@media (prefers-reduced-motion: reduce) {
  .sch-card {
    transition: none;
  }

  .sch-card:hover {
    transform: none;
  }
}
</style>
