<template>
  <div class="cbt">
    <div class="cbt__head">
      <div class="cbt__legend">
        <template v-if="mode === 'flow'">
          <span><i class="cbt__key cbt__key--in" />{{ t('cashbook.income') }}</span>
          <span><i class="cbt__key cbt__key--out" />{{ t('cashbook.expense') }}</span>
        </template>
        <template v-else>
          <span><i class="cbt__key cbt__key--net" />{{ t('cashbook.netTrend') }}</span>
        </template>
      </div>
      <div class="cbt__toggle" role="tablist" :aria-label="t('cashbook.cashFlow')">
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'flow'"
          :class="{ 'is-on': mode === 'flow' }"
          @click="mode = 'flow'"
        >
          {{ t('cashbook.flowView') }}
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'balance'"
          :class="{ 'is-on': mode === 'balance' }"
          @click="mode = 'balance'"
        >
          {{ t('cashbook.balanceView') }}
        </button>
      </div>
    </div>

    <div class="cbt__stage">
      <svg class="cbt__svg" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="chartLabel">
        <g class="cbt__grid">
          <template v-for="tick in ticks" :key="tick.value">
            <line :x1="PAD.left" :x2="W - PAD.right" :y1="tick.y" :y2="tick.y" />
            <text :x="PAD.left - 10" :y="tick.y + 4" class="cbt__axis" text-anchor="end" dir="ltr">
              {{ tick.label }}
            </text>
          </template>
        </g>

        <line v-if="mode === 'balance'" class="cbt__zero" :x1="PAD.left" :x2="W - PAD.right" :y1="scaleY(0)" :y2="scaleY(0)" />

        <template v-if="mode === 'flow'">
          <path :d="areaPath('income')" class="cbt__area cbt__area--in" />
          <path :d="areaPath('expense')" class="cbt__area cbt__area--out" />
          <path :d="linePath('income')" class="cbt__line cbt__line--in" fill="none" vector-effect="non-scaling-stroke" />
          <path :d="linePath('expense')" class="cbt__line cbt__line--out" fill="none" vector-effect="non-scaling-stroke" />
        </template>
        <template v-else>
          <path :d="balanceArea" class="cbt__area cbt__area--net" />
          <path :d="balanceLine" class="cbt__line cbt__line--net" fill="none" vector-effect="non-scaling-stroke" />
        </template>

        <line
          v-if="hoverIndex !== null"
          class="cbt__cursor"
          :x1="xOf(hoverIndex)"
          :x2="xOf(hoverIndex)"
          :y1="PAD.top"
          :y2="H - PAD.bottom"
        />

        <rect
          class="cbt__hit"
          :x="PAD.left"
          :y="PAD.top"
          :width="plotW"
          :height="plotH"
          @mousemove="onMove"
          @mouseleave="hoverIndex = null"
        />
      </svg>

      <div v-if="hovered" class="cbt__tip" :style="tipStyle">
        <p class="cbt__tip-title">{{ labelFor(hovered.date) }}</p>
        <p><span class="cbt__tip-dot cbt__tip-dot--in" />{{ t('cashbook.income') }}<b dir="ltr">{{ format(hovered.incomeRial) }}</b></p>
        <p><span class="cbt__tip-dot cbt__tip-dot--out" />{{ t('cashbook.expense') }}<b dir="ltr">{{ format(hovered.expenseRial) }}</b></p>
        <p><span class="cbt__tip-dot cbt__tip-dot--net" />{{ t('cashbook.netTrend') }}<b dir="ltr">{{ format(hovered.balanceRial) }}</b></p>
      </div>
    </div>

    <div class="cbt__axis-x">
      <span v-for="tick in xTicks" :key="tick.index" :style="{ insetInlineStart: `${(xOf(tick.index) / W) * 100}%` }">
        {{ tick.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  points: Array<{ date: string; incomeRial: string; expenseRial: string }>
  format: (value: string | number | null | undefined) => string
  labelFor: (date: string) => string
  chartLabel: string
}>()

const { t, locale } = useI18n()

const W = 760
const H = 300
const PAD = { top: 20, right: 18, bottom: 24, left: 56 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

const mode = ref<'flow' | 'balance'>('flow')
const hoverIndex = ref<number | null>(null)

const compactFormat = computed(
  () => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }),
)

