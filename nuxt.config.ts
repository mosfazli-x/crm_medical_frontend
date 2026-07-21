import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },

  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3101/api/**' },
    },
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

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
    './app/assets/css/landing-page.css'
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    'vue-sonner/nuxt',
    '@nuxt/icon',
    '@vueuse/motion/nuxt',
  ],

})