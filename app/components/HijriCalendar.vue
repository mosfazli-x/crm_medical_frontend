<template>
  <div class="hjcal">
    <!-- ─── Month navigation ─── -->
    <div class="hjcal__head">
      <button
        type="button"
        class="hjcal__nav"
        :aria-label="t('booking.calendar.prevMonth')"
        :title="t('booking.calendar.prevMonth')"
        @click="goPrevMonth"
      >
        <v-icon size="18">{{ prevIcon }}</v-icon>
      </button>

      <div class="hjcal__heading">
        <span class="hjcal__month">{{ monthLabel }}</span>
        <span class="hjcal__year">{{ yearLabel }}</span>
      </div>

      <button
        type="button"
        class="hjcal__nav"
        :aria-label="t('booking.calendar.nextMonth')"
        :title="t('booking.calendar.nextMonth')"
        @click="goNextMonth"
      >
        <v-icon size="18">{{ nextIcon }}</v-icon>
      </button>
    </div>

    <!-- ─── Weekday header ─── -->
    <div class="hjcal__week" aria-hidden="true">
      <span v-for="(label, i) in weekdays" :key="i" class="hjcal__weekday">{{ label }}</span>
    </div>

    <!-- ─── Day grid ─── -->
    <div
      class="hjcal__grid"
      role="group"
      :aria-label="`${monthLabel} ${yearLabel}`"
      @keydown="onKeydown"
    >
      <button
        v-for="cell in cells"
        :key="cell.key"
        type="button"
        class="hjcal__day"
        :class="dayClass(cell)"
        :disabled="!cell.selectable"
        :aria-pressed="cell.selected"
        :aria-current="cell.isToday ? 'date' : undefined"
        :aria-label="cell.ariaLabel"
        :tabindex="cell.focusable ? 0 : -1"
        :data-date="cell.dateStr || undefined"
        @click="selectDay(cell)"
        @focus="focusedDate = cell.dateStr"
      >
        <span class="hjcal__day-num">{{ cell.isCurrentMonth ? pn(cell.day) : '' }}</span>
        <span v-if="cell.isMarked" class="hjcal__day-dot" aria-hidden="true" />
      </button>
    </div>

    <!-- ─── Legend ─── -->
    <div v-if="hasMarks" class="hjcal__legend">
      <span class="hjcal__legend-item">
        <span class="hjcal__legend-dot" aria-hidden="true" />
        <span>{{ t('booking.calendar.hasSlots') }}</span>
      </span>
    </div>

    <!-- ─── Loading veil ─── -->
    <div v-if="loading" class="hjcal__veil" role="status" :aria-label="t('common.loading')">
      <v-icon size="22" class="pf-spin">mdi-loading</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import { useLang } from '~/composables/useLang'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  markedDates?: string[]
  loading?: boolean
  /** Once the caller has loaded availability for the visible month, days without
      a mark are treated as unavailable instead of merely "unknown". */
  hasMarks?: boolean
}>(), {
  modelValue: null,
  markedDates: () => [],
  loading: false,
  hasMarks: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'month-change': [payload: { year: number; month: number }]
}>()

const { t, locale } = useI18n()
const { pn, isRtl } = useLang()

const now = moment()

/* ─── Locale labels ─── */
const weekdays = computed(() => [
  t('calendar.weekday.sat'),
  t('calendar.weekday.sun'),
  t('calendar.weekday.mon'),
  t('calendar.weekday.tue'),
  t('calendar.weekday.wed'),
  t('calendar.weekday.thu'),
  t('calendar.weekday.fri'),
])

const monthNames = computed(() => [
  t('calendar.month.farvardin'), t('calendar.month.ordibehesht'), t('calendar.month.khordad'),
  t('calendar.month.tir'), t('calendar.month.mordad'), t('calendar.month.shahrivar'),
  t('calendar.month.mehr'), t('calendar.month.aban'), t('calendar.month.azar'),
  t('calendar.month.dey'), t('calendar.month.bahman'), t('calendar.month.esfand'),
])

const monthLabel = computed(() => monthNames.value[currentMonth.value] ?? '')
const yearLabel = computed(() =>
  new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', { useGrouping: false }).format(currentYear.value)
)

