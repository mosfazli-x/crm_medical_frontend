<template>
  <nav class="app-bottomnav" aria-label="ناوبری اصلی">
    <NuxtLink
      v-for="item in APP_NAV"
      :key="item.path"
      :to="item.path"
      class="app-bottomnav__item"
      :class="{ active: isActive(item.path) }"
    >
      <Icon :name="item.icon" size="22" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { APP_NAV } from '~/data/appNav'

const route = useRoute()

const isActive = (path: string) => {
  if (path === '/app') return route.path === '/app'
  if (path === '/app/finance' && route.path === '/app/daily-reports') return true
  return route.path.startsWith(path)
}
</script>
