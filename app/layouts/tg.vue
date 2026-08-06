<template>
  <div class="tg-app">
    <div class="tg-phone">
      <div class="tg-status-bar" />
      <main class="tg-scroll">
        <slot />
      </main>
      <TgBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/tg.css'
import { useTelegramApp } from '~/composables/useTelegramApp'

const { setup } = useTelegramApp()
const { hydrate } = useMiniAppAuth()

onMounted(() => {
  hydrate()
  setup()
})

useHead({
  title: 'کلینیک دکتر حسینی',
  htmlAttrs: { dir: 'rtl', lang: 'fa' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
  ],
  bodyAttrs: {
    style: 'overscroll-behavior: none;',
  },
})
</script>
