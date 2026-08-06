<template>
  <nav class="tg-nav">
    <NuxtLink v-for="item in items" :key="item.path" :to="item.path" class="tg-nav-item" :class="{ active: isActive(item.path) }">
      <Icon :name="item.icon" size="22" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const items = [
  { path: '/tg', label: 'خانه', icon: 'lucide:home' },
  { path: '/tg/book', label: 'رزرو نوبت', icon: 'lucide:calendar' },
  { path: '/tg/appointments', label: 'نوبت‌ها', icon: 'lucide:calendar-days' },
  { path: '/tg/profile', label: 'پروفایل', icon: 'lucide:user' },
]

const isActive = (path: string) => {
  if (path === '/tg') return route.path === '/tg'
  return route.path.startsWith(path)
}
</script>