const rows = computed(() => {
  let running = 0
  return props.points.map((point) => {
    const income = Number(point.incomeRial) / 10
    const expense = Number(point.expenseRial) / 10
    running += income - expense
    return {
      date: point.date,
      income,
      expense,
      balance: running,
      balanceRial: String(Math.round(running * 10)),
      incomeRial: point.incomeRial,
      expenseRial: point.expenseRial,
    }
  })
})

const hovered = computed(() => (hoverIndex.value === null ? null : rows.value[hoverIndex.value] || null))

function niceCeil(value: number): number {
  if (value <= 0) return 1
  const base = Math.pow(10, Math.floor(Math.log10(value)))
  const ratio = value / base
  const step = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10
  return step * base
}

const domain = computed(() => {
  const values = rows.value
  if (mode.value === 'balance') {
    let min = 0
    let max = 0
    for (const row of values) {
      min = Math.min(min, row.balance)
      max = Math.max(max, row.balance)
    }
    return { min: min < 0 ? -niceCeil(-min) : 0, max: niceCeil(max) }
  }
  let max = 0
  for (const row of values) max = Math.max(max, row.income, row.expense)
  return { min: 0, max: niceCeil(max) }
})

function scaleY(value: number): number {
  const { min, max } = domain.value
  const span = max - min || 1
  return PAD.top + plotH - ((value - min) / span) * plotH
}

function xOf(index: number): number {
  const n = rows.value.length
  if (n <= 1) return PAD.left + plotW / 2
  return PAD.left + (plotW * index) / (n - 1)
}

const ticks = computed(() => {
  const { min, max } = domain.value
  const divisions = 4
  return Array.from({ length: divisions + 1 }, (_, index) => {
    const value = min + ((max - min) * index) / divisions
    return { value, y: scaleY(value), label: compactFormat.value.format(value) }
  })
})

