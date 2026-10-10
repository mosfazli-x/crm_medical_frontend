<template>
  <svg
    class="cbspk"
    :class="`cbspk--${tone}`"
    :viewBox="viewBox"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" class="cbspk__stop-top" />
        <stop offset="100%" class="cbspk__stop-bottom" />
      </linearGradient>
    </defs>
    <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradientId})`" />
    <path
      v-if="linePath"
      :d="linePath"
      class="cbspk__line"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    values: number[]
    tone?: 'income' | 'expense' | 'net' | 'neutral'
    height?: number
  }>(),
  { tone: 'neutral', height: 34 },
)

const W = 100
const viewBox = computed(() => `0 0 ${W} ${props.height}`)
const gradientId = `cbspk-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

const geometry = computed(() => {
  const values = props.values.filter((value) => Number.isFinite(value))
  if (values.length < 2) return { linePath: '', areaPath: '' }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.abs(max) || 1
  const padY = 4
  const usable = 100 - padY * 2
  const stepX = 100 / (values.length - 1)
  const points = values.map((value, index) => ({
    x: index * stepX,
    y: padY + (1 - (value - min) / span) * usable,
  }))
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
  const area = `${line} L${points[points.length - 1]!.x.toFixed(2)} 100 L${points[0]!.x.toFixed(2)} 100 Z`
  return { linePath: line, areaPath: area }
})

const linePath = computed(() => geometry.value.linePath)
const areaPath = computed(() => geometry.value.areaPath)
</script>

<style scoped>
.cbspk {
  display: block;
  width: 100%;
  height: 100%;
}

.cbspk__line {
  stroke: var(--asa-label-3);
}

.cbspk--income .cbspk__line {
  stroke: var(--asa-green);
}

.cbspk--expense .cbspk__line {
  stroke: var(--asa-rose);
}

.cbspk--net .cbspk__line {
  stroke: var(--asa-accent-deep);
}

.dark .cbspk--net .cbspk__line {
  stroke: var(--asa-accent);
}

.cbspk__stop-top {
  stop-color: var(--asa-label-3);
  stop-opacity: 0.32;
}

.cbspk__stop-bottom {
  stop-color: var(--asa-label-3);
  stop-opacity: 0;
}

.cbspk--income .cbspk__stop-top {
  stop-color: var(--asa-green);
}

.cbspk--expense .cbspk__stop-top {
  stop-color: var(--asa-rose);
}

.cbspk--net .cbspk__stop-top {
  stop-color: var(--asa-accent-deep);
}
</style>
