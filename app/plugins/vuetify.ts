import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      themes: {
        light: {
          colors: {
            background: '#EEEEEE',
            surface: '#ffffff',
            'surface-bright': '#ffffff',
            'surface-light': '#f6f6f6',
            'surface-variant': '#eceef0',
            'on-surface-variant': '#393e46',
            primary: '#5f8feb',
            'primary-darken-1': '#009CA3',
            secondary: '#393E46',
            'secondary-darken-1': '#222831',
            error: '#dc2626',
            info: '#5f8feb',
            success: '#059669',
            warning: '#d97706',
          },
        },
        dark: {
          colors: {
            background: '#222831',
            surface: '#393E46',
            'surface-bright': '#4b525e',
            'surface-light': '#2f353d',
            'surface-variant': '#444a55',
            'on-surface-variant': '#eeeeee',
            primary: '#5f8feb',
            'primary-darken-1': '#00C2CB',
            secondary: '#EEEEEE',
            'secondary-darken-1': '#ffffff',
            error: '#f87171',
            info: '#5f8feb',
            success: '#4ade80',
            warning: '#fbbf24',
          },
        },
      },
    },
  })
  app.vueApp.use(vuetify)
})
