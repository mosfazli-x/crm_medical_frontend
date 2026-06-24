<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden select-none relative mx-8 my-1">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
      <button @click="prevMonth"
        class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 transition-colors">
        <AltArrowLeft class="w-5 h-5 fill-slate-500 dark:fill-slate-400 rotate-180" />
      </button>
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{{ monthName }}</span>
        <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-tight">{{ yearName }}</span>
      </div>
      <button @click="nextMonth"
        class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 transition-colors">
        <AltArrowLeft class="w-5 h-5 fill-slate-500 dark:fill-slate-400" />
      </button>
    </div>

    <div class="grid grid-cols-7 gap-px px-3 pt-3 pb-1">
      <div v-for="d in weekdays" :key="d"
        class="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
        {{ d }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-px px-3 pb-3">
      <div v-for="(cell, i) in calendarDays" :key="i"
        class="aspect-square flex flex-col items-center justify-center relative cursor-pointer rounded-xl transition-all duration-150"
        :class="cellClasses(cell)"
        @click="selectDay(cell)">
        <span v-if="cell.isCurrentMonth" class="text-sm font-medium leading-none"
          :class="dayTextClasses(cell)">
          {{ cell.day }}
        </span>
        <div v-if="cell.isMarked && cell.isCurrentMonth"
          class="absolute bottom-1.5 w-1 h-1 rounded-full"
          :class="dotClasses(cell)">
        </div>
      </div>
    </div>

    <div v-if="loading"
      class="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
      <svg class="animate-spin h-6 w-6 text-electric-sapphire" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import moment from 'moment-jalaali'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'

interface CalendarCell {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isMarked: boolean
  isPast: boolean
  dateStr: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | null
  markedDates?: string[]
  loading?: boolean
}>(), {
  modelValue: null,
  markedDates: () => [],
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'month-change': [payload: { year: number; month: number }]
}>()

const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const now = moment()
const todayJYear = now.jYear()
const todayJMonth = now.jMonth()
const todayJDay = now.jDate()

const currentYear = ref(todayJYear)
const currentMonth = ref(todayJMonth)

const markedSet = computed(() => new Set(props.markedDates || []))

const monthName = computed(() => persianMonths[currentMonth.value])
const yearName = computed(() => currentYear.value.toLocaleString('fa-IR'))

const calendarDays = computed(() => {
  const firstOfMonth = moment(`${currentYear.value}/${currentMonth.value + 1}/1`, 'jYYYY/jM/jD')
  const jsDayOfWeek = firstOfMonth.day()
  const persianFirstDay = (jsDayOfWeek + 1) % 7
  const daysInMonth = moment.jDaysInMonth(currentYear.value, currentMonth.value)

  const cells: CalendarCell[] = []

  for (let i = 0; i < persianFirstDay; i++) {
    cells.push({
      day: 0,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isMarked: false,
      isPast: true,
      dateStr: '',
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear.value}/${String(currentMonth.value + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}`
    const isToday = currentYear.value === todayJYear && currentMonth.value === todayJMonth && d === todayJDay
    const cellMoment = moment(dateStr, 'jYYYY/jMM/jDD')
    const isPast = cellMoment.isBefore(now, 'day')
    const isSelected = props.modelValue === dateStr
    const isMarked = markedSet.value.has(dateStr)

    cells.push({
      day: d,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isMarked,
      isPast,
      dateStr,
    })
  }

  return cells
})

function cellClasses(cell: CalendarCell): Record<string, boolean> {
  return {
    'opacity-0 pointer-events-none': !cell.isCurrentMonth,
    'bg-electric-sapphire/10 dark:bg-electric-sapphire/20 border border-electric-sapphire/30 dark:border-electric-sapphire/50': cell.isSelected && !cell.isPast,
    'hover:bg-slate-100 dark:hover:bg-slate-700': cell.isCurrentMonth && !cell.isSelected && !cell.isPast,
    'cursor-default': cell.isPast,
  }
}

function dayTextClasses(cell: CalendarCell): Record<string, boolean> {
  return {
    'text-electric-sapphire font-bold': cell.isSelected,
    'text-slate-800 dark:text-slate-100': !cell.isSelected && !cell.isPast && !cell.isToday,
    'text-slate-400 dark:text-slate-500': cell.isPast,
    'text-electric-sapphire': cell.isToday && !cell.isSelected,
  }
}

function dotClasses(cell: CalendarCell): Record<string, boolean> {
  return {
    'bg-white dark:bg-slate-100': cell.isSelected,
    'bg-electric-sapphire': !cell.isSelected,
  }
}

function selectDay(cell: CalendarCell) {
  if (!cell.isCurrentMonth || cell.isPast) return
  emit('update:modelValue', cell.dateStr)
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
  emit('month-change', { year: currentYear.value, month: currentMonth.value + 1 })
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
  emit('month-change', { year: currentYear.value, month: currentMonth.value + 1 })
}

watch(() => props.modelValue, (val) => {
  if (val) {
    const m = moment(val, 'jYYYY-jMM-jDD')
    if (m.isValid()) {
      currentYear.value = m.jYear()
      currentMonth.value = m.jMonth()
    }
  }
})
</script>
