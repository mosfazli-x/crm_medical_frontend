<template>
  <div class="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
    <span class="text-sm font-medium" :class="labelClass">{{ label }}</span>
    <span class="text-lg font-black" :class="valueClass">{{ displayValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number
  highlight?: boolean
  muted?: boolean
}>()

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n)
}

const labelClass = computed(() => {
  if (props.highlight) return 'text-electric-sapphire dark:text-cornflower-blue font-bold'
  if (props.muted) return 'text-slate-400 dark:text-slate-500'
  return 'text-slate-600 dark:text-slate-400'
})

const valueClass = computed(() => {
  if (props.highlight) return 'text-electric-sapphire dark:text-cornflower-blue'
  if (props.muted) return 'text-slate-400 dark:text-slate-500'
  return 'text-slate-800 dark:text-slate-100'
})

const displayValue = computed(() => formatNumber(props.value))
</script>
