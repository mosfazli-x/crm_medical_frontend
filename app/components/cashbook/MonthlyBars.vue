<template>
  <div class="cbm">
    <div class="cbm__legend">
      <span><i class="cbm__key cbm__key--in" />{{ t('cashbook.income') }}</span>
      <span><i class="cbm__key cbm__key--out" />{{ t('cashbook.expense') }}</span>
      <span><i class="cbm__key cbm__key--net" />{{ t('cashbook.net') }}</span>
    </div>

    <div class="cbm__stage">
        <svg class="cbm__svg" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="chartLabel">
        <g class="cbm__grid">
          <template v-for="tick in ticks" :key="tick.value">
            <line :x1="PAD.left" :x2="W - PAD.right" :y1="tick.y" :y2="tick.y" />
            <text :x="PAD.left - 10" :y="tick.y + 4" class="cbm__axis" text-anchor="end" dir="ltr">
              {{ tick.label }}
            </text>
          </template>
        </g>

        <line class="cbm__base" :x1="PAD.left" :x2="W - PAD.right" :y1="baselineY" :y2="baselineY" />

        <g v-for="(row, index) in display" :key="row.key">
          <rect
            class="cbm__hit"
            :x="groupX(index)"
            :y="PAD.top"
            :width="groupW"
            :height="plotH"
            tabindex="-1"
            @mouseenter="hover = index"
            @mouseleave="hover = null"
            @focus="hover = index"
            @blur="hover = null"
          />
          <rect
            class="cbm__bar cbm__bar--in"
            :class="{ 'is-dim': hover !== null && hover !== index }"
            :x="centerX(index) - barW - BAR_GAP / 2"
            :y="Math.min(scaleY(cost(row.incomeRial)), baselineY)"
            :width="barW"
            :height="Math.max(1, Math.abs(baselineY - scaleY(cost(row.incomeRial))))"
            rx="3"
          />
          <rect
            class="cbm__bar cbm__bar--out"
            :class="{ 'is-dim': hover !== null && hover !== index }"
            :x="centerX(index) + BAR_GAP / 2"
            :y="Math.min(scaleY(cost(row.expenseRial)), baselineY)"
            :width="barW"
            :height="Math.max(1, Math.abs(baselineY - scaleY(cost(row.expenseRial))))"
            rx="3"
          />
          <text
            class="cbm__xlabel"
            :class="{ 'is-active': hover === index }"
            :x="centerX(index)"
            :y="H - PAD.bottom + 20"
            text-anchor="middle"
          >
            {{ row.short }}
          </text>
        </g>

        <polyline class="cbm__net" :points="netPoints" fill="none" vector-effect="non-scaling-stroke" />

        <g v-if="hover !== null && display[hover]">
          <circle
            class="cbm__node"
            :cx="centerX(hover)"
            :cy="scaleY(cost(display[hover]!.netRial))"
            r="4"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>

      <div
        v-if="hover !== null && display[hover]"
        class="cbm__tip"
        :style="tipStyle(hover)"
      >
        <p class="cbm__tip-title">{{ display[hover]!.label }}</p>
        <p><span class="cbm__tip-dot cbm__tip-dot--in" />{{ t('cashbook.income') }}<b dir="ltr">{{ format(display[hover]!.incomeRial) }}</b></p>
        <p><span class="cbm__tip-dot cbm__tip-dot--out" />{{ t('cashbook.expense') }}<b dir="ltr">{{ format(display[hover]!.expenseRial) }}</b></p>
        <p><span class="cbm__tip-dot cbm__tip-dot--net" />{{ t('cashbook.net') }}<b dir="ltr">{{ format(display[hover]!.netRial) }}</b></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CashbookMonthlyPoint } from '~/composables/useFinance'

const props = defineProps<{
  series: CashbookMonthlyPoint[]
  format: (value: string | number | null | undefined) => string
  chartLabel: string
}>()

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'fa')
const display = computed(() => (isRtl.value ? [...props.series].reverse() : props.series))

const W = 760
const H = 320
const PAD = { top: 24, right: 18, bottom: 52, left: 56 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom
const BAR_GAP = 3

const hover = ref<number | null>(null)

const groupW = computed(() => (display.value.length ? plotW / display.value.length : plotW))
const barW = computed(() => Math.max(5, Math.min(18, groupW.value * 0.28)))

const compactFormat = computed(
  () => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }),
)

function cost(value: string): number {
  return Number(value) / 10
}

