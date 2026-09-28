<template>
  <div ref="rootEl" class="cbpp" :class="{ 'cbpp--rtl': isRtl }">
    <div class="cbpp__group" :class="{ 'cbpp__group--open': isOpen }">
      <button
        ref="faceEl"
        type="button"
        class="cbpp__face"
        :class="{ 'is-current': isCurrent }"
        :aria-label="triggerLabel"
        aria-haspopup="dialog"
        :aria-expanded="isOpen"
        @click="toggle"
        @keydown.down.prevent="open"
        @keydown.esc="close(true)"
      >
        <span class="cbpp__eyebrow">{{ t('cashbook.period') }}</span>
        <span class="cbpp__value">
          <v-icon size="17" class="cbpp__cal">{{ isCurrent ? 'mdi-calendar-month' : 'mdi-calendar-month-outline' }}</v-icon>
          <span class="cbpp__value-text">{{ label }}</span>
        </span>
        <span class="cbpp__span" dir="auto">{{ rangeText }}</span>
      </button>

      <span class="cbpp__rule" aria-hidden="true" />
      <button
        type="button"
        class="cbpp__nav cbpp__nav--prev"
        :aria-label="t('cashbook.previousMonth')"
        @click="$emit('shift', -1)"
      >
        <v-icon size="18">mdi-chevron-left</v-icon>
      </button>
      <span class="cbpp__rule" aria-hidden="true" />
      <button
        type="button"
        class="cbpp__nav"
        :aria-label="t('cashbook.nextMonth')"
        @click="$emit('shift', 1)"
      >
        <v-icon size="18">mdi-chevron-right</v-icon>
      </button>
    </div>

    <Transition name="cbpp-pop">
      <div
        v-if="isOpen"
        class="cbpp__panel"
        role="dialog"
        :aria-label="t('cashbook.period')"
        @keydown.esc="close(true)"
      >
        <div class="cbpp__head">
          <span class="cbpp__head-title">{{ t('cashbook.pickPeriod') }}</span>
          <button
            type="button"
            class="cbpp__today"
            :disabled="isCurrent"
            @click="emit('today')"
          >
            <v-icon size="14">mdi-target</v-icon>
            {{ t('cashbook.currentMonth') }}
          </button>
        </div>

        <div class="cbpp__years" role="radiogroup" :aria-label="t('cashbook.year')" @keydown="onYearKey">
          <button
            v-for="year in years"
            :key="year"
            ref="yearEls"
            type="button"
            role="radio"
            class="cbpp__year"
            :class="{
              'is-selected': year === modelValue.year,
              'is-current': year === currentYear,
            }"
            :aria-label="`${t('cashbook.year')} ${year}`"
            :aria-checked="year === modelValue.year"
            :tabindex="year === modelValue.year ? 0 : -1"
            @click="select(year, modelValue.month)"
          >
            <span dir="ltr">{{ year }}</span>
          </button>
        </div>

        <div class="cbpp__months" role="radiogroup" :aria-label="t('cashbook.month')">
          <button
            v-for="(month, index) in months"
            :key="month.value"
            ref="monthEls"
            type="button"
            role="radio"
            class="cbpp__month"
            :class="{
              'is-selected': month.value === modelValue.month,
              'is-current': month.value === currentMonth && modelValue.year === currentYear,
            }"
            :aria-checked="month.value === modelValue.month"
            :tabindex="month.value === modelValue.month ? 0 : -1"
            @click="select(modelValue.year, month.value)"
            @keydown="onMonthKey($event, index)"
          >
            <span class="cbpp__month-name">{{ month.title }}</span>
            <span v-if="month.value === currentMonth && modelValue.year === currentYear" class="cbpp__month-dot" aria-hidden="true" />
          </button>
        </div>

        <div class="cbpp__foot">
          <v-icon size="15">mdi-calendar-range-outline</v-icon>
          <span class="cbpp__foot-text">{{ t('cashbook.periodCovers', { from: rangeFrom, to: rangeTo }) }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'

export interface CashbookPeriod {
  year: string
  month: string
}

const { t, locale } = useI18n()

const props = defineProps<{
  modelValue: CashbookPeriod
  months: Array<{ title: string; value: string }>
  label: string
  rangeFrom: string
  rangeTo: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CashbookPeriod]
  'shift': [delta: number]
  'today': []
}>()

const rootEl = ref<HTMLElement>()
const faceEl = ref<HTMLButtonElement>()
const yearEls = ref<HTMLButtonElement[]>([])
const monthEls = ref<HTMLButtonElement[]>([])
const isOpen = ref(false)

const isRtl = computed(() => locale.value === 'fa')
const currentYear = moment().format('jYYYY')
const currentMonth = moment().format('jMM')
const years = Array.from({ length: 9 }, (_, index) => String(Number(currentYear) - 5 + index))

