<template>
  <div class="cbw">
    <div class="cbw__stage">
      <svg class="cbw__svg" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="chartLabel">
        <line class="cbw__base" :x1="PAD.left" :x2="W - PAD.right" :y1="baselineY" :y2="baselineY" />
        <g v-for="(row, index) in display" :key="row.index">
          <rect
            class="cbw__hit"
            :x="groupX(index)"
            :y="PAD.top"
            :width="groupW"
            :height="plotH"
            @mouseenter="hover = index"
            @mouseleave="hover = null"
          />
          <rect
            class="cbw__bar cbw__bar--in"
            :class="{ 'is-dim': hover !== null && hover !== index }"
            :x="centerX(index) - barW - GAP / 2"
            :y="scaleY(row.incomeRial)"
            :width="barW"
            :height="Math.max(1, baselineY - scaleY(row.incomeRial))"
            rx="3"
          />
          <rect
            class="cbw__bar cbw__bar--out"
            :class="{ 'is-dim': hover !== null && hover !== index }"
            :x="centerX(index) + GAP / 2"
            :y="scaleY(row.expenseRial)"
            :width="barW"
            :height="Math.max(1, baselineY - scaleY(row.expenseRial))"
            rx="3"
          />
        </g>
      </svg>

      <div class="cbw__labels">
        <span
          v-for="(row, index) in display"
          :key="row.index"
          :class="{ 'is-active': hover === index }"
          :style="{ insetInlineStart: `${(centerX(index) / W) * 100}%` }"
        >
          {{ props.labels[row.index] }}
        </span>
      </div>

      <div v-if="hover !== null && display[hover]" class="cbw__tip" :style="tipStyle(hover)">
        <p class="cbw__tip-title">{{ props.labels[display[hover]!.index] }}</p>
        <p><span class="cbw__tip-dot cbw__tip-dot--in" />{{ t('cashbook.income') }}<b dir="ltr">{{ format(display[hover]!.incomeRial) }}</b></p>
        <p><span class="cbw__tip-dot cbw__tip-dot--out" />{{ t('cashbook.expense') }}<b dir="ltr">{{ format(display[hover]!.expenseRial) }}</b></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CashbookWeekdayPoint } from '~/composables/useFinance'

const props = defineProps<{
  series: CashbookWeekdayPoint[]
  labels: string[]
  format: (value: string | number | null | undefined) => string
  chartLabel: string
}>()

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'fa')
const display = computed(() => (isRtl.value ? [...props.series].reverse() : props.series))

const W = 420
const H = 210
const PAD = { top: 18, right: 12, bottom: 8, left: 12 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom
const GAP = 3

const hover = ref<number | null>(null)
const groupW = computed(() => (display.value.length ? plotW / display.value.length : plotW))
const barW = computed(() => Math.max(5, Math.min(20, groupW.value * 0.28)))

const maxValue = computed(() => {
  let max = 0
  for (const row of display.value) max = Math.max(max, Number(row.incomeRial) / 10, Number(row.expenseRial) / 10)
  return max || 1
})

function scaleY(valueRial: string): number {
  const value = Number(valueRial) / 10
  return PAD.top + plotH - (value / maxValue.value) * plotH
}

const baselineY = PAD.top + plotH
function groupX(index: number): number {
  return PAD.left + index * groupW.value
}
function centerX(index: number): number {
  return PAD.left + groupW.value * (index + 0.5)
}

function tipStyle(index: number): Record<string, string> {
  const row = display.value[index]!
  const topY = Math.min(scaleY(row.incomeRial), scaleY(row.expenseRial))
  return {
    left: `${(centerX(index) / W) * 100}%`,
    top: `${(topY / H) * 100}%`,
    transform: 'translate(-50%, calc(-100% - 10px))',
  }
}

watch(
  () => props.series,
  () => {
    hover.value = null
  },
)
</script>

<style scoped>
.cbw__stage {
  position: relative;
}

.cbw__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.cbw__base {
  stroke: color-mix(in srgb, var(--asa-label) 20%, transparent);
  stroke-width: 1;
}

.cbw__hit {
  fill: transparent;
  cursor: pointer;
}

.cbw__bar {
  transition: opacity 160ms var(--ease-default);
}

.cbw__bar.is-dim {
  opacity: 0.32;
}

.cbw__bar--in {
  fill: var(--asa-green);
}

.cbw__bar--out {
  fill: var(--asa-rose);
}

.cbw__labels {
  position: relative;
  height: 1.25rem;
}

.cbw__labels span {
  position: absolute;
  top: 0.2rem;
  color: var(--asa-label-3);
  font-size: 0.6875rem;
  white-space: nowrap;
  transform: translateX(-50%);
  transition: color 150ms var(--ease-default);
}

.cbw__labels span.is-active {
  color: var(--asa-label);
  font-weight: 700;
}

.cbw__tip {
  position: absolute;
  z-index: 5;
  min-width: 10rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.7rem;
  background: var(--asa-bg-card);
  box-shadow: 0 12px 30px -14px rgba(17, 24, 39, 0.4);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  pointer-events: none;
}

.cbw__tip-title {
  margin-bottom: 0.25rem;
  color: var(--asa-label);
  font-weight: 700;
}

.cbw__tip p {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.12rem 0;
}

.cbw__tip b {
  margin-inline-start: auto;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.cbw__tip-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
}

.cbw__tip-dot--in {
  background: var(--asa-green);
}

.cbw__tip-dot--out {
  background: var(--asa-rose);
}
</style>
