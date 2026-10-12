<template>
  <div class="app-shell">
    <!-- Desk / large-screen rail -->
    <aside class="app-rail">
      <div class="app-rail__brand">
        <span class="app-rail__mark">
          <Icon name="lucide:activity" size="22" />
        </span>
        <span class="app-rail__brand-copy">
          <b>کلینیک هستی حسینی</b>
          <span>پنل همراه</span>
        </span>
      </div>

      <nav class="app-rail__nav" aria-label="ناوبری اصلی">
        <NuxtLink
          v-for="item in APP_NAV"
          :key="item.path"
          :to="item.path"
          class="app-rail-link"
          :class="{ active: isActive(item.path) }"
        >
          <Icon :name="item.icon" size="20" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="app-rail__spacer" />

      <div v-if="user" class="app-rail__user">
        <span class="app-avatar" style="width: 38px; height: 38px; font-size: 13px;">{{ initials }}</span>
        <span style="min-width: 0;">
          <span style="display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ user.fullName }}</span>
          <span style="font-size: 11.5px;" class="app-muted">{{ roleLabel }}</span>
        </span>
      </div>
    </aside>

    <!-- Main column -->
    <div class="app-frame">
      <header class="app-topbar">
        <NuxtLink v-if="backTo" :to="backTo" class="app-topbar__btn" aria-label="بازگشت">
          <Icon name="lucide:arrow-right" size="22" />
        </NuxtLink>

        <div class="app-topbar__title">
          <h1>{{ pageTitle }}</h1>
          <span v-if="pageSubtitle">{{ pageSubtitle }}</span>
        </div>

        <button
          type="button"
          class="app-topbar__btn"
          :aria-label="isDark ? 'حالت روشن' : 'حالت تیره'"
          @click="toggleTheme"
        >
          <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" size="20" />
        </button>

        <button type="button" class="app-topbar__btn" aria-label="خروج" @click="onLogout">
          <Icon name="lucide:log-out" size="20" />
        </button>
      </header>

      <main class="app-content">
        <div class="app-content__inner">
          <slot />
        </div>
      </main>

      <AppBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/app-shell.css'
import { APP_NAV } from '~/data/appNav'

const route = useRoute()
const { user, logout } = useAuth()
const { isDark, toggleTheme, initTheme } = useThemeMode()
const { init: initPwaApp } = usePwaApp()

const pageTitle = computed(() => String(route.meta.appTitle || 'کلینیک هستی حسینی'))
const pageSubtitle = computed(() => (route.meta.appSubtitle ? String(route.meta.appSubtitle) : ''))
const backTo = computed(() => (route.meta.appBack ? String(route.meta.appBack) : ''))

const initials = computed(() => (user.value?.fullName || '').trim().slice(0, 2) || '؟')
const roleLabel = computed(() => {
  const map: Record<string, string> = {
    admin_doctor: 'مدیر کلینیک',
    doctor: 'پزشک',
    lab: 'آزمایشگاه',
    pharmacy: 'داروخانه',
    patient: 'بیمار',
  }
  return map[user.value?.role || ''] || 'کاربر'
})

const isActive = (path: string) => {
  if (path === '/app') return route.path === '/app'
  return route.path.startsWith(path)
}

const onLogout = () => void logout()

onMounted(() => {
  initPwaApp()
  initTheme()
})

useHead({
  titleTemplate: (title) => (title ? `${title} | هستی حسینی` : 'کلینیک هستی حسینی'),
  htmlAttrs: { dir: 'rtl', lang: 'fa' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
  ],
  bodyAttrs: { style: 'overscroll-behavior: none; background: var(--app-bg);' },
})
</script>
