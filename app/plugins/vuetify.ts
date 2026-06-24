import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      themes: {
        light: {
          colors: {
            background: '#f8fafc',
            surface: '#ffffff',
            primary: '#5465ff',
            secondary: '#788bff',
            error: '#ef4444',
            info: '#3b82f6',
            success: '#22c55e',
            warning: '#f59e0b',
          },
        },
        dark: {
          colors: {
            background: '#0f172a',
            surface: '#1e293b',
            primary: '#788bff',
            secondary: '#9bb1ff',
            error: '#f87171',
            info: '#60a5fa',
            success: '#4ade80',
            warning: '#fbbf24',
          },
        },
      },
    },
  })
  app.vueApp.use(vuetify)
})
