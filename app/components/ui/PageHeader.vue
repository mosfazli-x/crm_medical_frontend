<template>
  <header class="crm-page-header">
    <div>
      <h1 class="crm-page-title">{{ title }}</h1>
      <p v-if="subtitle" class="crm-page-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
    <div v-if="$slots.badge" class="shrink-0">
      <slot name="badge" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
