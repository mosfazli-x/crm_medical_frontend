<template>
  <div class="cbd">
    <div class="cbd__stage">
      <svg class="cbd__svg" viewBox="0 0 140 140" role="img" :aria-label="chartLabel">
        <circle class="cbd__track" cx="70" cy="70" :r="R" fill="none" :stroke-width="STROKE" />
        <circle
          v-for="arc in arcs"
          :key="arc.id"
          class="cbd__arc"
          :class="{ 'is-dim': hover !== null && hover !== arc.id }"
          cx="70"
          cy="70"
          :r="R"
          fill="none"
          :stroke="arc.color"
          :stroke-width="hover === arc.id ? STROKE + 5 : STROKE"
          :stroke-dasharray="`${arc.dash} ${arc.gap}`"
          :stroke-dashoffset="arc.offset"
          stroke-linecap="butt"
          transform="rotate(-90 70 70)"
          @mouseenter="hover = arc.id"
          @mouseleave="hover = null"
        />
      </svg>
      <div class="cbd__center">
        <template v-if="active">
          <span class="cbd__center-name">{{ active.name }}</span>
          <span class="cbd__center-value" dir="ltr">{{ format(active.value) }}</span>
          <span class="cbd__center-pct" dir="ltr">{{ active.percent }}</span>
        </template>
        <template v-else>
          <span class="cbd__center-name">{{ t('cashbook.total') }}</span>
          <span class="cbd__center-value" dir="ltr">{{ format(totalRial) }}</span>
        </template>
      </div>
    </div>

    <ul v-if="arcs.length" class="cbd__legend">
      <li
        v-for="arc in arcs"
        :key="arc.id"
        :class="{ 'is-dim': hover !== null && hover !== arc.id }"
        @mouseenter="hover = arc.id"
        @mouseleave="hover = null"
      >
        <span class="cbd__swatch" :style="{ background: arc.color }" />
        <span class="cbd__name">{{ arc.name }}</span>
        <span class="cbd__value" dir="ltr">{{ format(arc.value) }}</span>
        <span class="cbd__pct" dir="ltr">{{ arc.percent }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  slices: Array<{ id: string; name: string; value: string; color: string | null }>
  format: (value: string | number | null | undefined) => string
  chartLabel: string
}>()

const { t, locale } = useI18n()

const R = 52
const STROKE = 16
const CIRCUMFERENCE = 2 * Math.PI * R

const FALLBACK = ['#7ba7f7', '#5fae7f', '#c9954d', '#d97878', '#7f86d9', '#17c9cf', '#e08bd0', '#8fbf6f']

const hover = ref<string | null>(null)

const percentFormat = computed(
  () => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }),
)

const items = computed(() =>
  props.slices
    .map((slice, index) => ({
      id: slice.id,
      name: slice.name,
      valueRial: Number(slice.value) || 0,
      color: slice.color || FALLBACK[index % FALLBACK.length]!,
    }))
    .filter((slice) => slice.valueRial > 0)
    .sort((a, b) => b.valueRial - a.valueRial),
)

const totalValue = computed(() => items.value.reduce((sum, slice) => sum + slice.valueRial, 0))
const totalRial = computed(() => props.slices.reduce((sum, slice) => sum + (Number(slice.value) || 0), 0))

const arcs = computed(() => {
  let acc = 0
  return items.value.map((slice) => {
    const fraction = totalValue.value ? slice.valueRial / totalValue.value : 0
    const dash = fraction * CIRCUMFERENCE
    const arc = {
      id: slice.id,
      name: slice.name,
      value: String(slice.valueRial),
      color: slice.color,
      dash: dash.toFixed(2),
      gap: (CIRCUMFERENCE - dash).toFixed(2),
      offset: (-acc).toFixed(2),
      percent: percentFormat.value.format(fraction),
    }
    acc += dash
    return arc
  })
})

const active = computed(() => arcs.value.find((arc) => arc.id === hover.value) || null)

watch(
  () => props.slices,
  () => {
    hover.value = null
  },
)
</script>

<style scoped>
.cbd {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.cbd__stage {
  position: relative;
  width: min(11rem, 60%);
  aspect-ratio: 1;
  margin: 0 auto;
}

.cbd__svg {
  display: block;
  width: 100%;
  height: 100%;
  transform: scaleX(1);
}

.cbd__track {
  stroke: var(--asa-track);
}

.cbd__arc {
  cursor: pointer;
  transition: stroke-width 160ms var(--ease-default), opacity 160ms var(--ease-default);
}

.cbd__arc.is-dim {
  opacity: 0.35;
}

.cbd__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  padding: 0 1.2rem;
  text-align: center;
  pointer-events: none;
}

.cbd__center-name {
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
}

.cbd__center-value {
  color: var(--asa-label);
  font-size: 0.875rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}

.cbd__center-pct {
  color: var(--asa-accent-deep);
  font-size: 0.6875rem;
  font-weight: 700;
}

.dark .cbd__center-pct {
  color: var(--asa-accent);
}

.cbd__legend {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cbd__legend li {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.4rem;
  border-radius: 0.55rem;
  transition: background-color 140ms var(--ease-default), opacity 140ms var(--ease-default);
}

.cbd__legend li.is-dim {
  opacity: 0.4;
}

.cbd__legend li:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.cbd__swatch {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 0.2rem;
}

.cbd__name {
  overflow: hidden;
  color: var(--asa-label);
  font-size: 0.75rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbd__value {
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
}

.cbd__pct {
  min-width: 2.6rem;
  color: var(--asa-label-3);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  text-align: end;
}
</style>