const isCurrent = computed(
  () => props.modelValue.year === currentYear && props.modelValue.month === currentMonth,
)
const rangeFrom = computed(() => formatSpanDay(props.rangeFrom))
const rangeTo = computed(() => formatSpanDay(props.rangeTo))
const rangeText = computed(() => `${rangeFrom.value} – ${rangeTo.value}`)
const triggerLabel = computed(() => `${t('cashbook.period')}: ${props.label}`)

function formatSpanDay(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '---'
  const day = moment(value, 'YYYY-MM-DD')
  /* Index the already-localised month list so the range always matches the
     names shown in the picker grid; `jMMMM` would always yield Persian. */
  const month = props.months[Number(day.format('jM')) - 1]?.title || day.format('jMMMM')
  return `${Number(day.format('jDD'))} ${month} ${day.format('jYYYY')}`
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function open() {
  isOpen.value = true
  nextTick(() => {
    const focusYear = yearEls.value.find((el) => el?.getAttribute('aria-checked') === 'true')
    const focusMonth = monthEls.value.find((el) => el?.getAttribute('aria-checked') === 'true')
    focusMonth?.focus()
    focusYear?.scrollIntoView({ block: 'nearest', inline: 'center' })
  })
}

function close(restoreFocus = false) {
  if (!isOpen.value) return
  isOpen.value = false
  /* Only on keyboard dismissal: an outside click must keep the focus it took. */
  if (restoreFocus) nextTick(() => faceEl.value?.focus())
}

function select(year: string, month: string) {
  if (year === props.modelValue.year && month === props.modelValue.month) {
    close()
    return
  }
  emit('update:modelValue', { year, month })
  close()
}

function onMonthKey(event: KeyboardEvent, index: number) {
  const deltas: Record<string, number> = {
    ArrowLeft: isRtl.value ? 1 : -1,
    ArrowRight: isRtl.value ? -1 : 1,
    ArrowUp: -3,
    ArrowDown: 3,
    Home: -index,
    End: props.months.length - 1 - index,
  }
  const delta = deltas[event.key]
  if (delta === undefined) return
  event.preventDefault()
  const next = Math.min(props.months.length - 1, Math.max(0, index + delta))
  monthEls.value[next]?.focus()
}

function onYearKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const active = document.activeElement as HTMLButtonElement | null
  const index = yearEls.value.findIndex((el) => el === active)
  if (index < 0) return
  const step = (event.key === 'ArrowRight') === isRtl.value ? -1 : 1
  const next = Math.min(yearEls.value.length - 1, Math.max(0, index + step))
  yearEls.value[next]?.focus()
  yearEls.value[next]?.scrollIntoView({ block: 'nearest', inline: 'center' })
}

