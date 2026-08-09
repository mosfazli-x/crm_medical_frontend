import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },

  runtimeConfig: {
    public: {
      // apiBase: 'https://crmapi.ladiesneeds.com',
      apiBase: ''
    },
  },
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3001/api/**' },
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
    },
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  components: [
    { path: '~/components/miniapp', pathPrefix: false },
    '~/components',
  ],

  pageTransition: {
    name: 'page',
    mode: 'out-in',
  },

  vite: {
    optimizeDeps: {
      include: ['@fullcalendar/core', '@fullcalendar/vue3']
    },
    plugins: [
      vuetify({ autoImport: true }),
      tailwindcss(),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  css: [
    './app/assets/css/tailwind.css',
    './app/assets/css/fonts.css',
    './app/assets/css/main.css',
    './app/assets/css/design-system.css',
    './app/assets/css/landing-page.css',
    './app/assets/css/immersive.css',
    './app/assets/css/scroll-story.css',
    'driver.js/dist/driver.css'
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    'vue-sonner/nuxt',
    '@nuxt/icon',
    '@vueuse/motion/nuxt',
    '@nuxtjs/i18n',
  ],

  icon: {
    localApiEndpoint: '/nuxt_icon',
  },

  i18n: {
    locales: [
      { code: 'fa', name: 'فارسی', file: 'fa.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'fa',
    lazy: true,
    langDir: '../locales',
    strategy: 'no_prefix',
    experimental: {
      localeDetector: 'localeDetector.ts',
    },
    detectBrowserLanguage: false,
  },

})