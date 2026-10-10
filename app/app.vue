<template>
  <NuxtLayout>
    <VitePwaManifest />
    <Toaster :toastOptions="toastOptions" richColors position="top-right" :close-button=true closeButtonPosition="top-left" />
    <NuxtLoadingIndicator color="#5f8feb" :height="3"/>
    <NuxtPage />
    <PwaInstallPrompt />
    <PwaStatus />
  </NuxtLayout>
</template>

<script setup>
const { locale } = useI18n()

const toastOptions = computed(() => ({
  style: {
    fontFamily: locale.value === 'fa'
      ? 'IRANSansX, AriaWeb, sans-serif'
      : 'Karla, ui-sans-serif, system-ui, sans-serif',
    direction: locale.value === 'fa' ? 'rtl' : 'ltr',
    gap: '12px',
  },
  class: 'toast',
  descriptionClass: 'my-toast-description',
}))

useHead({
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr')),
  },
  meta: [
    { name: 'theme-color', content: '#1e3754' },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'application-name', content: 'کلینیک هستی حسینی' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'هستی حسینی' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'msapplication-TileColor', content: '#1e3754' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap',
    },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  ],
  script: [
    {
      innerHTML: `
        if (!globalThis.crypto) globalThis.crypto = {};
        if (!globalThis.crypto.randomUUID) {
          globalThis.crypto.randomUUID = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
        }
      `,
    },
  ],
})

const { isAuthenticated } = useAuth()

</script>
