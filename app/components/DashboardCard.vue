<template>
  <v-card class="crm-stat-card flex! items-center! gap-4! p-5!" :class="colorClass">
    <div v-if="$slots.icon" class="shrink-0">
      <slot name="icon" />
    </div>
    <div>
      <div class="crm-stat-value text-xl!">{{ value }}</div>
      <div class="crm-stat-label mb-0!">{{ title }}</div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  color?: string
}>()

const colorMap: Record<string, string> = {
  blue: 'bg-electric-sapphire! text-white! [&_.crm-stat-value]:text-white! [&_.crm-stat-label]:text-white/80!',
  green: 'bg-emerald-600! text-white! [&_.crm-stat-value]:text-white! [&_.crm-stat-label]:text-white/80!',
  red: 'bg-red-600! text-white! [&_.crm-stat-value]:text-white! [&_.crm-stat-label]:text-white/80!',
  orange: 'bg-amber-500! text-white! [&_.crm-stat-value]:text-white! [&_.crm-stat-label]:text-white/80!',
}

const colorClass = computed(() => colorMap[props.color || ''] || '')
</script>
