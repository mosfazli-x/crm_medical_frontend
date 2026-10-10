import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },

  runtimeConfig: {
    public: {
      // apiBase: 'https://crmapi.ladiesneeds.com',
      // apiBase: 'http://5.144.134.16:2004',
      apiBase: '',
      // Overridable via NUXT_PUBLIC_NESHAN_MAP_KEY
      neshanMapKey: ''
    },
  },
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3001/api/**' },
      // '/api/**': { proxy: 'http://localhost:3001/api/**' },
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
    '@vite-pwa/nuxt',
  ],

  icon: {
    localApiEndpoint: '/nuxt_icon',
  },

  pwa: {
    registerType: 'prompt',
    // The install UX is a bespoke in-app dialog (see PwaInstallPrompt.vue),
    // so the module's own install widget stays disabled.
    client: {
      installPrompt: false,
    },
    manifest: {
      id: '/',
      name: 'کلینیک هستی حسینی | Hasti Hoseini Clinic',
      short_name: 'هستی حسینی',
      description: 'کلینیک تخصصی پزشکی و زیبایی بانوان دکتر هستی حسینی — رزرو نوبت، پرونده پزشکی و مدیریت درمانگاه.',
      lang: 'fa',
      dir: 'rtl',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
      orientation: 'portrait-primary',
      theme_color: '#1e3754',
      background_color: '#ffffff',
      categories: ['health', 'medical', 'lifestyle'],
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      shortcuts: [
        {
          name: 'داشبورد',
          short_name: 'داشبورد',
          description: 'پنل مدیریت کلینیک',
          url: '/dashboard',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'رزرو نوبت',
          short_name: 'رزرو',
          description: 'رزرو نوبت آنلاین',
          url: '/booking',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'وب‌سایت کلینیک',
          short_name: 'وب‌سایت',
          description: 'معرفی کلینیک و خدمات',
          url: '/landing',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
      ],
    },
    workbox: {
      // Only shell assets are precached; media is cached on demand at runtime
      // so the install stays small and the first paint stays fast.
      globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2,ttf,eot,webmanifest}'],
      globIgnores: [
        '**/background-videos/**',
        '**/audio/**',
        '**/images/**',
        '**/*.{mp4,webm,mp3,jpg,jpeg,png,webp,avif}',
      ],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//, /^\/nuxt_icon/, /_payload\.json$/],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: ({ url, request }) =>
            request.method === 'GET' && url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-responses',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [200] },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'font',
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts',
            expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-stylesheets' },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module',
      navigateFallback: '/',
    },
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