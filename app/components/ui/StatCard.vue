<template>
  <div class="crm-stat-card">
    <div class="flex justify-between items-start">
      <div>
        <div class="crm-stat-label">{{ label }}</div>
        <div class="crm-stat-value" :class="valueClass">
          <slot name="value">{{ value }}</slot>
        </div>
      </div>
      <div v-if="$slots.icon" class="p-3">
        <slot name="icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  valueClass?: string
}>()
</script>
