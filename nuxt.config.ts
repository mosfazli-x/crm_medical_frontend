import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001', // پورت Fastify شما
    },
  },
  // اگر CORS داری (در توسعه محلی)
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3001/api/**' }, // پروکسی اختیاری
    },
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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
  css: ['./app/assets/css/tailwind.css', './app/assets/css/fonts.css', './app/assets/css/main.css'],

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    'vue-sonner/nuxt'
  ],

})