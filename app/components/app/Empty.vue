<template>
  <div class="app-empty">
    <span class="app-empty__icon"><Icon :name="icon" size="24" /></span>
    <p>{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    text: string
  }>(),
  { icon: 'lucide:inbox' },
)
</script>
