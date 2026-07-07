<template>
  <div class="crm-card" :class="cardClass">
    <div v-if="title || $slots.header" class="crm-card-header">
      <h2 v-if="title" class="crm-card-title">{{ title }}</h2>
      <slot name="header" />
      <slot name="headerAction" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  cardClass?: string
}>()
</script>
