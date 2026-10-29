<template>
  <section class="hm">
    <header class="hm-head">
      <button
        type="button"
        class="app-iconbtn"
        :aria-label="t('attendance.pwa.prevMonth')"
        @click="shift(-1)"
      >
        <Icon name="lucide:chevron-right" size="17" />
      </button>

      <h3 class="hm-title">{{ title }}</h3>

      <button
        type="button"
        class="app-iconbtn"
        :aria-label="t('attendance.pwa.nextMonth')"
        @click="shift(1)"
      >
        <Icon name="lucide:chevron-left" size="17" />
      </button>
    </header>

    <div class="app-heat__head" aria-hidden="true">
      <span v-for="(label, index) in weekdayLabels" :key="index">{{ label }}</span>
    </div>

    <div class="app-heat" role="grid" :aria-label="title">
      <button
        v-for="cell in cells"
        :key="cell.date"
        type="button"
        role="gridcell"
        class="app-heat__cell"
        :class="cellClass(cell)"
        :aria-label="cellAria(cell)"
        :aria-current="cell.isToday ? 'date' : undefined"
        @click="emit('select', cell.date)"
      >
        <span class="hm-day">{{ pn(cell.day) }}</span>
        <span v-if="cell.record?.sessions?.length" class="app-heat__dot" aria-hidden="true" />
      </button>
    </div>

    <ul class="hm-legend">
      <li v-for="status in LEGEND_STATUSES" :key="status" class="hm-legend__item">
        <span class="hm-legend__swatch" :class="`app-heat__cell--${status}`" aria-hidden="true" />
        {{ statusLabel(status) }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AttendanceRecord, AttendanceStatus } from '~/types/attendance'
import type { JalaliMoment, JalaliMonthCell } from '~/composables/useAttendance'

const props = defineProps<{
  cursor: JalaliMoment
  records: AttendanceRecord[]
  selectedDate?: string | null
}>()

const emit = defineEmits<{
  'update:cursor': [cursor: JalaliMoment]
  select: [date: string]
}>()

const { t } = useI18n()
const { pn } = useLang()
const { statusLabel, jalaliMonthCells, weekdayLabels, monthTitle, prettyDate } = useAttendance()

const LEGEND_STATUSES: AttendanceStatus[] = ['present', 'late', 'absent', 'leave', 'holiday']

const title = computed(() => monthTitle(props.cursor))

const byDate = computed(() => {
  const map = new Map<string, AttendanceRecord>()
  for (const record of props.records) map.set(record.date, record)
  return map
})

const cells = computed(() =>
  jalaliMonthCells(props.cursor).map((cell) => ({ ...cell, record: byDate.value.get(cell.date) ?? null })),
)

function shift(direction: number) {
  emit('update:cursor', props.cursor.clone().add(direction, 'jMonth'))
}

function cellClass(cell: JalaliMonthCell & { record: AttendanceRecord | null }): string {
  const classes = ['app-heat__cell']
  if (!cell.inMonth) classes.push('app-heat__cell--out')
  if (cell.isToday) classes.push('app-heat__cell--today')
  if (cell.record) classes.push(`app-heat__cell--${cell.record.status}`)
  if (props.selectedDate === cell.date) classes.push('app-heat__cell--selected')
  return classes.join(' ')
}

function cellAria(cell: JalaliMonthCell & { record: AttendanceRecord | null }): string {
  const date = prettyDate(cell.date)
  if (!cell.record) return `${date} — ${t('attendance.pwa.noRecord')}`
  return `${date} — ${statusLabel(cell.record.status)}`
}
</script>

<style scoped>
.hm {
  padding: 14px;
  border-radius: var(--app-radius);
  border: 1px solid var(--app-border);
  background: var(--app-surface);
}

.hm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.hm-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--app-text);
}

.hm-day {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.app-heat__cell--selected {
  outline: 2px solid var(--app-brand-deep);
  outline-offset: 1px;
}

.dark .app-heat__cell--selected {
  outline-color: var(--app-brand-ink);
}

.hm-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid var(--app-border);
}

.hm-legend__item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--app-muted);
}

.hm-legend__swatch {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  border: 1px solid transparent;
}
</style>