/* Chevrons follow reading direction so "previous" always points backwards visually. */
const prevIcon = computed(() => (isRtl.value ? 'mdi-chevron-right' : 'mdi-chevron-left'))
const nextIcon = computed(() => (isRtl.value ? 'mdi-chevron-left' : 'mdi-chevron-right'))

/* ─── Visible month ─── */
const currentYear = ref(now.jYear())
const currentMonth = ref(now.jMonth())

const markedSet = computed(() => new Set(props.markedDates))

/* ─── Cells ─── */
interface CalendarCell {
  key: string
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isMarked: boolean
  isPast: boolean
  selectable: boolean
  focusable: boolean
  ariaLabel: string
}

const cells = computed<CalendarCell[]>(() => {
  const out: CalendarCell[] = []

  const year = currentYear.value
  const month = currentMonth.value

  // Saturday-first offset, matching the weekday header order.
  const firstOfMonth = moment(`${year}/${month + 1}/1`, 'jYYYY/jM/jD')
  const offset = (firstOfMonth.day() + 1) % 7
  const daysInMonth = moment.jDaysInMonth(year, month)

  const pad = (n: number) => String(n).padStart(2, '0')

  for (let i = 0; i < offset; i++) {
    out.push(blankCell(`lead-${i}`))
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}/${pad(month + 1)}/${pad(d)}`
    const dayMoment = moment(dateStr, 'jYYYY/jMM/jDD')
    const isPast = dayMoment.isBefore(now, 'day')
    const isMarked = markedSet.value.has(dateStr)
    const isSelected = props.modelValue === dateStr
    const isToday =
      year === now.jYear() && month === now.jMonth() && d === now.jDate()

    // A day is selectable when it is not in the past and, if the caller has told
    // us availability is known, when it actually has free slots.
    const selectable = !isPast && (!props.hasMarks || isMarked)

    out.push({
      key: dateStr,
      dateStr,
      day: d,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isMarked,
      isPast,
      selectable,
      focusable: selectable,
      ariaLabel: dayMoment.locale('fa').calendar(),
    })
  }

  // Pad the tail so the final row is a full 7-cell week.
  while (out.length % 7 !== 0) {
    out.push(blankCell(`tail-${out.length}`))
  }

  // Roving tabindex: exactly one day in the month is reachable with Tab.
  const anchor = out.find((c) => c.selectable && c.isSelected)
    ?? out.find((c) => c.selectable && c.isToday)
    ?? out.find((c) => c.selectable)

  return out.map((c) => ({ ...c, focusable: anchor ? c.key === anchor.key : false }))
})

function blankCell(key: string): CalendarCell {
  return {
    key,
    dateStr: '',
    day: 0,
    isCurrentMonth: false,
    isToday: false,
    isSelected: false,
    isMarked: false,
    isPast: true,
    selectable: false,
    focusable: false,
    ariaLabel: '',
  }
}

function dayClass(cell: CalendarCell): Record<string, boolean> {
  return {
    'hjcal__day--hidden': !cell.isCurrentMonth,
    'hjcal__day--past': cell.isPast,
    'hjcal__day--unavailable': cell.isCurrentMonth && !cell.selectable,
    'hjcal__day--selected': cell.isSelected,
    'hjcal__day--today': cell.isToday && !cell.isSelected,
  }
}

/* ─── Interaction ─── */
const focusedDate = ref('')

function selectDay(cell: CalendarCell) {
  if (!cell.selectable) return
  focusedDate.value = cell.dateStr
  emit('update:modelValue', cell.dateStr)
}

function shiftMonth(delta: number) {
  let y = currentYear.value
  let m = currentMonth.value + delta

  if (m < 0) {
    m = 11
    y--
  } else if (m > 11) {
    m = 0
    y++
  }

  currentYear.value = y
  currentMonth.value = m
  emit('month-change', { year: y, month: m + 1 })
}

function goPrevMonth() {
  shiftMonth(-1)
}

function goNextMonth() {
  shiftMonth(1)
}

/** Arrow keys move day-to-day, PageUp/PageDown move by month. */
function onKeydown(event: KeyboardEvent) {
  const deltas: Record<string, number> = {
    ArrowLeft: isRtl.value ? 1 : -1,
    ArrowRight: isRtl.value ? -1 : 1,
    ArrowUp: -7,
    ArrowDown: 7,
  }

  if (event.key in deltas) {
    event.preventDefault()
    moveFocus(deltas[event.key])
    return
  }

  if (event.key === 'PageUp') {
    event.preventDefault()
    goPrevMonth()
    return
  }

  if (event.key === 'PageDown') {
    event.preventDefault()
    goNextMonth()
  }
}

function moveFocus(delta: number) {
  const index = cells.value.findIndex((c) => c.key === focusedDate.value)
  if (index === -1) return

  let target = index
  for (let step = 0; step < 7; step++) {
    target += delta
    if (target < 0 || target >= cells.value.length) return
    if (cells.value[target].selectable) break
    if (target + delta < 0 || target + delta >= cells.value.length) return
  }

  const next = cells.value[target]
  if (!next?.selectable) return

  focusedDate.value = next.dateStr
  nextTick(() => {
    const el = cells.value.find((c) => c.key === next.dateStr)
    if (el) (document.querySelector(`[data-date="${el.dateStr}"]`) as HTMLElement | null)?.focus()
  })
}

/* Keep the visible month in sync when the parent changes the value. */
watch(() => props.modelValue, (val) => {
  const m = parseJalali(val)
  if (m && (m.jYear() !== currentYear.value || m.jMonth() !== currentMonth.value)) {
    currentYear.value = m.jYear()
    currentMonth.value = m.jMonth()
  }
  if (val) focusedDate.value = val
}, { immediate: true })

/** Accepts both `1403/05/09` and `1403-05-09`. */
function parseJalali(value: string | null | undefined) {
  if (!value) return null
  const m = moment(value.replace(/-/g, '/'), 'jYYYY/jMM/jDD', true)
  return m.isValid() ? m : null
}
</script>

<style scoped>
.hjcal {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 1.25rem;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  box-shadow: var(--asa-card-shadow);
  padding: 1rem;
  user-select: none;
}

/* ─── Header ─── */
.hjcal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.hjcal__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border: none;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}

.hjcal__nav:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.hjcal__nav:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.hjcal__heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.hjcal__month {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
  line-height: 1.2;
}

.hjcal__year {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

/* ─── Weekdays ─── */
.hjcal__week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.25rem;
}

.hjcal__weekday {
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-3);
  padding-bottom: 0.25rem;
}

/* ─── Days ─── */
.hjcal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.25rem;
}

.hjcal__day {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  min-height: 2.25rem;
  border: 1px solid transparent;
  border-radius: 0.875rem;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--asa-label);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

.hjcal__day:hover:not(:disabled) {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.hjcal__day:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 1px;
}

/* Days with no availability stay visible but inert, so the month still reads
   as a full calendar instead of appearing to have holes in it. */
.hjcal__day--past,
.hjcal__day--unavailable {
  color: var(--asa-label-3);
  cursor: not-allowed;
  opacity: 0.5;
}

.hjcal__day--hidden {
  visibility: hidden;
  pointer-events: none;
}

.hjcal__day--today {
  border-color: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
  font-weight: 700;
}

.hjcal__day--selected {
  background: var(--asa-accent);
  border-color: var(--asa-accent);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--asa-accent) 70%, transparent);
}

.hjcal__day-dot {
  position: absolute;
  bottom: 0.3125rem;
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 9999px;
  background: var(--asa-accent);
}

.hjcal__day--selected .hjcal__day-dot {
  background: #ffffff;
}

/* ─── Legend ─── */
.hjcal__legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--asa-sep);
}

.hjcal__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.hjcal__legend-dot {
  width: 0.3125rem;
  height: 0.3125rem;
  border-radius: 9999px;
  background: var(--asa-accent);
}

/* ─── Loading veil ─── */
.hjcal__veil {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--asa-bg-card) 72%, transparent);
  backdrop-filter: blur(2px);
  color: var(--asa-accent);
}

@media (max-width: 400px) {
  .hjcal {
    padding: 0.75rem;
  }
}
</style>
