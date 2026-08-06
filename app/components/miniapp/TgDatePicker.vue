<template>
  <div class="select-none">
    <div class="flex items-center justify-between mb-3">
      <button
        type="button"
        class="flex items-center justify-center w-9 h-9 rounded-full"
        style="background: var(--tg-sec-bg); color: var(--tg-text);"
        @click="prevMonth"
      >
        <span class="text-lg leading-none">›</span>
      </button>
      <div class="font-bold text-[15px]" style="color: var(--tg-text);">{{ monthTitle }}</div>
      <button
        type="button"
        class="flex items-center justify-center w-9 h-9 rounded-full"
        style="background: var(--tg-sec-bg); color: var(--tg-text);"
        @click="nextMonth"
      >
        <span class="text-lg leading-none">‹</span>
      </button>
    </div>

    <div class="grid grid-cols-7 gap-1 mb-1">
      <div v-for="w in weekdays" :key="w" class="text-center text-[11px] font-semibold" style="color: var(--tg-hint);">
        {{ w }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="tg-date-cell"
        :class="{ selected: cell.date === modelValue, selectable: cell.selectable }"
        :style="{ color: cell.today && !(cell.date === modelValue) ? 'var(--tg-btn)' : undefined }"
        @click="cell.selectable && select(cell.date)"
      >
        {{ cell.day }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'

const props = defineProps<{
  modelValue: string | null
  minDate?: string | null
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const today = moment()
const viewYear = ref(today.jYear())
const viewMonth = ref(today.jMonth())

const monthTitle = computed(() => {
  const m = moment(`${viewYear.value}-${viewMonth.value + 1}`, 'jYYYY-jMM')
  return `${m.format('jMMMM')} ${m.format('jYYYY')}`
})

const minDateStr = computed(() => props.minDate || today.format('YYYY-MM-DD'))

const cells = computed(() => {
  const first = moment(`${viewYear.value}-${viewMonth.value + 1}-1`, 'jYYYY-jMM-jDD')
  const cur = first.clone()
  const curMonth = first.jMonth()
  let daysInMonth = 0
  while (cur.jMonth() === curMonth) {
    daysInMonth++
    cur.add(1, 'day')
  }
  const startCol = (first.day() + 1) % 7
  const list: { key: string; day: number | null; date: string; selectable: boolean; today: boolean }[] = []

  for (let i = 0; i < startCol; i++) {
    list.push({ key: `pad-${i}`, day: null, date: '', selectable: false, today: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = moment(`${viewYear.value}-${viewMonth.value + 1}-${d}`, 'jYYYY-jMM-jDD')
    const date = dateObj.format('YYYY-MM-DD')
    list.push({
      key: `d-${d}`,
      day: d,
      date,
      selectable: date >= minDateStr.value,
      today: date === today.format('YYYY-MM-DD'),
    })
  }

  return list
})

const select = (date: string) => emit('update:modelValue', date)

const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}
</script>
