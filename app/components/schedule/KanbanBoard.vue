<template>
  <div class="sch-board" role="list">
    <section
      v-for="col in columns"
      :key="col.status"
      class="sch-col"
      :class="{ 'sch-col--over': dragOverCol === col.status }"
      role="listitem"
      :aria-label="col.label"
      @dragover.prevent="onDragOver(col.status)"
      @dragenter.prevent="onDragEnter(col.status)"
      @dragleave="onDragLeave(col.status)"
      @drop.prevent="onDrop(col.status)"
    >
      <header class="sch-col__head">
        <div class="flex items-center gap-2! min-w-0!">
          <span class="sch-col__dot" :style="{ background: col.color }" />
          <h3 class="sch-col__title">{{ col.label }}</h3>
          <span class="pf-seg__count sch-col__count">{{ pn(col.tasks.length) }}</span>
        </div>
        <button
          v-if="canAdd"
          class="pf-icon-btn"
          type="button"
          :aria-label="t('schedule.addTask')"
          @click="emit('add', col.status)"
        >
          <Plus class="w-3.5! h-3.5! stroke-current" />
        </button>
      </header>

      <div class="sch-col__body">
        <ScheduleTaskCard
          v-for="task in col.tasks"
          :key="task.id"
          :task="task"
          :draggable="canMove"
          :dragging="draggingId === task.id"
          @open="emit('open', $event)"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
        />

        <div v-if="!col.tasks.length" class="sch-col__empty">
          <v-icon size="18">{{ emptyIcon }}</v-icon>
          <span>{{ t('schedule.dropHere') }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Plus from '~/components/icons/Plus.vue'
import { TASK_STATUSES } from '~/types/schedule'
import type { ClinicTask, TaskStatus } from '~/types/schedule'

const props = withDefaults(
  defineProps<{
    tasks: ClinicTask[]
    canAdd?: boolean
    canMove?: boolean
  }>(),
  { canAdd: false, canMove: true },
)

const emit = defineEmits<{
  (e: 'move', task: ClinicTask, status: TaskStatus): void
  (e: 'open', task: ClinicTask): void
  (e: 'add', status: TaskStatus): void
}>()

const { t } = useI18n()
const { pn } = useLang()
const { statusDot, statusLabel } = useTaskPresentation()

const emptyIcon = 'mdi-tray-arrow-down'

const columns = computed(() =>
  TASK_STATUSES.map((status) => ({
    status,
    label: statusLabel(status),
    color: statusDot(status),
    tasks: props.tasks.filter((task) => task.status === status),
  })),
)

const draggingId = ref<string | null>(null)
const dragOverCol = ref<string | null>(null)

const onDragOver = (status: TaskStatus) => {
  if (props.canMove && draggingId.value) dragOverCol.value = status
}

const onDragEnter = (status: TaskStatus) => {
  if (props.canMove && draggingId.value) dragOverCol.value = status
}

const onDragLeave = (status: TaskStatus) => {
  if (dragOverCol.value === status) dragOverCol.value = null
}

const onDragStart = (id: string, e: DragEvent) => {
  draggingId.value = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

const onDragEnd = () => {
  draggingId.value = null
  dragOverCol.value = null
}

const onDrop = (status: TaskStatus) => {
  const taskId = draggingId.value
  onDragEnd()
  if (!props.canMove || !taskId) return
  const task = props.tasks.find((x) => x.id === taskId)
  if (task && task.status !== status) emit('move', task, status)
}
</script>

<style scoped>
.sch-board {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.25rem 1.25rem 1rem;
  scroll-snap-type: x proximity;
  overscroll-behavior-x: contain;
}

.sch-col {
  flex: 1 0 15.5rem;
  min-width: 15.5rem;
  max-width: 22rem;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  border: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  transition:
    border-color 180ms var(--ease-default),
    background-color 180ms var(--ease-default);
}

.sch-col--over {
  border-color: color-mix(in srgb, var(--asa-accent) 45%, transparent);
  background: color-mix(in srgb, var(--asa-accent) 7%, transparent);
}

.sch-col__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--asa-sep);
}

.sch-col__dot {
  width: 0.5rem;
  height: 0.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
}

.sch-col__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sch-col__count {
  flex-shrink: 0;
}

.sch-col__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  min-height: 6.5rem;
}

.sch-col__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 1.5rem 0.75rem;
  border-radius: 0.875rem;
  border: 1.5px dashed var(--asa-sep);
  font-size: 0.6875rem;
  text-align: center;
  color: var(--asa-label-3);
}

.sch-board::-webkit-scrollbar {
  height: 8px;
}

.sch-board::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 18%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .sch-col {
    transition: none;
  }
}
</style>