function onPointerDown(event: MouseEvent) {
  if (!rootEl.value?.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', onPointerDown))
onUnmounted(() => document.removeEventListener('mousedown', onPointerDown))
</script>

<style scoped>
.cbpp {
  position: relative;
  min-width: 0;
  flex: 1 1 15rem;
  max-width: 24rem;
}

.cbpp__group {
  display: flex;
  align-items: stretch;
  min-height: 4.25rem;
  border: 1px solid var(--asa-sep);
  border-radius: 1.125rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  transition: background-color 180ms var(--ease-default), border-color 180ms var(--ease-default),
    box-shadow 180ms var(--ease-default);
}

.cbpp__group:hover {
  background: color-mix(in srgb, var(--asa-label) 5.5%, transparent);
  border-color: color-mix(in srgb, var(--asa-accent) 30%, transparent);
}

.cbpp__group--open {
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.cbpp__face {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.0625rem;
  flex: 1;
  min-width: 0;
  padding: 0.75rem 0.875rem;
  border: none;
  border-radius: 1.125rem;
  background: transparent;
  color: var(--asa-label);
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.cbpp__face:hover {
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.cbpp__face:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: -2px;
}

.cbpp__eyebrow {
  color: var(--asa-label-2);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  line-height: 1.2;
  text-transform: uppercase;
}

/* Letter-spacing breaks Arabic-script cursive joining, so it is LTR-only. */
.cbpp--rtl .cbpp__eyebrow {
  letter-spacing: 0;
}

.cbpp__value {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  max-width: 100%;
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.35;
}

.cbpp__cal {
  flex-shrink: 0;
  color: var(--asa-label-2);
  transition: color 180ms var(--ease-default);
}

.cbpp__face:hover .cbpp__cal {
  color: var(--asa-accent);
}

.cbpp__face.is-current .cbpp__cal {
  color: var(--asa-accent-deep);
}

.dark .cbpp__face.is-current .cbpp__cal {
  color: var(--asa-accent);
}

.cbpp__value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbpp__span {
  max-width: 100%;
  overflow: hidden;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbpp__rule {
  align-self: center;
  width: 1px;
  height: 1.5rem;
  flex-shrink: 0;
  background: var(--asa-sep);
}

.cbpp__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  flex-shrink: 0;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.cbpp__nav:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .cbpp__nav:hover {
  color: var(--asa-accent);
}

.cbpp__nav:active {
  background: color-mix(in srgb, var(--asa-accent) 26%, transparent);
}

.cbpp__nav:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: -2px;
}

/* In RTL the timeline advances to the left, so mirror the chevrons.
   Driven by the active locale because Vuetify's locale provider only sets the
   CSS `direction` property, which `:dir()` does not match. */
.cbpp--rtl .cbpp__nav {
  transform: scaleX(-1);
}

/* â”€â”€ Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

.cbpp__panel {
  position: absolute;
  inset-inline-start: 0;
  top: calc(100% + 0.5rem);
  z-index: 70;
  width: min(100%, 24rem);
  padding: 0.875rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.125rem;
  background: var(--asa-bg-card);
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.05), 0 24px 48px -18px rgba(17, 24, 39, 0.28);
}

.cbpp__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.cbpp__head-title {
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.075em;
  text-transform: uppercase;
}

.cbpp__today {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--asa-accent) 26%, transparent);
  border-radius: 9999px;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
  font-size: 0.6875rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), opacity 150ms var(--ease-default);
}

.dark .cbpp__today {
  color: var(--asa-accent);
}

.cbpp__today:hover:not(:disabled) {
  background: color-mix(in srgb, var(--asa-accent) 26%, transparent);
}

.cbpp__today:disabled {
  opacity: 0.45;
  cursor: default;
}

.cbpp__today:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 2px;
}

.cbpp__years {
  display: flex;
  gap: 0.125rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--asa-sep);
  overflow-x: auto;
  scrollbar-width: none;
}

.cbpp__years::-webkit-scrollbar {
  display: none;
}

.cbpp__year {
  position: relative;
  flex: 1 1 auto;
  min-width: 2.25rem;
  padding: 0.4375rem 0.375rem;
  border: 1px solid transparent;
  border-radius: 0.6875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    border-color 150ms var(--ease-default);
}

.cbpp__year:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.cbpp__year:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

.cbpp__year.is-selected {
  background: var(--asa-accent);
  border-color: var(--asa-accent);
  color: #ffffff;
}

.cbpp__year.is-current:not(.is-selected)::after {
  content: '';
  position: absolute;
  bottom: 0.25rem;
  inset-inline-start: 50%;
  width: 0.1875rem;
  height: 0.1875rem;
  border-radius: 9999px;
  background: var(--asa-accent);
  transform: translateX(-50%);
}

.cbpp__months {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.375rem;
}

.cbpp__month {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0.5rem 0.25rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  color: var(--asa-label-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    border-color 150ms var(--ease-default), transform 120ms var(--ease-default);
}

.cbpp__month:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.cbpp__month:active {
  transform: scale(0.96);
}

.cbpp__month:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

.cbpp__month.is-selected {
  background: var(--asa-accent);
  border-color: var(--asa-accent);
  color: #ffffff;
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--asa-accent) 70%, transparent);
}

.cbpp__month.is-current:not(.is-selected) {
  border-color: color-mix(in srgb, var(--asa-accent) 42%, transparent);
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .cbpp__month.is-current:not(.is-selected) {
  color: var(--asa-accent);
}

.cbpp__month-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbpp__month-dot {
  position: absolute;
  bottom: 0.3125rem;
  inset-inline-start: 50%;
  width: 0.1875rem;
  height: 0.1875rem;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.75;
  transform: translateX(-50%);
}

.cbpp__foot {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 3.5%, transparent);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  line-height: 1.45;
}

.cbpp__foot :deep(.v-icon) {
  flex-shrink: 0;
  color: var(--asa-label-2);
}

.cbpp__foot-text {
  min-width: 0;
  font-variant-numeric: tabular-nums;
}

.cbpp-pop-enter-active {
  transition: opacity 160ms var(--ease-default), transform 160ms var(--ease-default);
}

.cbpp-pop-leave-active {
  transition: opacity 110ms var(--ease-default), transform 110ms var(--ease-default);
}

.cbpp-pop-enter-from,
.cbpp-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.375rem) scale(0.985);
  transform-origin: top center;
}

@media (max-width: 700px) {
  /* The period group is the densest control, so it always keeps a full row. */
  .cbpp {
    flex: 1 1 100%;
    max-width: none;
    order: 3;
  }

  .cbpp__panel {
    width: 100%;
  }
}
</style>
