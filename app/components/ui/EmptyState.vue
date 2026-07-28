<template>
  <div class="crm-empty" role="status">
    <div class="crm-empty-icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <h3 class="crm-empty-title">{{ title }}</h3>
    <p v-if="description" class="crm-empty-desc">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
