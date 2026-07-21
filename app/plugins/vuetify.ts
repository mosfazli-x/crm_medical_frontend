import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      themes: {
        light: {
          colors: {
            background: '#f0f2f5',
            surface: '#ffffff',
            primary: '#4F46E5',
            secondary: '#6366F1',
            error: '#ef4444',
            info: '#3b82f6',
            success: '#22c55e',
            warning: '#f59e0b',
          },
        },
        dark: {
          colors: {
            background: '#0f1117',
            surface: '#1a1c23',
            primary: '#818CF8',
            secondary: '#C7D2FE',
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