function smoothPath(key: 'income' | 'expense' | 'balance'): string {
  const pts = rows.value.map((row, index) => ({ x: xOf(index), y: scaleY(row[key]) }))
  if (pts.length < 2) return ''
  let d = `M${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

function linePath(key: 'income' | 'expense'): string {
  return smoothPath(key)
}

function areaPath(key: 'expense' | 'income'): string {
  const line = smoothPath(key)
  const base = (H - PAD.bottom).toFixed(1)
  const firstX = xOf(0).toFixed(1)
  const lastX = xOf(rows.value.length - 1).toFixed(1)
  return `${line} L${lastX} ${base} L${firstX} ${base} Z`
}

const balanceLine = computed(() => smoothPath('balance'))
const balanceArea = computed(() => {
  const line = balanceLine.value
  const zeroY = scaleY(0).toFixed(1)
  const firstX = xOf(0).toFixed(1)
  const lastX = xOf(rows.value.length - 1).toFixed(1)
  return `${line} L${lastX} ${zeroY} L${firstX} ${zeroY} Z`
})

const xTicks = computed(() => {
  const n = rows.value.length
  if (!n) return []
  const target = Math.min(n, 7)
  const step = Math.max(1, Math.round((n - 1) / (target - 1)) || 1)
  const result: Array<{ index: number; label: string }> = []
  for (let i = 0; i < n; i += step) result.push({ index: i, label: props.labelFor(rows.value[i]!.date) })
  const last = n - 1
  if (result[result.length - 1]?.index !== last) result.push({ index: last, label: props.labelFor(rows.value[last]!.date) })
  return result
})

function onMove(event: MouseEvent) {
  const target = event.currentTarget as SVGRectElement
  const rect = target.getBoundingClientRect()
  if (!rect.width) return
  const x = ((event.clientX - rect.left) / rect.width) * plotW
  const n = rows.value.length
  if (n <= 1) {
    hoverIndex.value = 0
    return
  }
  const index = Math.round((x / plotW) * (n - 1))
  hoverIndex.value = Math.min(n - 1, Math.max(0, index))
}

const tipStyle = computed(() => {
  if (hoverIndex.value === null) return {}
  const leftPct = (xOf(hoverIndex.value) / W) * 100
  const row = rows.value[hoverIndex.value]!
  const topY = Math.min(scaleY(row.income), scaleY(row.expense), mode.value === 'balance' ? scaleY(row.balance) : scaleY(row.income))
  return {
    left: `${Math.min(88, Math.max(12, leftPct))}%`,
    top: `${(topY / H) * 100}%`,
    transform: 'translate(-50%, calc(-100% - 12px))',
  }
})

watch(
  () => props.points,
  () => {
    hoverIndex.value = null
  },
)
</script>

<style scoped>
.cbt {
  margin-top: 1rem;
}

.cbt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cbt__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
}

.cbt__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.cbt__key {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 0.15rem;
}

.cbt__key--in {
  background: var(--asa-green);
}

.cbt__key--out {
  background: var(--asa-rose);
}

.cbt__key--net {
  background: var(--asa-accent-deep);
}

.dark .cbt__key--net {
  background: var(--asa-accent);
}

.cbt__toggle {
  display: inline-flex;
  gap: 0.125rem;
  padding: 0.18rem;
  border-radius: 0.7rem;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
}

.cbt__toggle button {
  border: 0;
  border-radius: 0.55rem;
  padding: 0.3rem 0.6rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.cbt__toggle button.is-on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.cbt__stage {
  position: relative;
  margin-top: 0.5rem;
}

.cbt__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.cbt__grid line {
  stroke: var(--asa-sep);
  stroke-width: 1;
}

.cbt__zero {
  stroke: color-mix(in srgb, var(--asa-label) 22%, transparent);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.cbt__axis {
  fill: var(--asa-label-3);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.cbt__line {
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cbt__line--in {
  stroke: var(--asa-green);
}

.cbt__line--out {
  stroke: var(--asa-rose);
}

.cbt__line--net {
  stroke: var(--asa-accent-deep);
}

.dark .cbt__line--net {
  stroke: var(--asa-accent);
}

.cbt__area {
  stroke: none;
}

.cbt__area--in {
  fill: color-mix(in srgb, var(--asa-green) 18%, transparent);
}

.cbt__area--out {
  fill: color-mix(in srgb, var(--asa-rose) 16%, transparent);
}

.cbt__area--net {
  fill: color-mix(in srgb, var(--asa-accent) 20%, transparent);
}

.cbt__cursor {
  stroke: color-mix(in srgb, var(--asa-label) 30%, transparent);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.cbt__hit {
  fill: transparent;
  cursor: crosshair;
}

.cbt__tip {
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

.cbt__tip-title {
  margin-bottom: 0.3rem;
  color: var(--asa-label);
  font-weight: 700;
}

.cbt__tip p {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.15rem 0;
}

.cbt__tip b {
  margin-inline-start: auto;
  color: var(--asa-label);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cbt__tip-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
}

.cbt__tip-dot--in {
  background: var(--asa-green);
}

.cbt__tip-dot--out {
  background: var(--asa-rose);
}

.cbt__tip-dot--net {
  background: var(--asa-accent-deep);
}

.cbt__axis-x {
  position: relative;
  height: 1rem;
  margin-top: 0.25rem;
}

.cbt__axis-x span {
  position: absolute;
  top: 0;
  color: var(--asa-label-3);
  font-size: 0.625rem;
  white-space: nowrap;
  transform: translateX(-50%);
}
</style>
