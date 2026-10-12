<template>
  <NuxtLink :to="to" class="app-tile">
    <span class="app-tile__icon" :class="`app-tile__tint-${tint}`">
      <Icon :name="icon" size="24" />
    </span>
    <span class="app-tile__body">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </span>
    <Icon class="app-tile__go" name="lucide:arrow-left" size="18" />
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    to: string
    title: string
    description?: string
    icon: string
    tint?: 'green' | 'indigo' | 'amber' | 'rose'
  }>(),
  {
    description: '',
    tint: 'green',
  },
)
</script>