const domain = computed(() => {
  let max = 0
  let min = 0
  for (const row of display.value) {
    max = Math.max(max, Number(row.incomeRial) / 10, Number(row.expenseRial) / 10, Number(row.netRial) / 10)
    min = Math.min(min, Number(row.netRial) / 10)
  }
  return { max: niceCeil(max), min: min < 0 ? -niceCeil(-min) : 0 }
})

function niceCeil(value: number): number {
  if (value <= 0) return 1
  const base = Math.pow(10, Math.floor(Math.log10(value)))
  const ratio = value / base
  const step = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10
  return step * base
}

const ticks = computed(() => {
  const { min, max } = domain.value
  const divisions = 4
  return Array.from({ length: divisions + 1 }, (_, index) => {
    const value = min + ((max - min) * index) / divisions
    return { value, y: scaleY(value), label: compactFormat.value.format(value) }
  })
})

function scaleY(value: number): number {
  const { min, max } = domain.value
  const span = max - min || 1
  return PAD.top + plotH - ((value - min) / span) * plotH
}

const baselineY = computed(() => scaleY(clamp(0, domain.value.min, domain.value.max)))

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function groupX(index: number): number {
  return PAD.left + index * groupW.value
}

function centerX(index: number): number {
  return PAD.left + groupW.value * (index + 0.5)
}

const netPoints = computed(() =>
  display.value.map((row, index) => `${centerX(index).toFixed(1)},${scaleY(cost(row.netRial)).toFixed(1)}`).join(' '),
)

function tipStyle(index: number): Record<string, string> {
  const leftPct = (centerX(index) / W) * 100
  const row = display.value[index]!
  const topY = Math.min(scaleY(cost(row.incomeRial)), scaleY(cost(row.expenseRial)), scaleY(cost(row.netRial)))
  const topPct = (topY / H) * 100
  return {
    left: `${leftPct}%`,
    top: `${topPct}%`,
    transform: `translate(-50%, calc(-100% - 12px))`,
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
.cbm {
  margin-top: 1rem;
}

.cbm__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
}

.cbm__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.cbm__key {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 0.15rem;
}

.cbm__key--in {
  background: var(--asa-green);
}

.cbm__key--out {
  background: var(--asa-rose);
}

.cbm__key--net {
  background: var(--asa-accent-deep);
}

.dark .cbm__key--net {
  background: var(--asa-accent);
}

.cbm__stage {
  position: relative;
  margin-top: 0.5rem;
}

.cbm__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.cbm__grid line {
  stroke: var(--asa-sep);
  stroke-width: 1;
}

.cbm__base {
  stroke: color-mix(in srgb, var(--asa-label) 22%, transparent);
  stroke-width: 1;
}

.cbm__axis {
  fill: var(--asa-label-3);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.cbm__xlabel {
  fill: var(--asa-label-3);
  font-size: 12px;
  transition: fill 150ms var(--ease-default);
}

.cbm__xlabel.is-active {
  fill: var(--asa-label);
  font-weight: 700;
}

.cbm__hit {
  fill: transparent;
  cursor: pointer;
  outline: none;
}

.cbm__bar {
  transition: opacity 160ms var(--ease-default);
}

.cbm__bar.is-dim {
  opacity: 0.32;
}

.cbm__bar--in {
  fill: var(--asa-green);
}

.cbm__bar--out {
  fill: var(--asa-rose);
}

.cbm__net {
  stroke: var(--asa-accent-deep);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dark .cbm__net {
  stroke: var(--asa-accent);
}

.cbm__node {
  fill: var(--asa-bg-card);
  stroke: var(--asa-accent-deep);
  stroke-width: 2.5;
}

.dark .cbm__node {
  stroke: var(--asa-accent);
}

.cbm__tip {
  position: absolute;
  z-index: 5;
  min-width: 11rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.75rem;
  background: var(--asa-bg-card);
  box-shadow: 0 12px 30px -14px rgba(17, 24, 39, 0.4);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  pointer-events: none;
}

.cbm__tip-title {
  margin-bottom: 0.3rem;
  color: var(--asa-label);
  font-weight: 700;
}

.cbm__tip p {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.15rem 0;
}

.cbm__tip b {
  margin-inline-start: auto;
  color: var(--asa-label);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cbm__tip-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
}

.cbm__tip-dot--in {
  background: var(--asa-green);
}

.cbm__tip-dot--out {
  background: var(--asa-rose);
}

.cbm__tip-dot--net {
  background: var(--asa-accent-deep);
}
</style>
